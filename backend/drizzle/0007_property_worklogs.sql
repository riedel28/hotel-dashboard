CREATE TABLE "property_worklogs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "property_worklogs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"property_id" uuid NOT NULL,
	"message" text NOT NULL,
	"created_by" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" bigint,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "property_worklogs" ADD CONSTRAINT "property_worklogs_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_worklogs" ADD CONSTRAINT "property_worklogs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_worklogs" ADD CONSTRAINT "property_worklogs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "property_worklogs_property_id_created_at_idx" ON "property_worklogs" USING btree ("property_id","created_at");