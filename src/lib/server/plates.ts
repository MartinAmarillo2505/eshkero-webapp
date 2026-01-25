import { eq } from "drizzle-orm";
import { db } from "./db";
import { plate, staticFile } from "./db/schema";

export async function getPlatesByModelId(modelId: string) {
  return await db.select({
    id: plate.id,
    name: plate.name,
    thumbnailSha1: staticFile.sha1,
    timeSeconds: plate.timeSeconds,
    weightGrams: plate.weightGrams,
    objects: plate.objects,
    filaments: plate.filaments
  }).from(plate)
    .where(eq(plate.modelId, modelId))
    .innerJoin(staticFile, eq(plate.thumbnailId, staticFile.id))
    .groupBy(plate.id, staticFile.id);
}