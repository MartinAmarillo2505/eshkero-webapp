import { aliasedTable, and, asc, desc, eq, or, sql } from "drizzle-orm";
import { db } from "./db";
import { model, plate, product, staticFile } from "./db/schema";
import { uploadFile, uploadOptimizedImage } from "./uploads";

type CreateProductArgs = {
  file: File;
  name: string;
  description: string;
  thumbnail: File;
  categories: string[];
  price?: number;
  timeSeconds?: number;
  weightGrams?: number;
  plates: {
    name: string;
    thumbnail: File;
    timeSeconds: number;
    weightGrams: number;
    objects: number;
    filaments: {
      color: string;
      type: string;
    }[];
  }[];
};

export async function createProduct({ file, name, description, thumbnail, categories, price, timeSeconds, weightGrams, plates }: CreateProductArgs) {
  return await db.transaction(async (tx) => {
    // Upload Product
    const [productRow] = await tx.insert(product).values({ name, description, categories, price }).returning();

    // Upload model
    // TODO: move to models.ts
    const modelThumbnail = await uploadOptimizedImage({ file: thumbnail, invoker: tx });
    const modelFile = await uploadFile({ file, invoker: tx, storeFileName: true });
    const [modelRow] = await tx.insert(model).values({
      versionName: "Version 1.0",
      versionNotes: "",
      productId: productRow.id,
      thumbnailId: modelThumbnail.id,
      fileId: modelFile.id,
      timeSeconds,
      weightGrams,
    }).returning();

    // Upload plates
    const plateThumbnails = await Promise.all(plates.map(plate => uploadOptimizedImage({ file: plate.thumbnail, invoker: tx })))
    await tx.insert(plate).values(plates.map((plate, index) => ({
      modelId: modelRow.id,
      name: plate.name,
      thumbnailId: plateThumbnails[index].id,
      timeSeconds: plate.timeSeconds,
      weightGrams: plate.weightGrams,
      objects: plate.objects,
      filaments: plate.filaments,
    })))
  });
}

export async function searchProducts({ query, limit = 10, page = 1 }: { query?: string, limit?: number, page?: number }) {
  const tsQuery = sql`websearch_to_tsquery('spanish', ${query})`;
  const rankScore = sql<number>`ts_rank(${product.searchVector}, ${tsQuery})`;
  const similarityScore = sql<number>`similarity(${product.name}, ${query})`;

  const rows = await db
    .select({
      id: product.id,
      name: product.name,
      description: product.description,
      categories: product.categories,
      price: product.price,
      thumbnailSha1: staticFile.sha1,
      plateCount: sql<number>`coalesce(count(${plate.modelId}), 0)`,
      timeSeconds: sql<number>`coalesce(${model.timeSeconds}, sum(${plate.timeSeconds}), 0)`,
      weightGrams: sql<number>`coalesce(${model.weightGrams}, sum(${plate.weightGrams}), 0)`,
    })
    .from(product)
    .where(query ? or(sql`${product.searchVector} @@ ${tsQuery}`, sql`${similarityScore} > 0`) : sql`true`)
    .limit(limit)
    .offset((page - 1) * limit)
    .innerJoin(model, eq(product.id, model.productId))
    .leftJoin(plate, eq(model.id, plate.modelId))
    .innerJoin(staticFile, eq(model.thumbnailId, staticFile.id))
    .groupBy(product.id, model.thumbnailId, staticFile.id, model.timeSeconds, model.weightGrams)
    .orderBy(query ? desc(sql`${rankScore} + ${similarityScore}`) : asc(product.name));

  return rows.map(row => ({
    ...row, thumbnail: row.thumbnailSha1 ? `/uploads/${row.thumbnailSha1}` : null
  }));
}

export async function getProductById(id: string, modelId?: string) {
  const thumbnailTable = aliasedTable(staticFile, "thumbnail_file");
  const fileTable = aliasedTable(staticFile, "file_file");

  const [row] = await db.select({
    id: product.id,
    name: product.name,
    description: product.description,
    categories: product.categories,
    price: product.price,
    thumbnailSha1: thumbnailTable.sha1,
    fileSha1: fileTable.sha1,
    fileName: fileTable.filename,
    timeSeconds: sql<number>`coalesce(${model.timeSeconds}, sum(${plate.timeSeconds}), 0)`,
    weightGrams: sql<number>`coalesce(${model.weightGrams}, sum(${plate.weightGrams}), 0)`,
    plateCount: sql<number>`coalesce(count(${plate.modelId}), 0)`,
  }).from(product).where(eq(product.id, id))
    .innerJoinLateral(db.select().from(model)
      .where(and(eq(product.id, model.productId), modelId ? eq(model.id, modelId) : undefined))
      .orderBy(desc(model.createdAt)).limit(1)
      .as("model"), eq(product.id, model.productId))
    .leftJoin(plate, eq(model.id, plate.modelId))
    .innerJoin(thumbnailTable, eq(model.thumbnailId, thumbnailTable.id))
    .innerJoin(fileTable, eq(model.fileId, fileTable.id))
    .groupBy(product.id, model.thumbnailId, thumbnailTable.id, fileTable.id, model.timeSeconds, model.weightGrams)
    .limit(1);

  return row;
}

export async function getProductFile(productId: string) {
  const [row] = await db.select({ filename: staticFile.filename, sha1: staticFile.sha1 })
    .from(model).where(eq(model.productId, productId))
    .leftJoin(staticFile, eq(model.fileId, staticFile.id))
    .limit(1);

  return row;
}