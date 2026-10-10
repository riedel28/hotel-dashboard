ALTER TABLE "reservations" DROP CONSTRAINT "reservations_state_check";--> statement-breakpoint
UPDATE "reservations" SET "state" = 'checked_in' WHERE "state" = 'started';--> statement-breakpoint
UPDATE "reservations" SET "state" = 'checked_out' WHERE "state" = 'done';--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_state_check" CHECK ("reservations"."state" IN ('pending', 'ready_in', 'checked_in', 'ready_out', 'checked_out'));