CREATE TABLE "checkin_settings" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"enabled" boolean NOT NULL,
	"payment_mode" text NOT NULL,
	"auto_send" boolean NOT NULL,
	"first_send_days" integer NOT NULL,
	"reminder_days" integer,
	"background" text NOT NULL,
	"custom_image_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "checkin_settings_first_send_days_check" CHECK ("checkin_settings"."first_send_days" IN (1, 2, 3, 5, 7, 14)),
	CONSTRAINT "checkin_settings_reminder_days_check" CHECK ("checkin_settings"."reminder_days" IN (1, 2, 3)),
	CONSTRAINT "checkin_settings_reminder_before_first_send_check" CHECK (NOT "checkin_settings"."auto_send" OR "checkin_settings"."reminder_days" IS NULL OR "checkin_settings"."reminder_days" < "checkin_settings"."first_send_days"),
	CONSTRAINT "checkin_settings_custom_background_check" CHECK ("checkin_settings"."background" <> 'custom' OR "checkin_settings"."custom_image_id" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "checkin_settings" ADD CONSTRAINT "checkin_settings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkin_settings" ADD CONSTRAINT "checkin_settings_custom_image_id_cms_images_id_fk" FOREIGN KEY ("custom_image_id") REFERENCES "public"."cms_images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checkin_settings_custom_image_id_idx" ON "checkin_settings" USING btree ("custom_image_id");