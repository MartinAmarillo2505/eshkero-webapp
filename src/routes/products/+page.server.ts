import products from "$lib/data/products";
import models from "$lib/data/models";
import plates from "$lib/data/plates";

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