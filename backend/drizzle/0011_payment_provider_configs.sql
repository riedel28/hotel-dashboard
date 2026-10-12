CREATE TABLE "payment_provider_configs" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"config" jsonb NOT NULL,
	"api_key_encrypted" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_provider_configs_provider_check" CHECK ("payment_provider_configs"."provider" IN ('adyen', 'payone', 'concardis', 'six_saferpay', 'valitor'))
);
--> statement-breakpoint
ALTER TABLE "payment_provider_configs" ADD CONSTRAINT "payment_provider_configs_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;