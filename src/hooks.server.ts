import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "$lib/server/db";
import type { ServerInit } from "@sveltejs/kit";

export const init: ServerInit = async () => {
  if (import.meta.env.PROD) {
    console.log("Migrating database...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Database migrated successfully.");
  }
};