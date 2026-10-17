CREATE TABLE "event_images" (
	"event_id" bigint NOT NULL,
	"image_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "event_images_event_id_position_pk" PRIMARY KEY("event_id","position")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"property_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"categories" text[] DEFAULT '{}'::text[] NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"doors_open_at" timestamp with time zone,
	"venue_name" text NOT NULL,
	"address_line_1" text NOT NULL,
	"address_line_2" text,
	"zip" text NOT NULL,
	"city" text NOT NULL,
	"country_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_ends_after_start_check" CHECK ("events"."ends_at" > "events"."starts_at"),
	CONSTRAINT "events_doors_before_start_check" CHECK ("events"."doors_open_at" IS NULL OR "events"."doors_open_at" <= "events"."starts_at")
);
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "address_line_1" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "address_line_2" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "zip" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "timezone" text DEFAULT 'Europe/Berlin' NOT NULL;--> statement-breakpoint
ALTER TABLE "event_images" ADD CONSTRAINT "event_images_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_images" ADD CONSTRAINT "event_images_image_id_cms_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."cms_images"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_images_image_id_idx" ON "event_images" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "events_property_id_starts_at_idx" ON "events" USING btree ("property_id","starts_at");