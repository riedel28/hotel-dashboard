import { eq } from 'drizzle-orm';
import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import { paymentProviderConfigs, users } from '../src/db/schema';
import { decryptSecret } from '../src/utils/secret-box';
import { createTestProperty, createTestUser } from './helpers/db-helpers';

describe('Payment provider API', () => {
  let auth: string;
  let otherAuth: string;
  let noPropertyAuth: string;
  let propertyId: string;

  const credentials = {
    environment: 'test',
    merchantId: 'HotelECOM',
    clientKey: 'test_CLIENT'
  };

  const storedKey = async () => {
    const [row] = await db
      .select()
      .from(paymentProviderConfigs)
      .where(eq(paymentProviderConfigs.property_id, propertyId));
    return decryptSecret(row.api_key_encrypted);
  };

  beforeEach(async () => {
    const property = await createTestProperty({ name: 'Hotel A' });
    const otherProperty = await createTestProperty({ name: 'Hotel B' });
    propertyId = property.id;

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
  });

  test('requires authentication', async () => {
    await request(app).get('/api/payment-provider').expect(401);
  });

  test('is null until a provider is set up', async () => {
    const { body } = await request(app)
      .get('/api/payment-provider')
      .set('Authorization', auth)
      .expect(200);
    expect(body).toBeNull();
  });

  test('sets up a provider with credentials alone and never returns the key', async () => {
    const { body: saved } = await request(app)
      .put('/api/payment-provider')
      .set('Authorization', auth)
      .send({ provider: 'adyen', apiKey: 'secret-key', config: credentials })
      .expect(200);

    const { body } = await request(app)
      .get('/api/payment-provider')
      .set('Authorization', auth)
      .expect(200);

    expect(body).toEqual(saved);
    expect(body).toMatchObject({
      provider: 'adyen',
      apiKeyConfigured: true,
      config: { ...credentials, addressLine1: '', mappings: { visa: {} } }
    });
    expect(JSON.stringify(body)).not.toContain('secret-key');
    expect(await storedKey()).toBe('secret-key');
  });

  test('an empty API key keeps the stored one, a new one replaces it', async () => {
    const put = (apiKey: string, city: string) =>
      request(app)
        .put('/api/payment-provider')
        .set('Authorization', auth)
        .send({ provider: 'adyen', apiKey, config: { ...credentials, city } })
        .expect(200);

    await put('first-key', '');
    const { body } = await put('', 'Amsterdam');
    expect(body.config.city).toBe('Amsterdam');
    expect(await storedKey()).toBe('first-key');

    await put('second-key', 'Amsterdam');
    expect(await storedKey()).toBe('second-key');
  });

  test('validates the request', async () => {
    const put = (body: object) =>
      request(app)
        .put('/api/payment-provider')
        .set('Authorization', auth)
        .send(body)
        .expect(400);

    // First setup needs a key
    await put({ provider: 'adyen', apiKey: '', config: credentials });
    await put({
      provider: 'adyen',
      apiKey: 'k',
      config: { ...credentials, merchantId: ' ' }
    });
    await put({
      provider: 'adyen',
      apiKey: 'k',
      config: { ...credentials, mappings: { visa: { ecom: 'abc' } } }
    });
    // Not available yet
    await put({ provider: 'payone', apiKey: 'k', config: credentials });
  });

  test("one property's provider is invisible to another", async () => {
    await request(app)
      .put('/api/payment-provider')
      .set('Authorization', auth)
      .send({ provider: 'adyen', apiKey: 'secret-key', config: credentials })
      .expect(200);

    const { body } = await request(app)
      .get('/api/payment-provider')
      .set('Authorization', otherAuth)
      .expect(200);
    expect(body).toBeNull();
  });

  test('without a selected property there is nothing to read or write', async () => {
    const { body } = await request(app)
      .get('/api/payment-provider')
      .set('Authorization', noPropertyAuth)
      .expect(200);
    expect(body).toBeNull();

    await request(app)
      .put('/api/payment-provider')
      .set('Authorization', noPropertyAuth)
      .send({ provider: 'adyen', apiKey: 'k', config: credentials })
      .expect(400);
  });
});
