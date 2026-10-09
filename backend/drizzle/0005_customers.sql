CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"company_name" text,
	"email" text NOT NULL,
	"address_line_1" text NOT NULL,
	"address_line_2" text,
	"zip" text NOT NULL,
	"city" text NOT NULL,
	"country_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "customer_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "customers_email_key" ON "customers" USING btree (lower("email"));--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "properties_customer_id_idx" ON "properties" USING btree ("customer_id");