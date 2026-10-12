ALTER TABLE "provider_configs" DROP CONSTRAINT "provider_configs_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "provider_configs" ALTER COLUMN "secret_encrypted" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "provider_configs" DROP COLUMN "updated_by";