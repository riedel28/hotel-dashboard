-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"state" text NOT NULL,
	"booking_nr" text,
	"guest_email" text,
	"primary_guest_name" text,
	"booking_id" text,
	"room_name" text,
	"booking_from" timestamp with time zone,
	"booking_to" timestamp with time zone,
	"check_in_via" text,
	"check_out_via" text,
	"last_opened_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"page_url" text,
	"balance" double precision DEFAULT 0,
	"guests" jsonb DEFAULT '[]'::jsonb,
	"adults" integer DEFAULT 0,
	"youth" integer DEFAULT 0,
	"children" integer DEFAULT 0,
	"infants" integer DEFAULT 0,
	"purpose" text DEFAULT 'private',
	"room" text,
	CONSTRAINT "reservations_state_check" CHECK (state = ANY (ARRAY['pending'::text, 'started'::text, 'done'::text])),
	CONSTRAINT "reservations_check_in_via_check" CHECK (check_in_via = ANY (ARRAY['android'::text, 'ios'::text, 'tv'::text, 'station'::text, 'web'::text])),
	CONSTRAINT "reservations_check_out_via_check" CHECK (check_out_via = ANY (ARRAY['android'::text, 'ios'::text, 'tv'::text, 'station'::text, 'web'::text])),
	CONSTRAINT "reservations_purpose_check" CHECK (purpose = ANY (ARRAY['private'::text, 'business'::text]))
);

*/