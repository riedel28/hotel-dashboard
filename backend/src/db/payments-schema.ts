import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core';

import {
  type CardBrand,
  cardBrandSchema,
  type PaymentStage,
  type PaymentType,
  paymentTypeSchema
} from '../../../shared/types/payments';
import { reservations } from './schema';

// A card payment for a reservation as the gateway reports it: authorized,
// then captured (possibly less than authorized), then paid out. Only the
// card's last four digits are kept, never its number.
export const payments = pgTable(
  'payments',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    reservation_id: bigint('reservation_id', { mode: 'number' })
      .notNull()
      .references(() => reservations.id, { onDelete: 'cascade' }),
    type: text('type').notNull().$type<PaymentType>(),
    currency: text('currency').notNull().default('EUR'),
    authorized_amount: numeric('authorized_amount', {
      precision: 10,
      scale: 2
    }).notNull(),
    authorized_at: timestamp('authorized_at', { withTimezone: true }).notNull(),
    captured_amount: numeric('captured_amount', { precision: 10, scale: 2 }),
    captured_at: timestamp('captured_at', { withTimezone: true }),
    // Paid out is the captured amount, so the stage has a date only
    paid_at: timestamp('paid_at', { withTimezone: true }),
    reference: text('reference').notNull(),
    card_brand: text('card_brand').notNull().$type<CardBrand>(),
    card_last4: text('card_last4').notNull(),
    card_exp_month: integer('card_exp_month').notNull(),
    card_exp_year: integer('card_exp_year').notNull(),
    card_holder: text('card_holder').notNull(),
    // The furthest stage, its date and amount, for filtering and sorting. The
    // client derives the same with latestStage() in shared/types/payments.ts.
    stage: text('stage')
      .$type<PaymentStage>()
      .generatedAlwaysAs(
        sql`CASE WHEN paid_at IS NOT NULL THEN 'paid' WHEN captured_at IS NOT NULL THEN 'captured' ELSE 'authorized' END`
      ),
    last_stage_at: timestamp('last_stage_at', {
      withTimezone: true
    }).generatedAlwaysAs(sql`COALESCE(paid_at, captured_at, authorized_at)`),
    // Paid out is the captured amount, so paid and captured share it
    last_stage_amount: numeric('last_stage_amount', {
      precision: 10,
      scale: 2
    }).generatedAlwaysAs(sql`COALESCE(captured_amount, authorized_amount)`)
  },
  (table) => [
    index('payments_reservation_id_idx').on(table.reservation_id),
    index('payments_stage_idx').on(table.stage),
    index('payments_last_stage_at_idx').on(table.last_stage_at),
    check(
      'payments_type_check',
      sql`${table.type} IN (${sql.raw(
        paymentTypeSchema.options.map((type) => `'${type}'`).join(', ')
      )})`
    ),
    check(
      'payments_card_brand_check',
      sql`${table.card_brand} IN (${sql.raw(
        cardBrandSchema.options.map((brand) => `'${brand}'`).join(', ')
      )})`
    ),
    check('payments_currency_check', sql`${table.currency} ~ '^[A-Z]{3}$'`),
    check('payments_card_last4_check', sql`${table.card_last4} ~ '^[0-9]{4}$'`),
    check(
      'payments_card_exp_month_check',
      sql`${table.card_exp_month} BETWEEN 1 AND 12`
    ),
    check(
      'payments_authorized_amount_check',
      sql`${table.authorized_amount} > 0`
    ),
    // A stage's amount and date come together, and stages are reached in
    // order: captured after authorized, paid after captured
    check(
      'payments_captured_check',
      sql`(${table.captured_at} IS NULL) = (${table.captured_amount} IS NULL)
        AND (${table.captured_at} IS NULL OR (
          ${table.captured_amount} > 0
          AND ${table.captured_amount} <= ${table.authorized_amount}
          AND ${table.captured_at} >= ${table.authorized_at}))`
    ),
    check(
      'payments_paid_check',
      sql`${table.paid_at} IS NULL OR (
        ${table.captured_at} IS NOT NULL
        AND ${table.paid_at} >= ${table.captured_at})`
    )
  ]
);
