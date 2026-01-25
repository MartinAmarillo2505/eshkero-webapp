import { analyze3mfFile } from "$lib/3mf";
import { createProduct, searchProducts } from "$lib/server/products";
import { fail, type Actions } from "@sveltejs/kit";

export async function load({ url }) {
  const query = url.searchParams.get('q') || undefined;
  return { products: await searchProducts({ query }) }
}

function getPlates(formData: FormData) {
  const plates: Record<string, { name: string, timeSeconds: number, weightGrams: number, filaments: Record<string, { color: string, type: string }> }> = {}

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^plate\[(\d+)\]\[(\w+)\]$/);
    if (match) {
      const [index, field] = match.slice(1);
      plates[index] ??= { name: '', timeSeconds: 0, weightGrams: 0, filaments: {} };
      if (field === 'name') plates[index][field] = value as string;
      else if (field === 'timeSeconds') plates[index][field] = Number(value) || 0;
      else if (field === 'weightGrams') plates[index][field] = Number(value) || 0;
      else if (field === 'filaments') plates[index][field] = JSON.parse(value as string);
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

    const categories = formData.get("categories") as string | null;

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
    const thumbnail = useFileThumbnail === 'on' ? await _3mfFileThumbnail : await _3mfThumbnail;
    if (!thumbnail) return fail(400, { error: 'Thumbnail is required' });


    const product = {
      file,
      name: _3mf.name || name,
      description,
      thumbnail,
      categories: categories?.split(' ') || [],
      price: Number(price) || undefined,
      timeSeconds: totalTimeSeconds,
      weightGrams: totalWeightGrams,
      plates: await Promise.all(Object.entries(plates).map(async ([k, v]) => {
        const plate = { ..._3mf.plates[k], ...v };
        return { ...plate, thumbnail: await plate.thumbnail!, filaments: Object.values(plate.filaments) }
      }))
    };

    await createProduct(product);

    return { success: true };
  }
}