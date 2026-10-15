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

/**
 * The furthest stage a payment has reached, with that stage's amount and date.
 * The database computes the same stage for filtering (payments.stage); keep
 * the two in step.
 */
export function latestStage(payment: StageFields): {
  stage: PaymentStage;
  amount: number;
  at: Date;
} {
  // The schema's checks guarantee a captured amount once captured
  const captured = payment.captured_amount ?? payment.authorized_amount;

  if (payment.paid_at) {
    return { stage: 'paid', amount: captured, at: payment.paid_at };
  }
  if (payment.captured_at) {
    return { stage: 'captured', amount: captured, at: payment.captured_at };
  }
  return {
    stage: 'authorized',
    amount: payment.authorized_amount,
    at: payment.authorized_at
  };
}

/** Less was captured than authorized; stays true once paid. */
export function isPartialCapture(
  payment: Pick<Payment, 'authorized_amount' | 'captured_amount'>
) {
  return (
    payment.captured_amount !== null &&
    payment.captured_amount < payment.authorized_amount
  );
}

/** Authorized only, and longer ago than STALE_AUTHORIZATION_DAYS. */
export function isStaleAuthorization(payment: StageFields, now = new Date()) {
  return (
    latestStage(payment).stage === 'authorized' &&
    now.getTime() - payment.authorized_at.getTime() >
      STALE_AUTHORIZATION_DAYS * DAY_MS
  );
}

/** A card is good through the last day of its expiry month. */
export function isCardExpired(
  card: Pick<Payment, 'card_exp_month' | 'card_exp_year'>,
  now = new Date()
) {
  // Month is 1-based, so this is the first day of the month after expiry
  return now >= new Date(card.card_exp_year, card.card_exp_month, 1);
}
