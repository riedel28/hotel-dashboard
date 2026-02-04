CREATE TABLE "monitoring_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"type" text NOT NULL,
	"booking_nr" text,
	"event" text NOT NULL,
	"sub" text,
	"log_message" text
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "selected_property_id" uuid;