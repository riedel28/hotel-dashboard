import { eq } from 'drizzle-orm';
import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import { devices, rooms, users } from '../src/db/schema';
import { hashPassword } from '../src/utils/password';
import {
  createTestProperty,
  createTestRoom,
  createTestUser
} from './helpers/db-helpers';

const PIN = '482100937715';

describe('Devices API', () => {
  let auth: string;
  let otherAuth: string;
  let noPropertyAuth: string;
  let roomId: number;
  let otherRoomId: number;

  beforeEach(async () => {
    const property = await createTestProperty({ name: 'Hotel A' });
    const otherProperty = await createTestProperty({ name: 'Hotel B' });

    const { user, token } = await createTestUser();
    const { user: other, token: otherToken } = await createTestUser();
    await db
      .update(users)
      .set({ selected_property_id: property.id })
      .where(eq(users.id, user.id));
    await db
      .update(users)
      .set({ selected_property_id: otherProperty.id })
      .where(eq(users.id, other.id));
    const { token: noPropertyToken } = await createTestUser();

    auth = `Bearer ${token}`;
    otherAuth = `Bearer ${otherToken}`;
    noPropertyAuth = `Bearer ${noPropertyToken}`;

    roomId = (await createTestRoom({ property_id: property.id })).id;
    otherRoomId = (await createTestRoom({ property_id: otherProperty.id })).id;

    await db.insert(devices).values({
      serial_number: 'R9KT40A22MN',
      pin_hash: await hashPassword(PIN)
    });
  });

  const claim = (authorization: string, body: object) =>
    request(app)
      .post('/api/devices/claim')
      .set('Authorization', authorization)
      .send(body);

  const list = async (authorization: string) => {
    const res = await request(app)
      .get('/api/devices')
      .set('Authorization', authorization);
    expect(res.status).toBe(200);
    return res.body;
  };

  describe('access', () => {
    it('requires authentication', async () => {
      await request(app).get('/api/devices').expect(401);
      await request(app).post('/api/devices/claim').expect(401);
    });

    it('returns an empty list and rejects a claim without a selected property', async () => {
      expect(await list(noPropertyAuth)).toEqual([]);
      const res = await claim(noPropertyAuth, {
        serial_number: 'R9KT40A22MN',
        pin: PIN
      });
      expect(res.status).toBe(400);
    });
  });

  describe('claim', () => {
    it('adds an unclaimed device to the selected property only', async () => {
      expect(await list(auth)).toEqual([]);

      const res = await claim(auth, {
        // serial numbers match case-insensitively
        serial_number: ' r9kt40a22mn ',
        pin: PIN,
        name: 'Tablet 206',
        room_id: roomId
      });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        serial_number: 'R9KT40A22MN',
        name: 'Tablet 206',
        room: { id: roomId }
      });
      expect(res.body).not.toHaveProperty('pin_hash');

      expect(await list(auth)).toHaveLength(1);
      expect(await list(otherAuth)).toEqual([]);
    });

    it('claims without a name and a room', async () => {
      const res = await claim(auth, { serial_number: 'R9KT40A22MN', pin: PIN });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: null, room: null });
    });

    it('creates a device for a serial number nobody registered', async () => {
      const created = await claim(auth, {
        serial_number: 'BRAND-NEW-1',
        pin: PIN,
        room_id: roomId
      });
      expect(created.status).toBe(201);
      expect(created.body).toMatchObject({
        serial_number: 'BRAND-NEW-1',
        room: { id: roomId },
        last_seen_at: null
      });
      expect(await list(auth)).toHaveLength(1);

      // From then on it is a known device like any other
      const again = await claim(otherAuth, {
        serial_number: 'brand-new-1',
        pin: PIN
      });
      expect(again.body.code).toBe('DEVICE_ALREADY_CLAIMED');
      const wrongPin = await claim(otherAuth, {
        serial_number: 'BRAND-NEW-1',
        pin: '000000000000'
      });
      expect(wrongPin.body.code).toBe('INVALID_PIN');
    });

    it('answers with a code per failure', async () => {
      const wrongPin = await claim(auth, {
        serial_number: 'R9KT40A22MN',
        pin: '000000000000'
      });
      expect(wrongPin.status).toBe(422);
      expect(wrongPin.body.code).toBe('INVALID_PIN');

      await claim(auth, { serial_number: 'R9KT40A22MN', pin: PIN }).expect(201);
      for (const authorization of [auth, otherAuth]) {
        const again = await claim(authorization, {
          serial_number: 'R9KT40A22MN',
          pin: PIN
        });
        expect(again.status).toBe(409);
        expect(again.body.code).toBe('DEVICE_ALREADY_CLAIMED');
      }

      // Without the PIN, a claimed device looks like any other wrong PIN
      const probe = await claim(otherAuth, {
        serial_number: 'R9KT40A22MN',
        pin: '000000000000'
      });
      expect(probe.body.code).toBe('INVALID_PIN');
    });

    it('rejects a malformed PIN and a room of another property', async () => {
      await claim(auth, { serial_number: 'R9KT40A22MN', pin: '1234' }).expect(
        400
      );
      await claim(auth, {
        serial_number: 'R9KT40A22MN',
        pin: PIN,
        room_id: otherRoomId
      }).expect(400);
      expect(await list(auth)).toEqual([]);
    });
  });

  describe('room assignment', () => {
    let deviceId: number;

    const assign = (authorization: string, room_id: number | null) =>
      request(app)
        .patch(`/api/devices/${deviceId}`)
        .set('Authorization', authorization)
        .send({ room_id });

    beforeEach(async () => {
      const res = await claim(auth, { serial_number: 'R9KT40A22MN', pin: PIN });
      deviceId = res.body.id;
    });

    it('assigns, moves and unassigns', async () => {
      const assigned = await assign(auth, roomId);
      expect(assigned.status).toBe(200);
      expect(assigned.body.room.id).toBe(roomId);
      expect((await list(auth))[0].room.id).toBe(roomId);

      const unassigned = await assign(auth, null);
      expect(unassigned.status).toBe(200);
      expect(unassigned.body.room).toBeNull();
    });

    it("rejects another property's room and another property's device", async () => {
      await assign(auth, otherRoomId).expect(400);
      await assign(otherAuth, otherRoomId).expect(404);
    });

    it('unassigns the device when its room is deleted', async () => {
      await assign(auth, roomId).expect(200);
      await db.delete(rooms).where(eq(rooms.id, roomId));
      expect((await list(auth))[0].room).toBeNull();
    });
  });

  it('lists every room of the property as a room option', async () => {
    const res = await request(app)
      .get('/api/devices/room-options')
      .set('Authorization', auth);
    expect(res.status).toBe(200);
    expect(res.body.map((room: { id: number }) => room.id)).toEqual([roomId]);
  });
});
