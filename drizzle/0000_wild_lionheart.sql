CREATE TABLE "model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"version_notes" text NOT NULL,
	"product_id" uuid NOT NULL,
	"thumbnail_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"time_seconds" integer,
	"weight_grams" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS ((
    setweight(to_tsvector('spanish', "model"."name"), 'A') ||
    setweight(to_tsvector('spanish', "model"."version_notes"), 'B')
  )) STORED NOT NULL,
	CONSTRAINT "model_product_id_created_at_unique" UNIQUE("product_id","created_at")
);
--> statement-breakpoint
CREATE TABLE "plate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"name" text NOT NULL,
	"thumbnail_id" uuid NOT NULL,
	"time_seconds" integer NOT NULL,
	"weight_grams" real NOT NULL,
	"objects" integer NOT NULL,
	"filaments" json[] NOT NULL,
	CONSTRAINT "plate_time_seconds_check" CHECK ("plate"."time_seconds" >= 0),
	CONSTRAINT "plate_weight_grams_check" CHECK ("plate"."weight_grams" >= 0),
	CONSTRAINT "plate_objects_check" CHECK ("plate"."objects" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"categories" text[] NOT NULL,
	"price" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS ((
    setweight(to_tsvector('spanish', "product"."name"), 'A') ||
    setweight(to_tsvector('spanish', "product"."description"), 'B')
  )) STORED NOT NULL,
	CONSTRAINT "product_price_check" CHECK ("product"."price" IS NULL OR "product"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "static_file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text,
	"sha1" text NOT NULL,
	"size" integer NOT NULL,
	"mime" text NOT NULL,
	CONSTRAINT "static_file_sha1_size_mime_unique" UNIQUE("sha1","size","mime")
);
--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "model_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "model_thumbnail_id_static_file_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."static_file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "model_file_id_static_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."static_file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plate" ADD CONSTRAINT "plate_model_id_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."model"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plate" ADD CONSTRAINT "plate_thumbnail_id_static_file_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."static_file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_model_product_id" ON "model" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_model_created_at" ON "model" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_model_search_vector" ON "model" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "plate_model_idx" ON "plate" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_product_search_vector" ON "product" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "idx_static_file_sha1" ON "static_file" USING btree ("sha1");