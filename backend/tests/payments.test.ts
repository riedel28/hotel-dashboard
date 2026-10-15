import request from 'supertest';

import { latestStage, paymentSchema } from '../../shared/types/payments';
import app from '../src/app';
import { payments } from '../src/db/payments-schema';
import { db } from '../src/db/pool';
import { reservations } from '../src/db/schema';
import { createTestUser } from './helpers/db-helpers';

const card = {
  card_brand: 'visa' as const,
  card_last4: '4242',
  card_exp_month: 12,
  card_exp_year: 2030,
  card_holder: 'Ada Guest'
};

describe('Payments API', () => {
  let authToken: string;
  let reservationId: number;

  const get = (path: string, status = 200) =>
    request(app)
      .get(`/api/payments${path}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(status);

  beforeEach(async () => {
    const { token } = await createTestUser({ password: 'Password123!' });
    authToken = token;

    const [reservation] = await db
      .insert(reservations)
      .values({
        state: 'pending',
        booking_nr: 'RES-100',
        room_name: 'Deluxe Suite',
        booking_from: new Date(),
        booking_to: new Date()
      })
      .returning();
    reservationId = reservation!.id;

    await db.insert(payments).values([
      {
        ...card,
        reservation_id: reservationId,
        type: 'prepayment',
        authorized_amount: '480.00',
        authorized_at: new Date('2026-01-01T10:00:00Z'),
        reference: 'PSPAAAA0001ZZZZ'
      },
      {
        ...card,
        card_last4: '1881',
        reservation_id: reservationId,
        type: 'final',
        authorized_amount: '480.00',
        authorized_at: new Date('2026-01-02T10:00:00Z'),
        captured_amount: '320.00',
        captured_at: new Date('2026-01-03T10:00:00Z'),
        reference: 'PSPBBBB0002YYYY'
      },
      {
        ...card,
        card_last4: '0005',
        reservation_id: reservationId,
        type: 'deposit',
        currency: 'CHF',
        authorized_amount: '100.00',
        authorized_at: new Date('2026-01-04T10:00:00Z'),
        captured_amount: '100.00',
        captured_at: new Date('2026-01-05T10:00:00Z'),
        paid_at: new Date('2026-01-06T10:00:00Z'),
        reference: 'PSPCCCC0003XXXX'
      }
    ]);
  });

  test('lists payments with their reservation, newest stage first', async () => {
    const response = await get('');

    expect(response.body.total).toBe(3);
    const index = response.body.index.map((row: unknown) =>
      paymentSchema.parse(row)
    );
    expect(index.map((p: { reference: string }) => p.reference)).toEqual([
      'PSPCCCC0003XXXX',
      'PSPBBBB0002YYYY',
      'PSPAAAA0001ZZZZ'
    ]);
    expect(index[0]).toMatchObject({
      booking_nr: 'RES-100',
      room_name: 'Deluxe Suite',
      currency: 'CHF'
    });
  });

  test('never sends a card number, only its last four digits', async () => {
    const response = await get('');

    for (const row of response.body.index) {
      expect(
        Object.keys(row)
          .filter((key) => key.startsWith('card_'))
          .sort()
      ).toEqual([
        'card_brand',
        'card_exp_month',
        'card_exp_year',
        'card_holder',
        'card_last4'
      ]);
      expect(row.card_last4).toMatch(/^\d{4}$/);
    }
  });

  test('filters by the stage the database computes, which latestStage matches', async () => {
    for (const status of ['authorized', 'captured', 'paid'] as const) {
      const response = await get(`?status=${status}`);

      expect(response.body.total).toBe(1);
      expect(
        latestStage(paymentSchema.parse(response.body.index[0])).stage
      ).toBe(status);
    }
  });

  test('searches reservation number, reference and whole card digits', async () => {
    expect((await get('?q=res-100')).body.total).toBe(3);
    expect((await get('?q=BBBB0002')).body.total).toBe(1);
    expect((await get('?q=1881')).body.index[0].reference).toBe(
      'PSPBBBB0002YYYY'
    );
    // Part of a card's digits matches nothing
    expect((await get('?q=188')).body.total).toBe(0);
  });

  test("filters on the latest stage's date", async () => {
    const response = await get(
      '?from=2026-01-03T00:00:00Z&to=2026-01-03T23:59:59Z'
    );

    expect(response.body.total).toBe(1);
    expect(response.body.index[0].reference).toBe('PSPBBBB0002YYYY');
  });

  test("sorts by the latest stage's amount", async () => {
    const response = await get('?sort_by=amount&sort_order=asc');

    expect(
      response.body.index.map((p: { reference: string }) => p.reference)
    ).toEqual(['PSPCCCC0003XXXX', 'PSPBBBB0002YYYY', 'PSPAAAA0001ZZZZ']);
  });

  test('gets one payment, and 404 for a missing one', async () => {
    const list = await get('');
    const id = list.body.index[0].id;

    expect((await get(`/${id}`)).body.reference).toBe('PSPCCCC0003XXXX');
    await get('/999999', 404);
  });

  test('rejects stages out of order and captures above the authorization', async () => {
    const base = {
      ...card,
      reservation_id: reservationId,
      type: 'final' as const,
      authorized_amount: '100.00',
      authorized_at: new Date('2026-01-01T10:00:00Z'),
      reference: 'PSPBAD'
    };

    await expect(
      db.insert(payments).values({ ...base, paid_at: new Date() })
    ).rejects.toThrow();
    await expect(
      db.insert(payments).values({
        ...base,
        captured_amount: '150.00',
        captured_at: new Date('2026-01-02T10:00:00Z')
      })
    ).rejects.toThrow();
  });

  test('requires authentication', async () => {
    await request(app).get('/api/payments').expect(401);
  });
});
