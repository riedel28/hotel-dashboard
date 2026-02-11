CREATE TABLE "email_verification_tokens" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "email_verification_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"token" text NOT NULL,
	"type" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_verification_tokens_token_unique" UNIQUE("token"),
	CONSTRAINT "email_verification_tokens_type_check" CHECK ("email_verification_tokens"."type" IN ('verification', 'invitation', 'reset'))
);
--> statement-breakpoint
ALTER TABLE "monitoring_logs" RENAME COLUMN "date" TO "logged_at";--> statement-breakpoint
DROP INDEX "monitoring_logs_date_idx";--> statement-breakpoint
DROP INDEX "user_roles_user_id_idx";--> statement-breakpoint
ALTER TABLE "guests" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "booking_from" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "booking_to" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "property_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id");--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "country_code" text DEFAULT 'DE' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_verification_tokens_token_idx" ON "email_verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "monitoring_logs_logged_at_idx" ON "monitoring_logs" USING btree ("logged_at");--> statement-breakpoint
ALTER TABLE "user_roles" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_nationality_code_check" CHECK ("guests"."nationality_code" IN ('DE', 'US', 'AT', 'CH'));--> statement-breakpoint
ALTER TABLE "monitoring_logs" ADD CONSTRAINT "monitoring_logs_status_check" CHECK ("monitoring_logs"."status" IN ('success', 'error'));--> statement-breakpoint
ALTER TABLE "monitoring_logs" ADD CONSTRAINT "monitoring_logs_type_check" CHECK ("monitoring_logs"."type" IN ('pms', 'door lock', 'payment'));--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_stage_check" CHECK ("properties"."stage" IN ('demo', 'production', 'staging', 'template'));--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_state_check" CHECK ("reservations"."state" IN ('pending', 'started', 'done'));--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_check_in_via_check" CHECK ("reservations"."check_in_via" IS NULL OR "reservations"."check_in_via" IN ('android', 'ios', 'tv', 'station', 'web'));--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_check_out_via_check" CHECK ("reservations"."check_out_via" IS NULL OR "reservations"."check_out_via" IN ('android', 'ios', 'tv', 'station', 'web'));--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_purpose_check" CHECK ("reservations"."purpose" IS NULL OR "reservations"."purpose" IN ('private', 'business'));--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_status_check" CHECK ("rooms"."status" IN ('available', 'occupied', 'maintenance', 'out_of_order'));