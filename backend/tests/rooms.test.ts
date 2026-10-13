import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import { devices, rooms } from '../src/db/schema';
import {
  createTestProperty,
  createTestReservation,
  createTestRoom,
  createTestSession
} from './helpers/db-helpers';

const day = 24 * 60 * 60 * 1000;

describe('Rooms API', () => {
  let admin: string;
  let member: string;
  let otherAdmin: string;
  let noPropertyAdmin: string;
  let propertyId: string;
  let otherPropertyId: string;

  const room = (
    room_number: string,
    extra: Partial<Parameters<typeof createTestRoom>[0]> = {}
  ) =>
    createTestRoom({
      property_id: propertyId,
      room_number,
      name: `Room ${room_number}`,
      ...extra
    });

  const list = (authorization: string, query: object = {}) =>
    request(app)
      .get('/api/rooms')
      .set('Authorization', authorization)
      .query(query);

  const numbers = async (query: object = {}) =>
    (await list(admin, query)).body.index.map(
      (r: { room_number: string }) => r.room_number
    );

  beforeEach(async () => {
    propertyId = (await createTestProperty({ name: 'Hotel A' })).id;
    otherPropertyId = (await createTestProperty({ name: 'Hotel B' })).id;
    admin = await createTestSession(propertyId, true);
    member = await createTestSession(propertyId, false);
    otherAdmin = await createTestSession(otherPropertyId, true);
    noPropertyAdmin = await createTestSession(null, true);
  });

  describe('GET /api/rooms', () => {
    test('lists only the selected property, in natural order by number', async () => {
      for (const number of ['10', '2', '10A', '1']) await room(number);
      await createTestRoom({ property_id: otherPropertyId, room_number: '5' });

      expect(await numbers()).toEqual(['1', '2', '10', '10A']);
      expect(await numbers({ sort_order: 'desc' })).toEqual([
        '10A',
        '10',
        '2',
        '1'
      ]);
    });

    test('is empty without a selected property', async () => {
      await room('1');
      const res = await list(noPropertyAdmin);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ index: [], total: 0, page_count: 0 });
    });

    test('paginates', async () => {
      for (const number of ['1', '2', '3', '4', '5', '6']) await room(number);
      const res = await list(admin, { page: 2, per_page: 5 });
      expect(res.body).toMatchObject({ total: 6, page_count: 2, page: 2 });
      expect(res.body.index).toHaveLength(1);
    });

    test('searches number and name', async () => {
      await room('101', { name: 'Garden' });
      await room('202', { name: 'Lake view' });
      expect(await numbers({ q: '10' })).toEqual(['101']);
      expect(await numbers({ q: 'lake' })).toEqual(['202']);
    });

    test('filters by type, floor and status', async () => {
      await room('101', { room_type: 'Suite', floor: 1 });
      await room('201', { room_type: 'Standard', floor: 2 });
      await room('301', { room_type: null, floor: 3, status: 'maintenance' });
      await room('B1', { room_type: 'Standard', floor: -1 });

      expect(await numbers({ room_type: 'Standard' })).toEqual(['201', 'B1']);
      expect(await numbers({ room_type: ['Suite', ''] })).toEqual([
        '101',
        '301'
      ]);
      expect(await numbers({ floor: [-1, 2] })).toEqual(['201', 'B1']);
      expect(await numbers({ status: 'maintenance' })).toEqual(['301']);
    });

    test('sorts by floor', async () => {
      await room('A', { floor: 2 });
      await room('B', { floor: -1 });
      expect(await numbers({ sort_by: 'floor' })).toEqual(['B', 'A']);
    });

    test('flags rooms with an active reservation', async () => {
      await room('1');
      await room('2');
      await room('3');
      await room('4');
      await createTestReservation('Room 1');
      // Over and checked out
      await createTestReservation('Room 2', {
        state: 'checked_out',
        booking_to: new Date(Date.now() + day)
      });
      // Past its end, but the guest is still in the house
      await createTestReservation('Room 3', {
        state: 'checked_in',
        booking_from: new Date(Date.now() - 3 * day),
        booking_to: new Date(Date.now() - day)
      });
      // Never showed up
      await createTestReservation('Room 4', {
        booking_from: new Date(Date.now() - 3 * day),
        booking_to: new Date(Date.now() - day)
      });

      const res = await list(admin);
      expect(
        res.body.index.map(
          (r: { has_active_reservation: boolean }) => r.has_active_reservation
        )
      ).toEqual([true, false, true, false]);
    });

    test('rejects bad input and missing auth', async () => {
      expect((await list(admin, { per_page: 7 })).status).toBe(400);
      expect((await list(admin, { status: 'nope' })).status).toBe(400);
      expect((await request(app).get('/api/rooms')).status).toBe(401);
    });
  });

  test('GET /api/rooms/filter-options lists the types and floors in use', async () => {
    await room('101', { room_type: 'Suite', floor: 1 });
    await room('102', { room_type: 'Suite', floor: 1 });
    await room('B1', { room_type: null, floor: -1 });
    await createTestRoom({
      property_id: otherPropertyId,
      room_type: 'Penthouse',
      floor: 9
    });

    const res = await request(app)
      .get('/api/rooms/filter-options')
      .set('Authorization', admin);
    expect(res.body).toEqual({ room_types: ['Suite'], floors: [-1, 1] });
  });

  describe('POST /api/rooms', () => {
    const create = (authorization: string, body: object) =>
      request(app)
        .post('/api/rooms')
        .set('Authorization', authorization)
        .send(body);

    test('creates a room in the selected property', async () => {
      const res = await create(admin, {
        room_number: ' 12A ',
        name: 'Garden',
        room_type: 'Suite',
        floor: -1
      });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        room_number: '12A',
        name: 'Garden',
        room_type: 'Suite',
        floor: -1,
        status: 'available',
        property_id: propertyId,
        has_active_reservation: false
      });
    });

    test('names the room after its number when no name is given', async () => {
      const res = await create(admin, { room_number: '7', room_type: 'Suite' });
      expect(res.body.name).toBe('7');
    });

    test('rejects a number taken in the property, whatever its case', async () => {
      await room('12A');
      const res = await create(admin, { room_number: '12a', room_type: 'S' });
      expect(res.status).toBe(409);
      expect(res.body.code).toBe('ROOM_NUMBER_TAKEN');

      // Another property may use the same number
      const other = await create(otherAdmin, {
        room_number: '12A',
        room_type: 'S'
      });
      expect(other.status).toBe(201);
    });

    test('requires number and type', async () => {
      expect((await create(admin, { room_type: 'S' })).status).toBe(400);
      expect(
        (await create(admin, { room_number: '  ', room_type: 'S' })).status
      ).toBe(400);
      expect((await create(admin, { room_number: '1' })).status).toBe(400);
      expect(
        (await create(admin, { room_number: '1', room_type: 'S', floor: 1.5 }))
          .status
      ).toBe(400);
    });

    test('needs an admin with a selected property', async () => {
      const body = { room_number: '1', room_type: 'S' };
      expect((await create(member, body)).status).toBe(403);
      expect((await create(noPropertyAdmin, body)).status).toBe(400);
      expect((await request(app).post('/api/rooms').send(body)).status).toBe(
        401
      );
    });
  });

  describe('GET /api/rooms/:id', () => {
    test('returns a room of the selected property only', async () => {
      const { id } = await room('1');
      const get = (authorization: string) =>
        request(app)
          .get(`/api/rooms/${id}`)
          .set('Authorization', authorization);

      expect((await get(member)).body.room_number).toBe('1');
      expect((await get(otherAdmin)).status).toBe(404);
      expect(
        (await request(app).get('/api/rooms/abc').set('Authorization', admin))
          .status
      ).toBe(400);
    });
  });

  describe('PATCH /api/rooms/:id', () => {
    const update = (authorization: string, id: number, body: object) =>
      request(app)
        .patch(`/api/rooms/${id}`)
        .set('Authorization', authorization)
        .send(body);

    test('updates fields', async () => {
      const { id } = await room('1', { floor: 1 });
      const res = await update(admin, id, {
        room_number: '1B',
        floor: null,
        status: 'maintenance'
      });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        room_number: '1B',
        name: 'Room 1',
        floor: null,
        status: 'maintenance'
      });
    });

    test('an emptied name falls back to the number', async () => {
      const { id } = await room('1');
      const res = await update(admin, id, { name: '' });
      expect(res.body.name).toBe('1');
    });

    test('rejects a taken number', async () => {
      await room('1');
      const { id } = await room('2');
      const res = await update(admin, id, { room_number: '1' });
      expect(res.status).toBe(409);
      expect(res.body.code).toBe('ROOM_NUMBER_TAKEN');
    });

    test('will not rename a room with an active reservation', async () => {
      const { id } = await room('1');
      await createTestReservation('Room 1');

      const renamed = await update(admin, id, { name: 'Garden' });
      expect(renamed.status).toBe(409);
      expect(renamed.body.code).toBe('ROOM_HAS_ACTIVE_RESERVATION');

      // Everything else stays editable
      const res = await update(admin, id, { name: 'Room 1', floor: 3 });
      expect(res.status).toBe(200);
      expect(res.body.floor).toBe(3);
    });

    test('an emptied name follows a number changed in the same request', async () => {
      const { id } = await room('1');
      const res = await update(admin, id, { name: '', room_number: '9' });
      expect(res.body).toMatchObject({ name: '9', room_number: '9' });
    });

    test('is scoped and admin only', async () => {
      const { id } = await room('1');
      expect((await update(otherAdmin, id, { floor: 1 })).status).toBe(404);
      expect((await update(member, id, { floor: 1 })).status).toBe(403);
      expect((await update(admin, 999999, { floor: 1 })).status).toBe(404);
      expect((await update(admin, id, { status: 'nope' })).status).toBe(400);
    });
  });

  describe('DELETE /api/rooms/:id', () => {
    const remove = (authorization: string, id: number) =>
      request(app)
        .delete(`/api/rooms/${id}`)
        .set('Authorization', authorization);

    test('deletes the room and unassigns its devices', async () => {
      const { id } = await room('1');
      await db
        .insert(devices)
        .values({ serial_number: 'SN1', pin_hash: 'x', room_id: id });

      expect((await remove(admin, id)).status).toBe(200);
      expect(await db.select().from(rooms)).toHaveLength(0);
      const [device] = await db.select().from(devices);
      expect(device.room_id).toBeNull();
    });

    test('refuses while the room has an active reservation', async () => {
      const { id } = await room('1');
      await createTestReservation('Room 1');

      const res = await remove(admin, id);
      expect(res.status).toBe(409);
      expect(res.body.code).toBe('ROOM_HAS_ACTIVE_RESERVATION');
      expect(await db.select().from(rooms)).toHaveLength(1);
    });

    test('is scoped and admin only', async () => {
      const { id } = await room('1');
      expect((await remove(otherAdmin, id)).status).toBe(404);
      expect((await remove(member, id)).status).toBe(403);
      expect((await remove(admin, 999999)).status).toBe(404);
      expect(await db.select().from(rooms)).toHaveLength(1);
    });
  });
});
