import { analyze3mfFile } from "$lib/3mf";
import models from "$lib/data/models";
import plates from "$lib/data/plates";
import products from "$lib/data/products";
import { deepMerge } from "$lib/utils";
import { fail, type Actions } from "@sveltejs/kit";

export async function load() {
  return {
    products: products.map(product => {
      const model = models.filter(model => model.productId === product.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).at(0);
      const modelPlates = plates.filter(plate => plate.modelId === model?.id);

      const plateCount = modelPlates.length;
      const timeSeconds = modelPlates.reduce((acc, plate) => acc + plate.timeSeconds, 0);
      const weightGrams = modelPlates.reduce((acc, plate) => acc + plate.weightGrams, 0);

      return {
        ...product,
        plateCount,
        timeSeconds,
        weightGrams
      }
    })
  };
}

function getPlates(formData: FormData) {
  const plates: Record<string, { name: string, timeSeconds: number, weightGrams: number }> = {}

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^plate\[(\d+)\]\[(\w+)\]$/);
    if (match) {
      const [index, field] = match.slice(1);
      plates[index] ??= { name: '', timeSeconds: 0, weightGrams: 0 };
      if (field === 'name') plates[index][field] = value as string;
      else if (field === 'timeSeconds') plates[index][field] = Number(value) || 0;
      else if (field === 'weightGrams') plates[index][field] = Number(value) || 0;
    }
  }

  return plates;
}

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    if (!file) return fail(400, { error: 'File is required' });

    const name = formData.get('name') as string | null;
    if (!name) return fail(400, { error: 'Name is required' });

    const description = formData.get('description') as string | null;
    if (description === null) return fail(400, { error: 'Description is required' });

    const price = formData.get('price') as string | null;
    if (price === null) return fail(400, { error: 'Price is required' });

    let totalTimeSeconds = Number(formData.get('timeSeconds') as string ?? '');
    let totalWeightGrams = Number(formData.get('weightGrams') as string ?? '');

    const plates = getPlates(formData);
    for (const [key, plate] of Object.entries(plates)) {
      if (!totalTimeSeconds && !plate.timeSeconds) return fail(400, { error: `Plate ${key} must have a defined time` });
      if (!totalWeightGrams && !plate.weightGrams) return fail(400, { error: `Plate ${key} must have a defined weight` });
    }

    if (!totalTimeSeconds) totalTimeSeconds = Object.values(plates).reduce((acc, plate) => acc + plate.timeSeconds, 0);
    if (!totalWeightGrams) totalWeightGrams = Object.values(plates).reduce((acc, plate) => acc + plate.weightGrams, 0);

    if (!totalTimeSeconds) return fail(400, { error: 'Total time is required' });
    if (!totalWeightGrams) return fail(400, { error: 'Total weight is required' });

    const useFileThumbnail = formData.get('useFileThumbnail') as string | null;

    const { thumbnail: _3mfThumbnail, fileThumbnail: _3mfFileThumbnail, ..._3mf } = await analyze3mfFile(await file.arrayBuffer());
    const thumbnail = useFileThumbnail === 'on' ? _3mfFileThumbnail : _3mfThumbnail;
    if (!thumbnail) return fail(400, { error: 'Thumbnail is required' });

    const product = deepMerge(_3mf, { name, description, thumbnail, price: Number(price) || null, totalTimeSeconds, totalWeightGrams, plates });

    console.log(product);

    return { success: true };
  }
}