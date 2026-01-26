import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

type DB = ReturnType<typeof drizzle<typeof schema>>;

function connectDB() {
  if (building) return {} as DB;

  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  return drizzle(postgres(env.DATABASE_URL), { schema });
}

export const db = connectDB();
