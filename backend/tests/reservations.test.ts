import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import { guests as guestsTable } from '../src/db/schema';
import {
  createTestProperty,
  createTestRoom,
  createTestUser
} from './helpers/db-helpers';

// What a new reservation needs besides its room
const stay = {
  purpose: 'private',
  booking_from: '2026-03-01T15:00:00.000Z',
  booking_to: '2026-03-03T11:00:00.000Z',
  adults: 1,
  youth: 0,
  children: 0,
  infants: 0,
  guests: []
};

describe('Reservations API', () => {
  let authToken: string;
  let adminToken: string;

  beforeEach(async () => {
    const { token } = await createTestUser({
      password: 'Password123!'
    });
    authToken = token;

    const { token: aToken } = await createTestUser({
      is_admin: true,
      email: `admin-${Date.now()}@example.com`
    });
    adminToken = aToken;
  });

  describe('POST /api/reservations', () => {
    test('should create a new reservation successfully', async () => {
      const reservationData = {
        ...stay,
        room_name: 'Room 101'
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.booking_nr).toBeTruthy();
      expect(response.body.room_name).toBe(reservationData.room_name);
      expect(response.body.state).toBe('pending');
      expect(response.body.balance).toBe('0.00');
      expect(response.body.adults).toBe(1);
    });

    test('should create the reservation with its stay and guests', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...stay,
          room_name: 'Room 101',
          purpose: 'business',
          adults: 2,
          guests: [
            {
              first_name: 'Ada',
              last_name: 'Lovelace',
              email: 'ada@example.com',
              nationality_code: 'GB',
              is_primary: false,
              age_group: 'adult'
            },
            {
              first_name: 'Charles',
              last_name: 'Babbage',
              email: null,
              nationality_code: 'GB',
              is_primary: true,
              age_group: 'adult'
            }
          ]
        })
        .expect(201);

      expect(response.body.booking_from).toBe(stay.booking_from);
      expect(response.body.booking_to).toBe(stay.booking_to);
      expect(response.body.purpose).toBe('business');
      expect(response.body.adults).toBe(2);
      expect(response.body.guests).toHaveLength(2);
      // The reservation mirrors its primary guest
      expect(response.body.primary_guest_name).toBe('Charles Babbage');
      expect(response.body.guest_email).toBeNull();
    });

    test('should report the number of the room the reservation names', async () => {
      const property = await createTestProperty();
      await createTestRoom({
        property_id: property.id,
        name: 'Seaside',
        room_number: '204'
      });

      const named = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...stay, room_name: 'Seaside' })
        .expect(201);
      const unknown = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...stay, room_name: 'No such room' })
        .expect(201);

      expect(named.body.room_number).toBe('204');
      expect(unknown.body.room_number).toBeNull();

      // Sorted by what the list shows: the number, failing that the name
      const list = await request(app)
        .get('/api/reservations?sort_by=room_name&sort_order=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(
        list.body.index.map(
          (reservation: { room_number: string | null }) =>
            reservation.room_number
        )
      ).toEqual(['204', null]);
    });

    test('should reject a departure that is not after the arrival', async () => {
      await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...stay,
          room_name: 'Room 101',
          booking_to: stay.booking_from
        })
        .expect(400);
    });

    test('should reject an empty room', async () => {
      await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...stay, room_name: '' })
        .expect(400);
    });

    test('should return 401 without authentication', async () => {
      const reservationData = {
        ...stay,
        room_name: 'Room 101'
      };

      await request(app)
        .post('/api/reservations')
        .send(reservationData)
        .expect(401);
    });

    test('should return 400 for missing required fields', async () => {
      const reservationData = {};

      await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(400);
    });
  });

  describe('booking number uniqueness', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    const createReservation = () =>
      request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...stay, room_name: 'Room 101' });

    test('should retry with a new booking number on collision', async () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const first = await createReservation().expect(201);
      const second = await createReservation().expect(201);

      expect(second.body.booking_nr).not.toBe(first.body.booking_nr);
      expect(second.body.booking_nr.startsWith(first.body.booking_nr)).toBe(
        true
      );
    });

    test('should return 409 when updating to an existing booking number', async () => {
      const first = await createReservation().expect(201);
      const second = await createReservation().expect(201);

      await request(app)
        .patch(`/api/reservations/${second.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ booking_nr: first.body.booking_nr })
        .expect(409);
    });
  });

  describe('GET /api/reservations', () => {
    beforeEach(async () => {
      const reservationData = {
        ...stay,
        room_name: 'Room 101'
      };

      await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData);
    });

    test('should get all reservations successfully', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('index');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('per_page');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page_count');
      expect(Array.isArray(response.body.index)).toBe(true);
      expect(response.body.index.length).toBe(1);
    });

    test('should get reservations with pagination', async () => {
      const response = await request(app)
        .get('/api/reservations?page=1&per_page=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.per_page).toBe(5);
    });

    test('should filter reservations by status', async () => {
      const response = await request(app)
        .get('/api/reservations?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(
        response.body.index.every(
          (r: { state: string }) => r.state === 'pending'
        )
      ).toBe(true);
    });

    test('should search reservations by booking number', async () => {
      const response = await request(app)
        .get('/api/reservations?q=BK123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(
        response.body.index.every((r: { booking_nr: string }) =>
          r.booking_nr.includes('BK123')
        )
      ).toBe(true);
    });

    test('should search reservations by guest name', async () => {
      const created = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...stay, room_name: 'Room 102' })
        .expect(201);
      await db.insert(guestsTable).values([
        {
          reservation_id: created.body.id,
          first_name: 'Jane',
          last_name: 'Smith',
          nationality_code: 'DE'
        },
        {
          reservation_id: created.body.id,
          first_name: 'Alex',
          last_name: 'Zimmermann',
          nationality_code: 'DE'
        }
      ]);

      // Last name, a fellow traveler, both spellings of a full name
      for (const q of ['smith', 'zimmer', 'Jane Smith', 'Smith, Jane']) {
        const response = await request(app)
          .get('/api/reservations')
          .query({ q })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(
          response.body.index.map((r: { id: number }) => r.id),
          q
        ).toEqual([created.body.id]);
        expect(response.body.total, q).toBe(1);
      }
    });

    test('should return 401 without authentication', async () => {
      await request(app).get('/api/reservations').expect(401);
    });
  });

  describe('GET /api/reservations/:id', () => {
    let reservationId: number;

    beforeEach(async () => {
      const reservationData = {
        ...stay,
        room_name: 'Room 101'
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData);

      reservationId = response.body.id;
    });

    test('should get reservation by id successfully', async () => {
      const response = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(reservationId);
      expect(response.body.booking_nr).toBeTruthy();
      expect(response.body).toHaveProperty('guests');
    });

    test('should return 404 for non-existent reservation', async () => {
      await request(app)
        .get('/api/reservations/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should return 401 without authentication', async () => {
      await request(app).get(`/api/reservations/${reservationId}`).expect(401);
    });

    test('should return 400 for invalid id parameter', async () => {
      await request(app)
        .get('/api/reservations/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PATCH /api/reservations/:id', () => {
    let reservationId: number;

    beforeEach(async () => {
      const reservationData = {
        ...stay,
        room_name: 'Room 101'
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData);

      reservationId = response.body.id;
    });

    test('should update reservation successfully', async () => {
      const updateData = {
        state: 'checked_in',
        primary_guest_name: 'John Doe',
        guest_email: 'john@example.com'
      };

      const response = await request(app)
        .patch(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(reservationId);
      expect(response.body.state).toBe('checked_in');
      expect(response.body.primary_guest_name).toBe('John Doe');
      expect(response.body.guest_email).toBe('john@example.com');
      expect(response.body.updated_at).toBeTruthy();
    });

    test('should mirror the primary guest onto the reservation', async () => {
      const guest = (first_name: string, is_primary: boolean) => ({
        age_group: is_primary ? 'adult' : 'child',
        id: 0,
        reservation_id: reservationId,
        first_name,
        last_name: 'Doe',
        email: `${first_name.toLowerCase()}@example.com`,
        nationality_code: 'DE',
        is_primary,
        created_at: new Date(),
        updated_at: null
      });

      const response = await request(app)
        .patch(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ guests: [guest('Jane', false), guest('John', true)] })
        .expect(200);

      expect(response.body.primary_guest_name).toBe('John Doe');
      expect(response.body.guest_email).toBe('john@example.com');
      expect(
        response.body.guests
          .filter((g: { is_primary: boolean }) => g.is_primary)
          .map((g: { first_name: string }) => g.first_name)
      ).toEqual(['John']);
      expect(
        response.body.guests.find(
          (g: { first_name: string }) => g.first_name === 'Jane'
        ).age_group
      ).toBe('child');

      // The primary guest comes first, whatever order they were sent in.
      expect(response.body.guests[0].first_name).toBe('John');

      // A list nobody is flagged in gets its first guest as the primary one.
      const promoted = await request(app)
        .patch(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ guests: [guest('Jane', false)] })
        .expect(200);

      expect(promoted.body.primary_guest_name).toBe('Jane Doe');
      expect(promoted.body.guests[0].is_primary).toBe(true);

      // An empty list clears the mirrored columns.
      const cleared = await request(app)
        .patch(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ guests: [] })
        .expect(200);

      expect(cleared.body.primary_guest_name).toBe('');
      expect(cleared.body.guest_email).toBeNull();
    });

    test('should reject a departure that is not after the arrival', async () => {
      await request(app)
        .patch(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          booking_from: stay.booking_to,
          booking_to: stay.booking_from
        })
        .expect(400);
    });

    test('should return 404 for non-existent reservation', async () => {
      const updateData = {
        state: 'checked_in'
      };

      await request(app)
        .patch('/api/reservations/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });

    test('should return 401 without authentication', async () => {
      const updateData = {
        state: 'checked_in'
      };

      await request(app)
        .patch(`/api/reservations/${reservationId}`)
        .send(updateData)
        .expect(401);
    });

    test('should update room_name when room is changed to a valid room ID', async () => {
      const property = await createTestProperty();
      const room = await createTestRoom({
        property_id: property.id,
        name: 'Penthouse Suite'
      });

      const response = await request(app)
        .patch(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ room: String(room.id) })
        .expect(200);

      expect(response.body.room).toBe(String(room.id));
      expect(response.body.room_name).toBe('Penthouse Suite');
    });

    test('should validate state values', async () => {
      const updateData = {
        state: 'invalid-state'
      };

      await request(app)
        .patch(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /api/reservations/:id', () => {
    let reservationId: number;

    beforeEach(async () => {
      const reservationData = {
        ...stay,
        room_name: 'Room 101'
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData);

      reservationId = response.body.id;
    });

    test('should delete reservation successfully', async () => {
      const response = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(reservationId);

      // Verify reservation is actually deleted
      await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    test('should return 404 for non-existent reservation', async () => {
      await request(app)
        .delete('/api/reservations/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    test('should return 401 without authentication', async () => {
      await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .expect(401);
    });
  });

  describe('Edge Cases', () => {
    test('should handle date range filtering', async () => {
      const reservationData = {
        ...stay,
        room_name: 'Room 101'
      };

      await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData);

      const today = new Date().toISOString().split('T')[0];
      const response = await request(app)
        .get(`/api/reservations?from=${today}&to=${today}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('index');
    });

    test('should handle empty search results', async () => {
      const response = await request(app)
        .get('/api/reservations?q=NONEXISTENT')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    test('should handle large page numbers gracefully', async () => {
      const response = await request(app)
        .get('/api/reservations?page=1000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index).toHaveLength(0);
      expect(response.body.page).toBe(1000);
    });
  });
});
