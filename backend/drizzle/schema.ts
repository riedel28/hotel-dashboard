import { pgTable, check, serial, text, timestamp, doublePrecision, jsonb, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const reservations = pgTable("reservations", {
	id: serial().primaryKey().notNull(),
	state: text().notNull(),
	bookingNr: text("booking_nr"),
	guestEmail: text("guest_email"),
	primaryGuestName: text("primary_guest_name"),
	bookingId: text("booking_id"),
	roomName: text("room_name"),
	bookingFrom: timestamp("booking_from", { withTimezone: true, mode: 'string' }),
	bookingTo: timestamp("booking_to", { withTimezone: true, mode: 'string' }),
	checkInVia: text("check_in_via"),
	checkOutVia: text("check_out_via"),
	lastOpenedAt: timestamp("last_opened_at", { withTimezone: true, mode: 'string' }),
	receivedAt: timestamp("received_at", { withTimezone: true, mode: 'string' }),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	pageUrl: text("page_url"),
	balance: doublePrecision().default(0),
	guests: jsonb().default([]),
	adults: integer().default(0),
	youth: integer().default(0),
	children: integer().default(0),
	infants: integer().default(0),
	purpose: text().default('private'),
	room: text(),
}, (table) => [
	check("reservations_state_check", sql`state = ANY (ARRAY['pending'::text, 'started'::text, 'done'::text])`),
	check("reservations_check_in_via_check", sql`check_in_via = ANY (ARRAY['android'::text, 'ios'::text, 'tv'::text, 'station'::text, 'web'::text])`),
	check("reservations_check_out_via_check", sql`check_out_via = ANY (ARRAY['android'::text, 'ios'::text, 'tv'::text, 'station'::text, 'web'::text])`),
	check("reservations_purpose_check", sql`purpose = ANY (ARRAY['private'::text, 'business'::text])`),
]);
