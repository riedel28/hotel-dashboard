import { eq } from 'drizzle-orm';
import request from 'supertest';

import {
  checkinBackgroundMaxBytes,
  type CheckinSettings,
  defaultCheckinSettings,
  type SaveCheckinSettingsData
} from '../../shared/types/checkin';
import app from '../src/app';
import { db } from '../src/db/pool';
import { properties } from '../src/db/schema';
import { createTestProperty, createTestSession } from './helpers/db-helpers';

// The smallest valid PNG: enough for the upload, which checks the extension.
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

describe('Check-in settings API', () => {
  let auth: string;
  let otherAuth: string;
  let propertyId: string;

  const settings = async (session = auth) =>
    (
      await request(app)
        .get('/api/checkin-settings')
        .set('Authorization', session)
        .expect(200)
    ).body as CheckinSettings;

  const save = (overrides: Partial<SaveCheckinSettingsData> = {}) =>
    request(app)
      .put('/api/checkin-settings')
      .set('Authorization', auth)
      .send({ ...defaultCheckinSettings, ...overrides });

  const setEnabled = (enabled: boolean) =>
    request(app)
      .put('/api/checkin-settings/enabled')
      .set('Authorization', auth)
      .send({ enabled })
      .expect(200);

  const uploadBackground = async (session = auth) =>
    (
      await request(app)
        .post('/api/checkin-settings/background')
        .set('Authorization', session)
        .attach('file', png, 'lobby.png')
        .expect(201)
    ).body.id as string;

  beforeEach(async () => {
    propertyId = (await createTestProperty({ name: 'Hotel A' })).id;
    const otherPropertyId = (await createTestProperty({ name: 'Hotel B' })).id;
    auth = await createTestSession(propertyId, false);
    otherAuth = await createTestSession(otherPropertyId, false);
  });

  test('a property that never switched it on gets the defaults, off', async () => {
    expect(await settings()).toEqual({
      enabled: false,
      ...defaultCheckinSettings,
      guest_url: null
    });
  });

  test('the guest URL follows the guest app domain', async () => {
    await db
      .update(properties)
      .set({ pwa_domain: 'hotel-a.example.com' })
      .where(eq(properties.id, propertyId));

    expect((await settings()).guest_url).toBe(
      'https://hotel-a.example.com/checkin'
    );
  });

  test('switching off and on again keeps the settings', async () => {
    await setEnabled(true);
    await save({ first_send_days: 7, reminder_days: 2 }).expect(200);

    const off = (await setEnabled(false)).body as CheckinSettings;
    expect(off).toMatchObject({ enabled: false, first_send_days: 7 });

    const on = (await setEnabled(true)).body as CheckinSettings;
    expect(on).toMatchObject({
      enabled: true,
      first_send_days: 7,
      reminder_days: 2
    });
  });

  test('saving leaves whether it is on as it is', async () => {
    await setEnabled(true);
    const saved = (await save({ auto_send: false }).expect(200))
      .body as CheckinSettings;
    expect(saved).toMatchObject({ enabled: true, auto_send: false });
  });

  test('refuses a reminder no closer to arrival than the first send', async () => {
    await save({ first_send_days: 2, reminder_days: 2 }).expect(400);
    await save({ first_send_days: 1, reminder_days: 1 }).expect(400);
    await save({ first_send_days: 1, reminder_days: null }).expect(200);
  });

  test('does not check the reminder while links are not sent', async () => {
    await save({
      auto_send: false,
      first_send_days: 1,
      reminder_days: 3
    }).expect(200);
  });

  test('refuses days outside the options', async () => {
    await save({ first_send_days: 4 as 5 }).expect(400);
    await save({ reminder_days: 5 as 1 }).expect(400);
  });

  test('a custom background needs an image of the property', async () => {
    await save({ background: 'custom' }).expect(400);

    const otherImage = await uploadBackground(otherAuth);
    await save({ background: 'custom', custom_image_id: otherImage }).expect(
      400
    );

    const image = await uploadBackground();
    const saved = (
      await save({ background: 'custom', custom_image_id: image }).expect(200)
    ).body as CheckinSettings;
    expect(saved).toMatchObject({
      background: 'custom',
      custom_image_id: image
    });
  });

  test('keeps the custom image while a preset is picked', async () => {
    const image = await uploadBackground();
    const saved = (
      await save({ background: 'corridor', custom_image_id: image }).expect(200)
    ).body as CheckinSettings;
    expect(saved).toMatchObject({
      background: 'corridor',
      custom_image_id: image
    });
  });

  test('refuses a background that is too large or not an image', async () => {
    await request(app)
      .post('/api/checkin-settings/background')
      .set('Authorization', auth)
      .attach('file', Buffer.alloc(checkinBackgroundMaxBytes + 1), 'big.png')
      .expect(413);

    await request(app)
      .post('/api/checkin-settings/background')
      .set('Authorization', auth)
      .attach('file', Buffer.from('%PDF'), 'menu.pdf')
      .expect(400);
  });

  test('keeps to the selected property', async () => {
    await setEnabled(true);
    expect((await settings(otherAuth)).enabled).toBe(false);
  });

  test('requires authentication', async () => {
    await request(app).get('/api/checkin-settings').expect(401);
  });
});
