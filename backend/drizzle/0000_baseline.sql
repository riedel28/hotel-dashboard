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
CREATE TABLE "guest_abc_entries" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guest_abc_entries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"property_id" uuid NOT NULL,
	"letter" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"reservation_id" bigint NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"nationality_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "monitoring_logs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "monitoring_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"status" text NOT NULL,
	"logged_at" timestamp with time zone DEFAULT now() NOT NULL,
	"type" text NOT NULL,
	"booking_nr" text,
	"event" text NOT NULL,
	"sub" text,
	"log_message" text,
	CONSTRAINT "monitoring_logs_status_check" CHECK ("monitoring_logs"."status" IN ('success', 'error')),
	CONSTRAINT "monitoring_logs_type_check" CHECK ("monitoring_logs"."type" IN ('pms', 'door lock', 'payment'))
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"property_id" uuid NOT NULL,
	"parent_id" bigint,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"property_id" uuid NOT NULL,
	"category_id" bigint NOT NULL,
	"title" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_price_check" CHECK ("products"."price" >= 0),
	CONSTRAINT "products_quantity_check" CHECK ("products"."quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"country_code" text DEFAULT 'DE' NOT NULL,
	"stage" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "properties_stage_check" CHECK ("properties"."stage" IN ('demo', 'production', 'staging', 'template'))
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reservations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"state" text NOT NULL,
	"booking_nr" text NOT NULL,
	"guest_email" text,
	"primary_guest_name" text,
	"booking_id" text,
	"room_name" text,
	"booking_from" timestamp with time zone NOT NULL,
	"booking_to" timestamp with time zone NOT NULL,
	"check_in_via" text,
	"check_out_via" text,
	"last_opened_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"page_url" text,
	"balance" numeric(10, 2) DEFAULT '0',
	"adults" integer DEFAULT 0,
	"youth" integer DEFAULT 0,
	"children" integer DEFAULT 0,
	"infants" integer DEFAULT 0,
	"purpose" text DEFAULT 'private',
	"room" text,
	CONSTRAINT "reservations_state_check" CHECK ("reservations"."state" IN ('pending', 'started', 'done')),
	CONSTRAINT "reservations_check_in_via_check" CHECK ("reservations"."check_in_via" IS NULL OR "reservations"."check_in_via" IN ('android', 'ios', 'tv', 'station', 'web')),
	CONSTRAINT "reservations_check_out_via_check" CHECK ("reservations"."check_out_via" IS NULL OR "reservations"."check_out_via" IN ('android', 'ios', 'tv', 'station', 'web')),
	CONSTRAINT "reservations_purpose_check" CHECK ("reservations"."purpose" IS NULL OR "reservations"."purpose" IN ('private', 'business'))
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rooms_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"property_id" uuid NOT NULL,
	"room_number" text,
	"room_type" text,
	"status" text DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_status_check" CHECK ("rooms"."status" IN ('available', 'occupied', 'maintenance', 'out_of_order'))
);
--> statement-breakpoint
CREATE TABLE "two_factor_recovery_codes" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "two_factor_recovery_codes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"code_hash" text NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" bigint NOT NULL,
	"role_id" bigint NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"email" text NOT NULL,
	"password" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"first_name" text,
	"last_name" text,
	"country_code" text,
	"selected_property_id" uuid,
	"avatar_url" text,
	"totp_secret" text,
	"totp_enabled_at" timestamp with time zone,
	"totp_last_used_at" timestamp with time zone,
	"token_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_abc_entries" ADD CONSTRAINT "guest_abc_entries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_recovery_codes" ADD CONSTRAINT "two_factor_recovery_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_selected_property_id_properties_id_fk" FOREIGN KEY ("selected_property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_verification_tokens_token_idx" ON "email_verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "guest_abc_entries_property_id_idx" ON "guest_abc_entries" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "guest_abc_entries_letter_idx" ON "guest_abc_entries" USING btree ("letter");--> statement-breakpoint
CREATE INDEX "guests_reservation_id_idx" ON "guests" USING btree ("reservation_id");--> statement-breakpoint
CREATE INDEX "monitoring_logs_status_idx" ON "monitoring_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "monitoring_logs_type_idx" ON "monitoring_logs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "monitoring_logs_logged_at_idx" ON "monitoring_logs" USING btree ("logged_at");--> statement-breakpoint
CREATE INDEX "product_categories_property_id_idx" ON "product_categories" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "product_categories_parent_id_idx" ON "product_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "products_property_id_idx" ON "products" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "reservations_state_idx" ON "reservations" USING btree ("state");--> statement-breakpoint
CREATE INDEX "reservations_received_at_idx" ON "reservations" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "reservations_booking_from_idx" ON "reservations" USING btree ("booking_from");--> statement-breakpoint
CREATE INDEX "reservations_booking_to_idx" ON "reservations" USING btree ("booking_to");--> statement-breakpoint
CREATE INDEX "rooms_property_id_idx" ON "rooms" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "rooms_status_idx" ON "rooms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "two_factor_recovery_codes_user_id_idx" ON "two_factor_recovery_codes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_roles_role_id_idx" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_selected_property_id_idx" ON "users" USING btree ("selected_property_id");