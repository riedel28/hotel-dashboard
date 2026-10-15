import { describe, expect, it } from 'vitest';

import {
  isCardExpired,
  latestStage,
  paymentSchema,
  paymentStages
} from './payments';

const authorizedAt = new Date('2026-10-01T10:00:00Z');
const capturedAt = new Date('2026-10-02T10:00:00Z');
const paidAt = new Date('2026-10-03T10:00:00Z');

const authorized = {
  authorized_amount: 480,
  authorized_at: authorizedAt,
  captured_amount: null,
  captured_at: null,
  paid_at: null
};
const captured = {
  ...authorized,
  captured_amount: 480,
  captured_at: capturedAt
};
const paid = { ...captured, paid_at: paidAt };

describe('paymentStages', () => {
  const now = new Date('2026-10-04T10:00:00Z');

  it('marks reached stages done, the furthest current, the rest pending', () => {
    expect(paymentStages(captured, now).map((step) => step.state)).toEqual([
      'done',
      'current',
      'pending'
    ]);
  });

  it('leaves nothing current once paid: the payment is finished', () => {
    expect(paymentStages(paid, now).map((step) => step.state)).toEqual([
      'done',
      'done',
      'done'
    ]);
  });

  it('pays out the captured amount', () => {
    expect(paymentStages({ ...paid, captured_amount: 320 }, now)[2]).toEqual({
      stage: 'paid',
      state: 'done',
      amount: 320,
      at: paidAt,
      flag: null
    });
  });
});

describe('partial capture', () => {
  const capturedStep = (payment: typeof captured) => paymentStages(payment)[1];

  it('flags a capture below the authorized amount, also once paid', () => {
    const partial = { flag: { kind: 'partial', of: 480 } };

    expect(capturedStep(captured)).toMatchObject({ flag: null });
    expect(capturedStep({ ...captured, captured_amount: 320 })).toMatchObject(
      partial
    );
    expect(capturedStep({ ...paid, captured_amount: 320 })).toMatchObject(
      partial
    );
  });
});

describe('stale authorization', () => {
  it('flags an authorization left uncaptured for more than five days', () => {
    expect(
      latestStage(authorized, new Date('2026-10-06T10:00:00Z')).flag
    ).toBeNull();
    expect(
      latestStage(authorized, new Date('2026-10-06T10:00:01Z')).flag
    ).toEqual({ kind: 'stale', days: 5 });
  });

  it('never flags a payment that moved on', () => {
    const later = new Date('2026-12-01T00:00:00Z');
    expect(paymentStages(captured, later)[0]).toMatchObject({ flag: null });
    expect(paymentStages(paid, later)[0]).toMatchObject({ flag: null });
  });
});

describe('latestStage', () => {
  it('is the furthest stage reached, with its amount and date', () => {
    const now = new Date('2026-10-02T00:00:00Z');
    expect(latestStage(authorized, now)).toEqual({
      stage: 'authorized',
      amount: 480,
      at: authorizedAt,
      flag: null
    });
    expect(latestStage({ ...captured, captured_amount: 320 })).toMatchObject({
      stage: 'captured',
      amount: 320,
      at: capturedAt
    });
    expect(latestStage({ ...paid, captured_amount: 320 })).toMatchObject({
      stage: 'paid',
      amount: 320,
      at: paidAt
    });
  });
});

describe('isCardExpired', () => {
  const card = { card_exp_month: 10, card_exp_year: 2026 };

  it('keeps a card valid through the last day of its month', () => {
    expect(isCardExpired(card, new Date(2026, 9, 31, 23, 59))).toBe(false);
    expect(isCardExpired(card, new Date(2026, 10, 1))).toBe(true);
  });

  it('handles a December expiry', () => {
    const december = { card_exp_month: 12, card_exp_year: 2026 };
    expect(isCardExpired(december, new Date(2026, 11, 31))).toBe(false);
    expect(isCardExpired(december, new Date(2027, 0, 1))).toBe(true);
  });
});

describe('paymentSchema', () => {
  it('takes only the last four digits of a card, never a full number', () => {
    const payment = {
      id: 1,
      reservation_id: 1,
      booking_nr: 'RES-1',
      room_name: null,
      type: 'deposit',
      currency: 'EUR',
      ...authorized,
      reference: 'PSP-1',
      card_brand: 'visa',
      card_last4: '4242',
      card_exp_month: 1,
      card_exp_year: 2030,
      card_holder: 'A. Guest'
    };

    expect(paymentSchema.parse(payment).card_last4).toBe('4242');
    expect(() =>
      paymentSchema.parse({ ...payment, card_last4: '4242424242424242' })
    ).toThrow();
    expect(() =>
      paymentSchema.parse({ ...payment, card_brand: 'paypal' })
    ).toThrow();
  });
});
