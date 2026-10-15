import { describe, expect, it } from 'vitest';

import {
  isCardExpired,
  isPartialCapture,
  isStaleAuthorization,
  latestStage,
  paymentSchema
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

describe('latestStage', () => {
  it('is the furthest stage reached, with its amount and date', () => {
    expect(latestStage(authorized)).toEqual({
      stage: 'authorized',
      amount: 480,
      at: authorizedAt
    });
    expect(latestStage({ ...captured, captured_amount: 320 })).toEqual({
      stage: 'captured',
      amount: 320,
      at: capturedAt
    });
    expect(latestStage({ ...paid, captured_amount: 320 })).toEqual({
      stage: 'paid',
      amount: 320,
      at: paidAt
    });
  });
});

describe('isPartialCapture', () => {
  it('is set when less was captured than authorized, also once paid', () => {
    expect(isPartialCapture(authorized)).toBe(false);
    expect(isPartialCapture(captured)).toBe(false);
    expect(isPartialCapture({ ...captured, captured_amount: 320 })).toBe(true);
    expect(isPartialCapture({ ...paid, captured_amount: 320 })).toBe(true);
  });
});

describe('isStaleAuthorization', () => {
  it('flags an authorization left uncaptured for more than five days', () => {
    expect(
      isStaleAuthorization(authorized, new Date('2026-10-06T10:00:00Z'))
    ).toBe(false);
    expect(
      isStaleAuthorization(authorized, new Date('2026-10-06T10:00:01Z'))
    ).toBe(true);
  });

  it('never flags a payment that moved on', () => {
    const later = new Date('2026-12-01T00:00:00Z');
    expect(isStaleAuthorization(captured, later)).toBe(false);
    expect(isStaleAuthorization(paid, later)).toBe(false);
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
