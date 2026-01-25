import { db } from '$lib/server/db/index.js';
import { staticFile } from '$lib/server/db/schema.js';
import { getDiskPath } from '$lib/server/uploads.js';
import { and, eq, isNull } from 'drizzle-orm';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { error } from '@sveltejs/kit';

export async function GET({ params }) {
  const { hash, filename } = params;
  if (!/[0-9a-f]{40}/i.test(hash)) return error(400, "Invalid hash");

  const filePath = getDiskPath(hash);
  if (!existsSync(filePath)) return error(404, "Not found");

  const rows = await db.select({})
    .from(staticFile)
    .where(and(eq(staticFile.sha1, hash), filename === undefined ? isNull(staticFile.filename) : eq(staticFile.filename, filename)))
    .limit(1);

  if (rows.length === 0) return error(404, "Not found");

  return new Response(await readFile(filePath), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}