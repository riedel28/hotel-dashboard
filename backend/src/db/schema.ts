import {
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  state: text('state').notNull().$type<'pending' | 'started' | 'done'>(),
  booking_nr: text('booking_nr').notNull(),
  guest_email: text('guest_email'),
  primary_guest_name: text('primary_guest_name'),
  booking_id: text('booking_id'),
  room_name: text('room_name'),
  booking_from: timestamp('booking_from', { withTimezone: true }),
  booking_to: timestamp('booking_to', { withTimezone: true }),
  check_in_via: text('check_in_via').$type<
    'android' | 'ios' | 'tv' | 'station' | 'web'
  >(),
  check_out_via: text('check_out_via').$type<
    'android' | 'ios' | 'tv' | 'station' | 'web'
  >(),
  last_opened_at: timestamp('last_opened_at', { withTimezone: true }),
  received_at: timestamp('received_at', { withTimezone: true }),
  completed_at: timestamp('completed_at', { withTimezone: true }),
  updated_at: timestamp('updated_at', { withTimezone: true }),
  page_url: text('page_url'),
  balance: doublePrecision('balance').default(0),
  adults: integer('adults').default(0),
  youth: integer('youth').default(0),
  children: integer('children').default(0),
  infants: integer('infants').default(0),
  purpose: text('purpose').default('private').$type<'private' | 'business'>(),
  room: text('room')
});

export const guests = pgTable('guests', {
  id: serial('id').primaryKey(),
  reservation_id: integer('reservation_id').notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  email: text('email'),
  nationality_code: text('nationality_code').notNull().$type<'DE' | 'US' | 'AT' | 'CH'>(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true })
});

export const reservationsRelations = relations(reservations, ({ many }) => ({
  guests: many(guests)
}));

export const guestsRelations = relations(guests, ({ one }) => ({
  reservation: one(reservations, {
    fields: [guests.reservation_id],
    references: [reservations.id]
  })
}));

export const insertReservationSchema = createInsertSchema(reservations);
export const selectReservationSchema = createSelectSchema(reservations);
export const insertGuestSchema = createInsertSchema(guests);
export const selectGuestSchema = createSelectSchema(guests);

export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;
