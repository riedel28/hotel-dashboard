import { eq } from 'drizzle-orm';
import request from 'supertest';

import type { HotelEvent, SaveEventData } from '../../shared/types/events';
import app from '../src/app';
import { db } from '../src/db/pool';
import { cmsImages, properties } from '../src/db/schema';
import { createTestProperty, createTestSession } from './helpers/db-helpers';

// The smallest valid PNG: enough for the upload, which checks the extension.
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

const hour = 60 * 60 * 1000;
const day = 24 * hour;
const at = (offset: number) => new Date(Date.now() + offset).toISOString();

describe('Events API', () => {
  let auth: string;
  let otherAuth: string;
  let noPropertyAuth: string;
  let propertyId: string;

  const event = (overrides: Partial<SaveEventData> = {}): SaveEventData => ({
    title: 'Jazz night',
    description: '<p>Live <strong>jazz</strong></p>',
    categories: ['music'],
    starts_at: at(2 * day),
    ends_at: at(2 * day + 3 * hour),
    doors_open_at: at(2 * day - hour),
    venue_name: 'Lobby bar',
    address_line_1: 'Hauptstraße 1',
    address_line_2: null,
    zip: '10115',
    city: 'Berlin',
    country_code: 'DE',
    image_ids: [],
    ...overrides
  });

  const create = async (overrides: Partial<SaveEventData> = {}) =>
    (
      await request(app)
        .post('/api/events')
        .set('Authorization', auth)
        .send(event(overrides))
        .expect(201)
    ).body as HotelEvent;

  const titles = async (query: object = {}) =>
    (
      await request(app)
        .get('/api/events')
        .set('Authorization', auth)
        .query(query)
        .expect(200)
    ).body.index.map((e: HotelEvent) => e.title);

  const uploadImage = async () =>
    (
      await request(app)
        .post('/api/events/images')
        .set('Authorization', auth)
        .attach('file', png, 'pixel.png')
        .expect(201)
    ).body.id as string;

  beforeEach(async () => {
    propertyId = (await createTestProperty({ name: 'Hotel A' })).id;
    const otherPropertyId = (await createTestProperty({ name: 'Hotel B' })).id;
    auth = await createTestSession(propertyId, false);
    otherAuth = await createTestSession(otherPropertyId, false);
    noPropertyAuth = await createTestSession(null, false);
  });

  test('creates, reads, updates and deletes an event', async () => {
    const created = await create();
    expect(created).toMatchObject({
      title: 'Jazz night',
      categories: ['music'],
      image_ids: []
    });

    await request(app)
      .get(`/api/events/${created.id}`)
      .set('Authorization', auth)
      .expect(200);

    const updated = await request(app)
      .put(`/api/events/${created.id}`)
      .set('Authorization', auth)
      .send(event({ title: 'Jazz & wine', address_line_2: '' }))
      .expect(200);
    expect(updated.body).toMatchObject({
      title: 'Jazz & wine',
      address_line_2: null
    });

    await request(app)
      .delete(`/api/events/${created.id}`)
      .set('Authorization', auth)
      .expect(200);
    await request(app)
      .get(`/api/events/${created.id}`)
      .set('Authorization', auth)
      .expect(404);
  });

  test('sanitizes the description', async () => {
    const created = await create({
      description: '<p>Hi<script>alert(1)</script></p>'
    });
    expect(created.description).toBe('<p>Hi</p>');
  });

  test('keeps events to their property', async () => {
    const created = await create();
    await request(app)
      .get(`/api/events/${created.id}`)
      .set('Authorization', otherAuth)
      .expect(404);
    await request(app)
      .delete(`/api/events/${created.id}`)
      .set('Authorization', otherAuth)
      .expect(404);
    const list = await request(app)
      .get('/api/events')
      .set('Authorization', noPropertyAuth)
      .expect(200);
    expect(list.body).toMatchObject({ index: [], total: 0 });
  });

  test('rejects an end before the start and doors after it', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', auth)
      .send(
        event({
          ends_at: at(day),
          doors_open_at: at(3 * day)
        })
      )
      .expect(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        { field: 'ends_at', message: 'event_end_order' },
        { field: 'doors_open_at', message: 'event_doors_order' }
      ])
    );
  });

  describe('list', () => {
    beforeEach(async () => {
      await create({
        title: 'Later',
        starts_at: at(5 * day),
        ends_at: at(6 * day),
        doors_open_at: null
      });
      await create({
        title: 'Soon',
        starts_at: at(day),
        ends_at: at(day + hour),
        doors_open_at: null,
        categories: ['food_drink', 'party']
      });
      // Started an hour ago, still running: upcoming, not past
      await create({
        title: 'Now',
        starts_at: at(-hour),
        ends_at: at(hour),
        doors_open_at: null
      });
      await create({
        title: 'Gone',
        starts_at: at(-3 * day),
        ends_at: at(-2 * day),
        doors_open_at: null
      });
    });

    test('shows upcoming events by start, ascending', async () => {
      expect(await titles()).toEqual(['Now', 'Soon', 'Later']);
    });

    test('filters by period, title and category', async () => {
      expect(await titles({ period: 'past' })).toEqual(['Gone']);
      expect(await titles({ period: 'all' })).toHaveLength(4);
      expect(await titles({ q: 'soo' })).toEqual(['Soon']);
      expect(await titles({ category: ['party', 'kids'] })).toEqual(['Soon']);
    });

    test('takes the date range as days in the property timezone', async () => {
      await db
        .update(properties)
        .set({ timezone: 'Pacific/Auckland' })
        .where(eq(properties.id, propertyId));
      const dayOf = (offset: number) =>
        new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Pacific/Auckland'
        }).format(new Date(Date.now() + offset));

      expect(
        await titles({
          period: 'all',
          from: dayOf(5 * day),
          to: dayOf(5 * day)
        })
      ).toEqual(['Later']);
    });
  });

  describe('images', () => {
    test('keeps them in order and refuses another property’s', async () => {
      const [a, b] = [await uploadImage(), await uploadImage()];
      const created = await create({ image_ids: [b, a] });
      expect(created.image_ids).toEqual([b, a]);

      await request(app)
        .post('/api/events')
        .set('Authorization', otherAuth)
        .send(event({ image_ids: [a] }))
        .expect(400);
    });

    test('takes files up to 5 MB, beyond the CMS limit', async () => {
      const big = Buffer.concat([png, Buffer.alloc(3 * 1024 * 1024)]);
      await request(app)
        .post('/api/events/images')
        .set('Authorization', auth)
        .attach('file', big, 'big.png')
        .expect(201);
    });

    test('are not swept while an event uses them', async () => {
      const kept = await uploadImage();
      await create({ image_ids: [kept] });
      await db
        .update(cmsImages)
        .set({ created_at: new Date(Date.now() - 2 * day) });

      const other = await create();
      await request(app)
        .delete(`/api/events/${other.id}`)
        .set('Authorization', auth)
        .expect(200);

      const left = await db.select({ id: cmsImages.id }).from(cmsImages);
      expect(left.map((row) => row.id)).toEqual([kept]);
    });
  });
});
