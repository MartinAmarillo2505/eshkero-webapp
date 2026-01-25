import { aliasedTable, asc, count, desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { model, plate, staticFile } from "./db/schema";

const plateCount = sql<number>`coalesce(count(${plate.modelId}), 0)`;
const timeSeconds = sql<number>`coalesce(sum(${plate.timeSeconds}), 0)`;
const weightGrams = sql<number>`coalesce(sum(${plate.weightGrams}), 0)`;
const thumbnailFile = aliasedTable(staticFile, "thumbnail_file");

export function getModelsByProductId(productId: string) {
  return db.select({
    id: model.id,
    versionName: model.versionName,
    versionNotes: model.versionNotes,
    thumbnailSha1: staticFile.sha1,
    createdAt: model.createdAt,

    plateCount: db.select({ count: count(plate.modelId).as("plateCount") }).from(plate).where(eq(plate.modelId, model.id)).as("plateCount"),
    timeSeconds: sql<number>`coalesce(${model.timeSeconds}, sum(${plate.timeSeconds}), 0)`,
    weightGrams: sql<number>`coalesce(${model.weightGrams}, sum(${plate.weightGrams}), 0)`,
  })
    .from(model)
    .where(eq(model.productId, productId))
    .innerJoin(staticFile, eq(model.thumbnailId, staticFile.id))
    .leftJoin(plate, eq(model.id, plate.modelId))
    .groupBy(model.id, staticFile.id)
    .orderBy(desc(model.createdAt));
}

export function searchModels({ query, page, limit }: { query: string, page: number, limit: number }) {
  const tsQuery = sql`websearch_to_tsquery('spanish', ${query})`;
  const rankScore = sql<number>`ts_rank(${model.searchVector}, ${tsQuery})`;

  return db
    .select({
      id: model.id,
      name: model.versionName,
      thumbnail: thumbnailFile.sha1,
      plateCount,
      timeSeconds,
      weightGrams,
    })
    .from(model)
    .where(query ? sql`${model.searchVector} @@ ${tsQuery}` : sql`true`)
    .limit(limit)
    .offset((page - 1) * limit)
    .leftJoin(plate, eq(model.id, plate.modelId))
    .innerJoin(thumbnailFile, eq(model.thumbnailId, thumbnailFile.id))
    .groupBy(model.id, thumbnailFile.id)
    .orderBy(query ? desc(rankScore) : asc(model.versionName));
}

export async function getModelById(id: string) {
  const rows = await db
    .select({
      id: model.id,
      name: model.versionName,
      thumbnail: thumbnailFile.sha1,
    })
    .from(model)
    .where(eq(model.id, id))
    .innerJoin(thumbnailFile, eq(model.thumbnailId, thumbnailFile.id));
  if (rows.length == 0) throw new Error("Model not found");
  const row = rows[0];
  const plates = (await db.select({
    id: plate.id,
    name: plate.name,
    thumbnail: plate.thumbnailId,
    timeSeconds: plate.timeSeconds,
    weightGrams: plate.weightGrams,
    objects: plate.objects,
    filaments: plate.filaments
  }).from(plate).where(eq(plate.modelId, id))).map(plate => ({
    ...plate,
    thumbnail: plate.thumbnail ? `/uploads/${plate.thumbnail}` : null
  }));

  return {
    ...row,
    timeSeconds: plates.reduce((acc, plate) => acc + plate.timeSeconds, 0),
    weightGrams: plates.reduce((acc, plate) => acc + plate.weightGrams, 0),
    plateCount: plates.length,
    thumbnail: row.thumbnail ? `/uploads/${row.thumbnail}` : null,
    plates
  };
}