-- Natural order for room numbers: 2 < 10 < 10A
CREATE COLLATION IF NOT EXISTS numeric_sort (provider = icu, locale = 'und-u-kn-true');--> statement-breakpoint
UPDATE "rooms" SET "room_number" = btrim(coalesce(nullif(btrim("room_number"), ''), "name"));--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "room_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "floor" integer;--> statement-breakpoint
-- The floor used to be read off the room number: everything but its last two digits (204 → 2)
UPDATE "rooms" SET "floor" = substring("room_number" from '^(\d{1,7})\d{2}$')::integer WHERE "room_number" ~ '^\d{1,7}\d{2}$';--> statement-breakpoint
CREATE UNIQUE INDEX "rooms_property_room_number_key" ON "rooms" USING btree ("property_id",lower("room_number"));
