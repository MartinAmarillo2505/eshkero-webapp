import models from "$lib/data/models";
import plates from "$lib/data/plates";
import products from "$lib/data/products";
import type { Actions } from "@sveltejs/kit";

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
  const plates: Record<string, { name: string, thumbnail?: File, objects: number, timeSeconds: number, weightGrams: number }> = {}

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^plate\[(\d+)\]\[(\w+)\]$/);
    if (match) {
      const [index, field] = match.slice(1);
      plates[index] ??= { name: '', objects: 0, timeSeconds: 0, weightGrams: 0 };
      if (field === 'thumbnail') plates[index][field] = value as File;
      else if (field === 'name') plates[index][field] = value as string;
      else if (field === 'objects' || field === 'timeSeconds') plates[index][field] = parseInt(value as string) ?? 0;
      else if (field === 'weightGrams') plates[index][field] = parseFloat(value as string) ?? 0;
    }
  }

  return plates;
}

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();

    const name = formData.get('name') as string | null;
    if (!name) return { error: 'Name is required' };

    const description = formData.get('description') as string | null;
    if (description === null) return { error: 'Description is required' };

    const thumbnail = formData.get('thumbnail') as File | null;
    if (!thumbnail) return { error: 'Thumbnail is required' };

    const price = formData.get('price') as string | null;
    if (price === null) return { error: 'Price is required' };

    let totalTimeSeconds = parseInt(formData.get('timeSeconds') as string ?? '');
    let totalWeightGrams = parseInt(formData.get('weightGrams') as string ?? '');

    const plates = getPlates(formData);
    for (const [key, plate] of Object.entries(plates)) {
      if (!plate.thumbnail) return { error: `Plate ${key} must have a thumbnail` };
      if (!plate.objects) return { error: `Plate ${key} must have at least one object` };
      if (!totalTimeSeconds && !plate.timeSeconds) return { error: `Plate ${key} must have a defined time` };
      if (!totalWeightGrams && !plate.weightGrams) return { error: `Plate ${key} must have a defined weight` };
    }

    if (!totalTimeSeconds) totalTimeSeconds = Object.values(plates).reduce((acc, plate) => acc + plate.timeSeconds, 0);
    if (!totalWeightGrams) totalWeightGrams = Object.values(plates).reduce((acc, plate) => acc + plate.weightGrams, 0);

    if (!totalTimeSeconds) return { error: 'Total time is required' };
    if (!totalWeightGrams) return { error: 'Total weight is required' };

    console.log({ name, description, thumbnail, price, totalTimeSeconds, totalWeightGrams, plates });

    return { success: true };
  }
}