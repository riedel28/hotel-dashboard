CREATE TABLE "payments" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"reservation_id" bigint NOT NULL,
	"type" text NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"authorized_amount" numeric(10, 2) NOT NULL,
	"authorized_at" timestamp with time zone NOT NULL,
	"captured_amount" numeric(10, 2),
	"captured_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"reference" text NOT NULL,
	"card_brand" text NOT NULL,
	"card_last4" text NOT NULL,
	"card_exp_month" integer NOT NULL,
	"card_exp_year" integer NOT NULL,
	"card_holder" text NOT NULL,
	"stage" text GENERATED ALWAYS AS (CASE WHEN paid_at IS NOT NULL THEN 'paid' WHEN captured_at IS NOT NULL THEN 'captured' ELSE 'authorized' END) STORED,
	"last_stage_at" timestamp with time zone GENERATED ALWAYS AS (COALESCE(paid_at, captured_at, authorized_at)) STORED,
	CONSTRAINT "payments_type_check" CHECK ("payments"."type" IN ('prepayment', 'deposit', 'final', 'no_show')),
	CONSTRAINT "payments_card_brand_check" CHECK ("payments"."card_brand" IN ('mastercard', 'visa', 'amex')),
	CONSTRAINT "payments_currency_check" CHECK ("payments"."currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "payments_card_last4_check" CHECK ("payments"."card_last4" ~ '^[0-9]{4}$'),
	CONSTRAINT "payments_card_exp_month_check" CHECK ("payments"."card_exp_month" BETWEEN 1 AND 12),
	CONSTRAINT "payments_authorized_amount_check" CHECK ("payments"."authorized_amount" > 0),
	CONSTRAINT "payments_captured_check" CHECK (("payments"."captured_at" IS NULL) = ("payments"."captured_amount" IS NULL)
        AND ("payments"."captured_at" IS NULL OR (
          "payments"."captured_amount" > 0
          AND "payments"."captured_amount" <= "payments"."authorized_amount"
          AND "payments"."captured_at" >= "payments"."authorized_at"))),
	CONSTRAINT "payments_paid_check" CHECK ("payments"."paid_at" IS NULL OR (
        "payments"."captured_at" IS NOT NULL
        AND "payments"."paid_at" >= "payments"."captured_at"))
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payments_reservation_id_idx" ON "payments" USING btree ("reservation_id");--> statement-breakpoint
CREATE INDEX "payments_stage_idx" ON "payments" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "payments_last_stage_at_idx" ON "payments" USING btree ("last_stage_at");