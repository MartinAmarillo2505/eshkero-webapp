import { getModelsByProductId } from '$lib/server/models.js';
import { getPlatesByModelId } from '$lib/server/plates.js';
import { getProductById } from '$lib/server/products.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const product = await getProductById(params.id);
  if (!product) return error(404, "Producto no encontrado");

  const models = await getModelsByProductId(params.id);
  const plates = await getPlatesByModelId(models[0].id);

  return { product, plates, models };
}