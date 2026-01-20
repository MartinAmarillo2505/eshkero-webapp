import { error } from "@sveltejs/kit";

import products from "$lib/data/products";
import plates from "$lib/data/plates";
import models from "$lib/data/models.js";

export async function load({ params }) {
  const product = products.find((product) => product.id === params.id);
  if (!product) error(404, "Producto no encontrado");

  const plateModels = models.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).filter(model => model.productId === product.id)
    .map(model => {
      const printPlates = plates.filter(plate => plate.modelId === model.id);
      return {
        ...model,
        plates: printPlates,
        timeSeconds: printPlates.reduce((acc, plate) => acc + plate.timeSeconds, 0),
        weightGrams: printPlates.reduce((acc, plate) => acc + plate.weightGrams, 0)
      }
    });

  const printPlates = plates.filter((plate) => plate.modelId === plateModels[0]?.id);

  return { product, plates: printPlates, models: plateModels };
}