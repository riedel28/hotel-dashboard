import { z } from 'zod';

import { ADYEN_METHOD_IDS } from './providers';

export const paymentTypeSchema = z.enum([
  'prepayment',
  'deposit',
  'final',
  'no_show'
]);

// The stages a payment goes through, in order. Each is reached at most once.
export const paymentStageSchema = z.enum(['authorized', 'captured', 'paid']);

// The card brands the gateway takes; PayPal is a method, not a card
export const cardBrandSchema = z.enum(ADYEN_METHOD_IDS).exclude(['paypal']);

// Only what is safe to show: a card number never reaches the API, just its
// last four digits.
export const paymentSchema = z.object({
  id: z.number(),
  reservation_id: z.number(),
  booking_nr: z.string(),
  room_name: z.string().nullable(),
  type: paymentTypeSchema,
  currency: z.string().length(3),
  authorized_amount: z.coerce.number(),
  authorized_at: z.coerce.date(),
  // Null until captured; at most the authorized amount
  captured_amount: z.coerce.number().nullable(),
  captured_at: z.coerce.date().nullable(),
  // Paid out is the captured amount, so it has a date only
  paid_at: z.coerce.date().nullable(),
  reference: z.string(),
  card_brand: cardBrandSchema,
  card_last4: z.string().regex(/^\d{4}$/),
  card_exp_month: z.number().int().min(1).max(12),
  card_exp_year: z.number().int(),
  card_holder: z.string()
});

const dateStringSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'must be an ISO date'
  });

export const sortablePaymentColumnsSchema = z.enum(['updated_at', 'amount']);

export const fetchPaymentsParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => [5, 10, 25, 50, 100].includes(val), {
      message: 'per_page must be one of: 5, 10, 25, 50, 100'
    })
    .default(50),
  // Reservation number or reference (partial), or a card's last four digits
  q: z.string().max(200).optional(),
  status: paymentStageSchema.optional(),
  // ISO date or datetime, both bounds inclusive, on the latest stage's date
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  sort_by: sortablePaymentColumnsSchema.default('updated_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export const paymentIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const fetchPaymentsResponseSchema = z.object({
  index: z.array(paymentSchema),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  page_count: z.number().int().nonnegative()
});

export type PaymentType = z.infer<typeof paymentTypeSchema>;
export type PaymentStage = z.infer<typeof paymentStageSchema>;
export type CardBrand = z.infer<typeof cardBrandSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type FetchPaymentsParams = z.infer<typeof fetchPaymentsParamsSchema>;
export type FetchPaymentsResponse = z.infer<typeof fetchPaymentsResponseSchema>;

// An authorization not captured within this many days is flagged: the hold
// on the guest's card is about to lapse.
const STALE_AUTHORIZATION_DAYS = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

type StageFields = Pick<
  Payment,
  | 'authorized_amount'
  | 'authorized_at'
  | 'captured_amount'
  | 'captured_at'
  | 'paid_at'
>;

/** Why a reached stage needs attention. */
export type StageFlag =
  // Authorized and not captured for longer than STALE_AUTHORIZATION_DAYS
  | { kind: 'stale'; days: number }
  // Captured less than the authorized amount, which is `of`
  | { kind: 'partial'; of: number };

/** A stage the payment has reached, with its amount and date. */
export interface ReachedStage {
  stage: PaymentStage;
  amount: number;
  at: Date;
  flag: StageFlag | null;
}

/** One row of a payment's history, every stage in order. */
export type StageStep =
  | (ReachedStage & { state: 'done' | 'current' })
  | { stage: PaymentStage; state: 'pending' };

/** The stages reached so far, in order; authorization always is. */
function reachedStages(
  payment: StageFields,
  now: Date
): [ReachedStage, ...ReachedStage[]] {
  const age = now.getTime() - payment.authorized_at.getTime();
  // The schema's checks pair each stage's amount with its date
  const captured =
    payment.captured_at && payment.captured_amount !== null
      ? { amount: payment.captured_amount, at: payment.captured_at }
      : null;

  const authorized: ReachedStage = {
    stage: 'authorized',
    amount: payment.authorized_amount,
    at: payment.authorized_at,
    flag:
      !captured && age > STALE_AUTHORIZATION_DAYS * DAY_MS
        ? { kind: 'stale', days: Math.floor(age / DAY_MS) }
        : null
  };
  if (!captured) {
    return [authorized];
  }

  const capturedStage: ReachedStage = {
    stage: 'captured',
    ...captured,
    flag:
      captured.amount < payment.authorized_amount
        ? { kind: 'partial', of: payment.authorized_amount }
        : null
  };
  if (!payment.paid_at) {
    return [authorized, capturedStage];
  }

  // Paid out is the captured amount
  return [
    authorized,
    capturedStage,
    { stage: 'paid', amount: captured.amount, at: payment.paid_at, flag: null }
  ];
}

/**
 * Every stage in order: the reached ones done, the furthest of them current
 * unless the payment is paid (and so finished), the rest pending.
 */
export function paymentStages(
  payment: StageFields,
  now = new Date()
): StageStep[] {
  const reached = reachedStages(payment, now);

  return paymentStageSchema.options.map((stage, index): StageStep => {
    const step = reached[index];
    if (!step) {
      return { stage, state: 'pending' };
    }
    const isCurrent = index === reached.length - 1 && stage !== 'paid';
    return { ...step, state: isCurrent ? 'current' : 'done' };
  });
}

/**
 * The furthest stage a payment has reached. The database computes the same
 * for filtering and sorting (payments.stage, last_stage_at,
 * last_stage_amount); keep the two in step.
 */
export function latestStage(payment: StageFields, now = new Date()) {
  const [authorized, ...later] = reachedStages(payment, now);
  return later.at(-1) ?? authorized;
}

/** A card is good through the last day of its expiry month. */
export function isCardExpired(
  card: Pick<Payment, 'card_exp_month' | 'card_exp_year'>,
  now = new Date()
) {
  // Month is 1-based, so this is the first day of the month after expiry
  return now >= new Date(card.card_exp_year, card.card_exp_month, 1);
}
