CREATE TABLE "provider_configs" (
	"property_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"provider" text NOT NULL,
	"config" jsonb NOT NULL,
	"secret_encrypted" text NOT NULL,
	"updated_by" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "provider_configs_property_id_kind_pk" PRIMARY KEY("property_id","kind"),
	CONSTRAINT "provider_configs_kind_check" CHECK ("provider_configs"."kind" IN ('payment', 'pms', 'door_lock'))
);
--> statement-breakpoint
ALTER TABLE "provider_configs" ADD CONSTRAINT "provider_configs_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_configs" ADD CONSTRAINT "provider_configs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;