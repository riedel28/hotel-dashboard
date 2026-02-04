-- Issue #8: CHECK constraints on enum-like columns
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_state_check" CHECK ("state" IN ('pending', 'started', 'done'));--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_check_in_via_check" CHECK ("check_in_via" IN ('android', 'ios', 'tv', 'station', 'web'));--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_check_out_via_check" CHECK ("check_out_via" IN ('android', 'ios', 'tv', 'station', 'web'));--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_purpose_check" CHECK ("purpose" IN ('private', 'business'));--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_nationality_code_check" CHECK ("nationality_code" IN ('DE', 'US', 'AT', 'CH'));--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_stage_check" CHECK ("stage" IN ('demo', 'production', 'staging', 'template'));--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_status_check" CHECK ("status" IN ('available', 'occupied', 'maintenance', 'out_of_order'));--> statement-breakpoint
ALTER TABLE "monitoring_logs" ADD CONSTRAINT "monitoring_logs_status_check" CHECK ("status" IN ('success', 'error'));--> statement-breakpoint
ALTER TABLE "monitoring_logs" ADD CONSTRAINT "monitoring_logs_type_check" CHECK ("type" IN ('pms', 'door lock', 'payment'));--> statement-breakpoint

-- Issue #9: NOT NULL constraints
ALTER TABLE "reservations" ALTER COLUMN "booking_from" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "booking_to" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "property_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "guests" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint

-- Issue #10: Convert user_roles to composite PK (drop surrogate id, add composite PK)
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_pkey";--> statement-breakpoint
ALTER TABLE "user_roles" DROP COLUMN "id";--> statement-breakpoint
DROP INDEX IF EXISTS "user_roles_user_id_idx";--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id");--> statement-breakpoint

-- Issue #11: Unique constraint on roles.name
ALTER TABLE "roles" ADD CONSTRAINT "roles_name_unique" UNIQUE("name");--> statement-breakpoint

-- Issue #13: Add created_at to reservations and properties
ALTER TABLE "reservations" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint

-- Issue #14: Rename monitoring_logs.date to logged_at
ALTER TABLE "monitoring_logs" RENAME COLUMN "date" TO "logged_at";--> statement-breakpoint
DROP INDEX IF EXISTS "monitoring_logs_date_idx";--> statement-breakpoint
CREATE INDEX "monitoring_logs_logged_at_idx" ON "monitoring_logs" USING btree ("logged_at");
