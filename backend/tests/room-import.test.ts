import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { eq } from 'drizzle-orm';
import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import { devices, reservations, rooms, users } from '../src/db/schema';
import {
  createTestProperty,
  createTestRoom,
  createTestUser
} from './helpers/db-helpers';

const day = 24 * 60 * 60 * 1000;
const template = (extension: string) =>
  readFileSync(
    join(__dirname, `../../public/templates/rooms-template.${extension}`)
  );

describe('Rooms import', () => {
  let admin: string;
  let member: string;
  let propertyId: string;
  let otherPropertyId: string;

  const userOf = async (propertyId: string, is_admin: boolean) => {
    const { user, token } = await createTestUser({ is_admin });
    await db
      .update(users)
      .set({ selected_property_id: propertyId })
      .where(eq(users.id, user.id));
    return `Bearer ${token}`;
  };

  const room = (
    room_number: string,
    extra: Partial<Parameters<typeof createTestRoom>[0]> = {}
  ) =>
    createTestRoom({
      property_id: propertyId,
      room_number,
      name: `Room ${room_number}`,
      floor: 1,
      ...extra
    });

  const reserve = (room_name: string) =>
    db.insert(reservations).values({
      state: 'pending',
      booking_nr: `B-${Math.random()}`,
      room_name,
      booking_from: new Date(Date.now() + day),
      booking_to: new Date(Date.now() + 2 * day)
    });

  const send = (
    step: 'preview' | 'apply',
    file: string | Buffer,
    fields: Record<string, string> = {},
    { authorization = admin, filename = 'rooms.csv' } = {}
  ) =>
    request(app)
      .post(`/api/rooms/import/${step}`)
      .set('Authorization', authorization)
      .field(fields)
      .attach('file', Buffer.from(file), filename);

  // Preview, then apply what it showed
  const importFile = async (file: string, mode = 'merge') => {
    const preview = await send('preview', file, { mode });
    return send('apply', file, { mode, token: preview.body.token });
  };

  const stored = async (ofProperty = propertyId) =>
    (
      await db
        .select()
        .from(rooms)
        .where(eq(rooms.property_id, ofProperty))
        .orderBy(rooms.room_number)
    ).map((r) => [r.room_number, r.name, r.room_type, r.floor]);

  beforeEach(async () => {
    propertyId = (await createTestProperty({ name: 'Hotel A' })).id;
    otherPropertyId = (await createTestProperty({ name: 'Hotel B' })).id;
    admin = await userOf(propertyId, true);
    member = await userOf(propertyId, false);
  });

  describe('preview', () => {
    test('plans without changing anything', async () => {
      await room('101');
      const res = await send(
        'preview',
        'number,name,type,floor\n101,Room 101,Suite,1\n102,,Standard,2\n,x,Suite,1\n'
      );

      expect(res.status).toBe(200);
      expect(res.body.mode).toBe('merge');
      expect(res.body.summary).toEqual({
        create: 1,
        update: 1,
        unchanged: 0,
        errors: 1,
        delete: 0
      });
      expect(res.body.rows.map((r: { line: number }) => r.line)).toEqual([
        2, 3, 4
      ]);
      expect(await stored()).toEqual([['101', 'Room 101', 'Standard', 1]]);
    });

    test('reads Excel-style CSV: BOM, semicolons, any header case', async () => {
      const res = await send(
        'preview',
        '﻿Floor;Number;Extra;TYPE\r\n-1;B1;x;Loft\r\n'
      );
      expect(res.body.rows[0]).toMatchObject({
        status: 'new',
        room_number: 'B1',
        room_type: 'Loft',
        floor: -1,
        name: 'B1'
      });
    });

    test('reads the XLSX and CSV templates alike', async () => {
      const xlsx = await send(
        'preview',
        template('xlsx'),
        {},
        {
          filename: 'rooms.xlsx'
        }
      );
      const csv = await send('preview', template('csv'));

      expect(xlsx.status).toBe(200);
      expect(xlsx.body.rows).toEqual(csv.body.rows);
      expect(xlsx.body.rows).toMatchObject([
        {
          room_number: '101',
          name: 'Garden view',
          room_type: 'Standard',
          floor: 1
        },
        { room_number: '102', name: '102', room_type: 'Suite', floor: 1 }
      ]);
    });

    test('replace lists the rooms the file leaves out', async () => {
      await room('101');
      await room('102');
      await room('103');
      await reserve('Room 103');
      await createTestRoom({
        property_id: otherPropertyId,
        room_number: '900'
      });

      const res = await send('preview', 'number,type\n101,Standard\n', {
        mode: 'replace'
      });
      expect(res.body.deletions).toMatchObject([
        { room_number: '102', has_active_reservation: false },
        { room_number: '103', has_active_reservation: true }
      ]);
      expect(res.body.summary.delete).toBe(1);
    });

    test('refuses files it cannot use', async () => {
      const code = async (...args: Parameters<typeof send>) =>
        (await send(...args)).body.code;

      expect(await code('preview', 'name,floor\nx,1\n')).toBe(
        'MISSING_COLUMNS'
      );
      expect(await code('preview', 'number,type\n')).toBe('EMPTY_FILE');
      expect(
        await code('preview', 'not a zip', {}, { filename: 'a.xlsx' })
      ).toBe('UNREADABLE_FILE');
      expect(await code('preview', 'x', {}, { filename: 'a.pdf' })).toBe(
        'UNSUPPORTED_FILE'
      );
      expect(
        await code(
          'preview',
          `number,type\n${Array.from({ length: 5001 }, (_, i) => `${i},S`).join('\n')}`
        )
      ).toBe('TOO_MANY_ROWS');

      const big = await send('preview', Buffer.alloc(5 * 1024 * 1024 + 1));
      expect(big.status).toBe(413);
      expect(big.body.code).toBe('FILE_TOO_LARGE');

      const none = await request(app)
        .post('/api/rooms/import/preview')
        .set('Authorization', admin);
      expect(none.body.code).toBe('FILE_REQUIRED');
    });

    test('is for administrators', async () => {
      const res = await send(
        'preview',
        'number,type\n1,S\n',
        {},
        {
          authorization: member
        }
      );
      expect(res.status).toBe(403);
    });
  });

  describe('apply', () => {
    test('merge creates and updates, and leaves the rest alone', async () => {
      await room('101');
      await room('102');

      const res = await importFile(
        'number,name,type,floor\n101,Garden,Suite,\n103,,Standard,3\n104,x,,1\n'
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        created: 1,
        updated: 1,
        deleted: 0,
        skipped: 1
      });
      expect(await stored()).toEqual([
        ['101', 'Garden', 'Suite', null],
        ['102', 'Room 102', 'Standard', 1],
        ['103', '103', 'Standard', 3]
      ]);
    });

    test('replace also deletes, but never a room with an active reservation', async () => {
      await room('101');
      const { id } = await room('102');
      await room('103');
      await reserve('Room 103');
      await db
        .insert(devices)
        .values({ serial_number: 'SN1', pin_hash: 'x', room_id: id });
      await createTestRoom({
        property_id: otherPropertyId,
        room_number: '900'
      });

      const res = await importFile('number,type\n101,Standard\n', 'replace');

      expect(res.body).toEqual({
        created: 0,
        updated: 0,
        deleted: 1,
        skipped: 1
      });
      expect((await stored()).map(([number]) => number)).toEqual([
        '101',
        '103'
      ]);
      expect(await stored(otherPropertyId)).toHaveLength(1);
      const [device] = await db.select().from(devices);
      expect(device.room_id).toBeNull();
    });

    test('answers 409 when the rooms changed since the preview', async () => {
      await room('101');
      const file = 'number,type\n101,Suite\n102,Suite\n';
      const preview = await send('preview', file);

      // Someone adds room 102 meanwhile
      await room('102');

      const res = await send('apply', file, { token: preview.body.token });
      expect(res.status).toBe(409);
      expect(res.body.code).toBe('IMPORT_PREVIEW_STALE');
      expect((await stored())[0][2]).toBe('Standard');

      // A fresh preview goes through
      const again = await importFile(file);
      expect(again.body).toMatchObject({ created: 0, updated: 2 });
    });

    test('a preview of one mode does not apply the other', async () => {
      await room('101');
      await room('102');
      const file = 'number,type\n101,Standard\n';
      const preview = await send('preview', file, { mode: 'merge' });

      const res = await send('apply', file, {
        mode: 'replace',
        token: preview.body.token
      });
      expect(res.status).toBe(409);
      expect(await stored()).toHaveLength(2);
      expect((await send('apply', file)).status).toBe(409);
    });
  });
});
