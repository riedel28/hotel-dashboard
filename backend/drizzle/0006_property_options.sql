ALTER TABLE "properties" ADD COLUMN "options" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "pwa_domain" text;