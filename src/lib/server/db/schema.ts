import { sql } from "drizzle-orm";
import { check, customType, index, integer, json, pgTable, real, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export type Filament = { color: string, type: string };

export const tsvector = customType({
  dataType: () => 'tsvector',
  fromDriver: (value) => value,
});

export const staticFile = pgTable('static_file', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: text('filename'),
  sha1: text('sha1').notNull(),
  size: integer('size').notNull(),
  mime: text('mime').notNull()
}, (table) => [
  unique().on(table.sha1, table.size, table.mime),
  index('idx_static_file_sha1').on(table.sha1)
]);

export const product = pgTable('product', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  categories: text('categories').array().notNull(),
  price: real('price'),
  createdAt: timestamp('created_at').notNull().defaultNow(),

  searchVector: tsvector('search_vector').notNull().generatedAlwaysAs(() => sql`(
    setweight(to_tsvector('spanish', ${product.name}), 'A') ||
    setweight(to_tsvector('spanish', ${product.description}), 'B')
  )`)
}, (table) => [
  check("product_price_check", sql`${table.price} IS NULL OR ${table.price} >= 0`),
  index('idx_product_search_vector').using('gin', table.searchVector),
  index("idx_product_name_fuzzy").using('gist', table.name.op('gist_trgm_ops'))
]);

export const model = pgTable('model', {
  id: uuid('id').primaryKey().defaultRandom(),
  versionName: text('name').notNull(),
  versionNotes: text('version_notes').notNull(),
  productId: uuid('product_id').notNull().references(() => product.id),
  thumbnailId: uuid('thumbnail_id').notNull().references(() => staticFile.id),
  fileId: uuid('file_id').notNull().references(() => staticFile.id), // TODO: notNull
  timeSeconds: integer('time_seconds'),
  weightGrams: real('weight_grams'),
  createdAt: timestamp('created_at').notNull().defaultNow(),

  searchVector: tsvector('search_vector').notNull().generatedAlwaysAs(() => sql`(
    setweight(to_tsvector('spanish', ${model.versionName}), 'A') ||
    setweight(to_tsvector('spanish', ${model.versionNotes}), 'B')
  )`)
}, (table) => [
  unique().on(table.productId, table.createdAt),
  index('idx_model_product_id').on(table.productId),
  index('idx_model_created_at').using('btree', table.createdAt),
  index('idx_model_search_vector').using('gin', table.searchVector)
]);

export const plate = pgTable('plate', {
  id: uuid('id').primaryKey().defaultRandom(),
  modelId: uuid('model_id').notNull().references(() => model.id),
  name: text('name').notNull(),
  thumbnailId: uuid('thumbnail_id').notNull().references(() => staticFile.id),
  timeSeconds: integer('time_seconds').notNull(),
  weightGrams: real('weight_grams').notNull(),
  objects: integer('objects').notNull(),
  filaments: json("filaments").$type<Filament>().array().notNull(),
}, (table) => [
  index('plate_model_idx').on(table.modelId),
  check("plate_time_seconds_check", sql`${table.timeSeconds} >= 0`),
  check("plate_weight_grams_check", sql`${table.weightGrams} >= 0`),
  check("plate_objects_check", sql`${table.objects} >= 0`),
]);