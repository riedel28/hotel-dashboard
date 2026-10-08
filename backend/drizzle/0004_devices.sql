CREATE TABLE "devices" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "devices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"serial_number" text NOT NULL,
	"pin_hash" text NOT NULL,
	"property_id" uuid,
	"room_id" bigint,
	"name" text,
	"last_seen_at" timestamp with time zone,
	"app_version" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "devices_serial_number_key" ON "devices" USING btree (lower("serial_number"));--> statement-breakpoint
CREATE INDEX "devices_property_id_idx" ON "devices" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "devices_room_id_idx" ON "devices" USING btree ("room_id");