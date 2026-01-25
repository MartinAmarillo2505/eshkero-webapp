import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import type { PgQueryResultHKT, PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";
import sharp from "sharp";
import { db } from "./db";
import type * as Schema from "./db/schema";
import { staticFile } from "./db/schema";

type Transaction = PgTransaction<PgQueryResultHKT, typeof Schema> | PostgresJsDatabase<typeof Schema>;

export function getDiskPath(sha1: string) {
  return `./data/uploads/${sha1.substring(0, 2)}/${sha1}`;
}

async function saveFileToDisk(sha1: string, file: File) {
  const path = getDiskPath(sha1);
  if (existsSync(path)) return;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, Buffer.from(await file.arrayBuffer()))
}

export async function uploadFile({ file, invoker = db, storeFileName = false }: { file: File, invoker?: Transaction, storeFileName?: boolean }) {
  const sha1 = createHash('sha1').update(Buffer.from(await file.arrayBuffer())).digest('hex');

  return await invoker.transaction(async (tx) => {
    const [row] = await tx
      .insert(staticFile)
      .values({ filename: storeFileName ? file.name : null, sha1, size: file.size, mime: file.type })
      .onConflictDoNothing()
      .returning();

    try {
      await saveFileToDisk(sha1, file);
    } catch (error) {
      tx.rollback();
      throw error;
    }

    return row ?? (await tx.select().from(staticFile).where(eq(staticFile.sha1, sha1))).at(0);
  });
}

export async function uploadOptimizedImage({ file, invoker = db }: { file: File, invoker?: Transaction }) {
  const buffer = await sharp(await file.arrayBuffer())
    .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer()
  file = new File([new Uint8Array(buffer)], `${file.name}.webp`, { type: 'image/webp' })
  return await uploadFile({ file, invoker, storeFileName: false })
}