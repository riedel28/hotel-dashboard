ALTER TABLE "guests" ADD COLUMN "is_primary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
-- Until now the first guest of a reservation was the primary one by convention.
UPDATE "guests" SET "is_primary" = true WHERE "id" IN (SELECT MIN("id") FROM "guests" GROUP BY "reservation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "guests_one_primary_key" ON "guests" USING btree ("reservation_id") WHERE "guests"."is_primary";
