import { relations, sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const reservations = pgTable(
  'reservations',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    state: text('state').notNull().$type<'pending' | 'started' | 'done'>(),
    booking_nr: text('booking_nr').notNull(),
    guest_email: text('guest_email'),
    primary_guest_name: text('primary_guest_name'),
    booking_id: text('booking_id'),
    room_name: text('room_name'),
    booking_from: timestamp('booking_from', { withTimezone: true }).notNull(),
    booking_to: timestamp('booking_to', { withTimezone: true }).notNull(),
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
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    page_url: text('page_url'),
    balance: numeric('balance', { precision: 10, scale: 2 }).default('0'),
    adults: integer('adults').default(0),
    youth: integer('youth').default(0),
    children: integer('children').default(0),
    infants: integer('infants').default(0),
    purpose: text('purpose').default('private').$type<'private' | 'business'>(),
    room: text('room')
  },
  (table) => [
    index('reservations_state_idx').on(table.state),
    index('reservations_received_at_idx').on(table.received_at),
    index('reservations_booking_from_idx').on(table.booking_from),
    index('reservations_booking_to_idx').on(table.booking_to),
    check(
      'reservations_state_check',
      sql`${table.state} IN ('pending', 'started', 'done')`
    ),
    check(
      'reservations_check_in_via_check',
      sql`${table.check_in_via} IS NULL OR ${table.check_in_via} IN ('android', 'ios', 'tv', 'station', 'web')`
    ),
    check(
      'reservations_check_out_via_check',
      sql`${table.check_out_via} IS NULL OR ${table.check_out_via} IN ('android', 'ios', 'tv', 'station', 'web')`
    ),
    check(
      'reservations_purpose_check',
      sql`${table.purpose} IS NULL OR ${table.purpose} IN ('private', 'business')`
    )
  ]
);

export const guests = pgTable(
  'guests',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    reservation_id: bigint('reservation_id', { mode: 'number' })
      .notNull()
      .references(() => reservations.id, { onDelete: 'cascade' }),
    first_name: text('first_name').notNull(),
    last_name: text('last_name').notNull(),
    email: text('email'),
    nationality_code: text('nationality_code')
      .notNull()
      .$type<'DE' | 'US' | 'AT' | 'CH'>(),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
  },
  (table) => [
    index('guests_reservation_id_idx').on(table.reservation_id),
    check(
      'guests_nationality_code_check',
      sql`${table.nationality_code} IN ('DE', 'US', 'AT', 'CH')`
    )
  ]
);

// Users table
export const users = pgTable(
  'users',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    email: text('email').notNull().unique(),
    password: text('password'),
    email_verified: boolean('email_verified').default(false).notNull(),
    first_name: text('first_name'),
    last_name: text('last_name'),
    country_code: text('country_code'),
    selected_property_id: uuid('selected_property_id').references(
      () => properties.id,
      { onDelete: 'set null' }
    ),
    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    is_admin: boolean('is_admin').default(false).notNull()
  },
  (table) => [
    index('users_created_at_idx').on(table.created_at),
    index('users_selected_property_id_idx').on(table.selected_property_id)
  ]
);

// Properties table
export const properties = pgTable(
  'properties',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    country_code: text('country_code').notNull().default('DE'),
    stage: text('stage')
      .notNull()
      .$type<'demo' | 'production' | 'staging' | 'template'>(),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    check(
      'properties_stage_check',
      sql`${table.stage} IN ('demo', 'production', 'staging', 'template')`
    )
  ]
);

// Rooms table
export const rooms = pgTable(
  'rooms',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    property_id: uuid('property_id')
      .notNull()
      .references(() => properties.id, {
        onDelete: 'cascade'
      }),
    room_number: text('room_number'),
    room_type: text('room_type'),
    status: text('status')
      .notNull()
      .default('available')
      .$type<'available' | 'occupied' | 'maintenance' | 'out_of_order'>(),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index('rooms_property_id_idx').on(table.property_id),
    index('rooms_status_idx').on(table.status),
    check(
      'rooms_status_check',
      sql`${table.status} IN ('available', 'occupied', 'maintenance', 'out_of_order')`
    )
  ]
);

export const monitoringLogs = pgTable(
  'monitoring_logs',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    status: text('status').notNull().$type<'success' | 'error'>(),
    logged_at: timestamp('logged_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    type: text('type').notNull().$type<'pms' | 'door lock' | 'payment'>(),
    booking_nr: text('booking_nr'),
    event: text('event').notNull(),
    sub: text('sub'),
    log_message: text('log_message')
  },
  (table) => [
    index('monitoring_logs_status_idx').on(table.status),
    index('monitoring_logs_type_idx').on(table.type),
    index('monitoring_logs_logged_at_idx').on(table.logged_at),
    check(
      'monitoring_logs_status_check',
      sql`${table.status} IN ('success', 'error')`
    ),
    check(
      'monitoring_logs_type_check',
      sql`${table.type} IN ('pms', 'door lock', 'payment')`
    )
  ]
);

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

export const insertRoomSchema = createInsertSchema(rooms);
export const selectRoomSchema = createSelectSchema(rooms);

// Type exports
export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;

export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;

export const roles = pgTable('roles', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull().unique()
});

// User-Roles junction table for many-to-many relationship
export const userRoles = pgTable(
  'user_roles',
  {
    user_id: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role_id: bigint('role_id', { mode: 'number' })
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' })
  },
  (table) => [
    primaryKey({ columns: [table.user_id, table.role_id] }),
    index('user_roles_role_id_idx').on(table.role_id)
  ]
);

// Email verification tokens table
export const emailVerificationTokens = pgTable(
  'email_verification_tokens',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    user_id: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    type: text('type')
      .notNull()
      .$type<'verification' | 'invitation' | 'reset'>(),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    used_at: timestamp('used_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index('email_verification_tokens_user_id_idx').on(table.user_id),
    index('email_verification_tokens_token_idx').on(table.token),
    check(
      'email_verification_tokens_type_check',
      sql`${table.type} IN ('verification', 'invitation', 'reset')`
    )
  ]
);

// Users relations
export const usersRelations = relations(users, ({ many, one }) => ({
  userRoles: many(userRoles),
  emailVerificationTokens: many(emailVerificationTokens),
  selectedProperty: one(properties, {
    fields: [users.selected_property_id],
    references: [properties.id]
  })
}));

// Email verification tokens relations
export const emailVerificationTokensRelations = relations(
  emailVerificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerificationTokens.user_id],
      references: [users.id]
    })
  })
);

// Roles relations
export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles)
}));

// Rooms relations
export const roomsRelations = relations(rooms, ({ one }) => ({
  property: one(properties, {
    fields: [rooms.property_id],
    references: [properties.id]
  })
}));

// Properties relations
export const propertiesRelations = relations(properties, ({ many }) => ({
  rooms: many(rooms)
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

export const insertEmailVerificationTokenSchema = createInsertSchema(
  emailVerificationTokens
);
export const selectEmailVerificationTokenSchema = createSelectSchema(
  emailVerificationTokens
);

export const emailVerificationTokenTypeSchema = z.enum([
  'verification',
  'invitation',
  'reset'
]);

export type EmailVerificationToken =
  typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken =
  typeof emailVerificationTokens.$inferInsert;
