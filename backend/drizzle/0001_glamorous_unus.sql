CREATE TABLE "guests" (
	"id" serial PRIMARY KEY NOT NULL,
	"reservation_id" integer NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"nationality_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(50),
	"last_name" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_state_check";--> statement-breakpoint
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_check_in_via_check";--> statement-breakpoint
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_check_out_via_check";--> statement-breakpoint
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_purpose_check";--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "booking_nr" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" DROP COLUMN "guests";