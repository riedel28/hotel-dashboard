import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
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
  nationality_code: text('nationality_code')
    .notNull()
    .$type<'DE' | 'US' | 'AT' | 'CH'>(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true })
});

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  first_name: varchar('first_name', { length: 50 }),
  last_name: varchar('last_name', { length: 50 }),
  country_code: varchar('country_code', { length: 2 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  is_admin: boolean('is_admin').default(false).notNull()
});

// Properties table
export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  stage: text('stage')
    .notNull()
    .$type<'demo' | 'production' | 'staging' | 'template'>()
});

export const monitoringLogs = pgTable('monitoring_logs', {
  id: serial('id').primaryKey(),
  status: text('status').notNull().$type<'success' | 'error'>(),
  date: timestamp('date', { withTimezone: true }).notNull().defaultNow(),
  type: text('type').notNull().$type<'pms' | 'door lock' | 'payment'>(),
  booking_nr: text('booking_nr'),
  event: text('event').notNull(),
  sub: text('sub'),
  log_message: text('log_message')
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

// Zod schemas for validation (optional but recommended)
export const insertReservationSchema = createInsertSchema(reservations);
export const selectReservationSchema = createSelectSchema(reservations);

export const insertGuestSchema = createInsertSchema(guests);
export const selectGuestSchema = createSelectSchema(guests);

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertPropertySchema = createInsertSchema(properties);
export const selectPropertySchema = createSelectSchema(properties);

// Type exports
export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;

export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull()
});

// User-Roles junction table for many-to-many relationship
export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role_id: integer('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' })
});

// Users relations
export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles)
}));

// Roles relations
export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles)
}));

// UserRoles relations (junction table)
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.user_id],
    references: [users.id]
  }),
  role: one(roles, {
    fields: [userRoles.role_id],
    references: [roles.id]
  })
}));

export const insertRoleSchema = createInsertSchema(roles);
export const selectRoleSchema = createSelectSchema(roles);

export const insertUserRoleSchema = createInsertSchema(userRoles);
export const selectUserRoleSchema = createSelectSchema(userRoles);

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
