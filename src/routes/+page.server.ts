import { db } from "$lib/server/db";
import { model, plate, product } from "$lib/server/db/schema";

export async function load() {
  return {
    products: await db.$count(product),
    models: await db.$count(model),
    plates: await db.$count(plate),
  }
}