ALTER TABLE "product" drop column "search_vector";--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS ((
    setweight(to_tsvector('spanish', "product"."name"), 'A') || ' ' ||
    setweight(to_tsvector('spanish', "product"."description"), 'B') || ' ' ||
    setweight(to_tsvector('spanish', immutable_array_to_string("product"."categories", ' ')), 'C')
  )) STORED NOT NULL;