import { relations, sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
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
  uniqueIndex,
  uuid
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  type ReservationState,
  reservationStateSchema
} from '../../../shared/types/reservations';

export const reservations = pgTable(
  'reservations',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    state: text('state').notNull().$type<ReservationState>(),
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
    uniqueIndex('reservations_booking_nr_key').on(table.booking_nr),
    index('reservations_received_at_idx').on(table.received_at),
    index('reservations_booking_from_idx').on(table.booking_from),
    index('reservations_booking_to_idx').on(table.booking_to),
    check(
      'reservations_state_check',
      sql`${table.state} IN (${sql.raw(
        reservationStateSchema.options.map((state) => `'${state}'`).join(', ')
      )})`
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
    nationality_code: text('nationality_code').notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
  },
  (table) => [index('guests_reservation_id_idx').on(table.reservation_id)]
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
    // Base64 `data:image/webp` string, not a URL — see docs/adr/0001-avatar-as-data-uri.md
    avatar_url: text('avatar_url'),
    // AES-256-GCM ciphertext, never the raw base32 secret
    totp_secret: text('totp_secret'),
    // Null while a secret is merely pending — 2FA counts as on only once this is set
    totp_enabled_at: timestamp('totp_enabled_at', { withTimezone: true }),
    totp_last_used_at: timestamp('totp_last_used_at', { withTimezone: true }),
    // Bumped to sign the user out everywhere; compared against the claim in the JWT
    token_version: integer('token_version').default(0).notNull(),
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

// Customers own Properties: one Customer, many Properties.
export const customers = pgTable(
  'customers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    first_name: text('first_name').notNull(),
    last_name: text('last_name').notNull(),
    company_name: text('company_name'),
    email: text('email').notNull(),
    address_line_1: text('address_line_1').notNull(),
    address_line_2: text('address_line_2'),
    zip: text('zip').notNull(),
    city: text('city').notNull(),
    country_code: text('country_code').notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    // Emails are matched case-insensitively
    uniqueIndex('customers_email_key').on(sql`lower(${table.email})`)
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
    // Empty means every nav item is shown, so new catalog entries are on by
    // default for existing properties.
    disabled_nav_items: text('disabled_nav_items')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    // Solutions the Property has booked, see propertyOptionSchema.
    options: text('options')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    // Set exactly when `options` has mobile_app_pwa.
    pwa_domain: text('pwa_domain'),
    // Null for a Property nobody owns yet (templates, fresh demos). RESTRICT:
    // a Customer that still owns Properties cannot be deleted.
    customer_id: uuid('customer_id').references(() => customers.id, {
      onDelete: 'restrict'
    }),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index('properties_customer_id_idx').on(table.customer_id),
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

// Guest devices. A device exists before any Property owns it (property_id is
// null); claiming it with its PIN assigns it to the caller's Property.
export const devices = pgTable(
  'devices',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    serial_number: text('serial_number').notNull(),
    pin_hash: text('pin_hash').notNull(),
    property_id: uuid('property_id').references(() => properties.id, {
      onDelete: 'set null'
    }),
    room_id: bigint('room_id', { mode: 'number' }).references(() => rooms.id, {
      onDelete: 'set null'
    }),
    name: text('name'),
    last_seen_at: timestamp('last_seen_at', { withTimezone: true }),
    app_version: text('app_version'),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    // Serial numbers are matched case-insensitively
    uniqueIndex('devices_serial_number_key').on(
      sql`lower(${table.serial_number})`
    ),
    index('devices_property_id_idx').on(table.property_id),
    index('devices_room_id_idx').on(table.room_id)
  ]
);

// Product categories (per-property tree via self-referencing parent_id).
// FKs use the default NO ACTION so deleting a category that still has
// children or products fails, while a property delete still cascades cleanly.
export const productCategories = pgTable(
  'product_categories',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    property_id: uuid('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    parent_id: bigint('parent_id', { mode: 'number' }).references(
      (): AnyPgColumn => productCategories.id
    ),
    title: text('title').notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index('product_categories_property_id_idx').on(table.property_id),
    index('product_categories_parent_id_idx').on(table.parent_id)
  ]
);

// Products (per-property, each in exactly one category)
export const products = pgTable(
  'products',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    property_id: uuid('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    category_id: bigint('category_id', { mode: 'number' })
      .notNull()
      .references(() => productCategories.id),
    title: text('title').notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull().default(0),
    description: text('description'),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index('products_property_id_idx').on(table.property_id),
    index('products_category_id_idx').on(table.category_id),
    check('products_price_check', sql`${table.price} >= 0`),
    check('products_quantity_check', sql`${table.quantity} >= 0`)
  ]
);

// Guest ABC entries table (per-property alphabetical guest directory)
export const guestAbcEntries = pgTable(
  'guest_abc_entries',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    property_id: uuid('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    letter: text('letter').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index('guest_abc_entries_property_id_idx').on(table.property_id),
    index('guest_abc_entries_letter_idx').on(table.letter)
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
    index('monitoring_logs_booking_nr_idx').on(table.booking_nr),
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

export type GuestAbcEntry = typeof guestAbcEntries.$inferSelect;
export type NewGuestAbcEntry = typeof guestAbcEntries.$inferInsert;

export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

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

// Two-factor recovery codes — one row per code, hashed, spent by stamping used_at
export const twoFactorRecoveryCodes = pgTable(
  'two_factor_recovery_codes',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    user_id: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    code_hash: text('code_hash').notNull(),
    used_at: timestamp('used_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [index('two_factor_recovery_codes_user_id_idx').on(table.user_id)]
);

// Users relations
export const usersRelations = relations(users, ({ many, one }) => ({
  userRoles: many(userRoles),
  emailVerificationTokens: many(emailVerificationTokens),
  twoFactorRecoveryCodes: many(twoFactorRecoveryCodes),
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

// Two-factor recovery codes relations
export const twoFactorRecoveryCodesRelations = relations(
  twoFactorRecoveryCodes,
  ({ one }) => ({
    user: one(users, {
      fields: [twoFactorRecoveryCodes.user_id],
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
export const propertiesRelations = relations(properties, ({ many, one }) => ({
  customer: one(customers, {
    fields: [properties.customer_id],
    references: [customers.id]
  }),
  rooms: many(rooms),
  guestAbcEntries: many(guestAbcEntries),
  productCategories: many(productCategories),
  products: many(products)
}));

// Customers relations
export const customersRelations = relations(customers, ({ many }) => ({
  properties: many(properties)
}));

// Guest ABC entries relations
export const guestAbcEntriesRelations = relations(
  guestAbcEntries,
  ({ one }) => ({
    property: one(properties, {
      fields: [guestAbcEntries.property_id],
      references: [properties.id]
    })
  })
);

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
