import { and, eq } from 'drizzle-orm';
import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import { providerConfigs, users } from '../src/db/schema';
import { decryptSecret } from '../src/utils/secret-box';
import { createTestProperty, createTestUser } from './helpers/db-helpers';

describe('Providers API', () => {
  let auth: string;
  let otherAuth: string;
  let noPropertyAuth: string;
  let propertyId: string;
  let userId: number;

  const adyen = {
    environment: 'test',
    merchantId: 'HotelECOM',
    clientKey: 'test_CLIENT'
  };
  const casablanca = { hotelId: 'H-100' };
  const apaleo = { clientId: 'AUBY-SP', propertyId: 'MUC' };

  const get = (kind: string, as = auth) =>
    request(app).get(`/api/providers/${kind}`).set('Authorization', as);
  const put = (kind: string, body: object, as = auth) =>
    request(app)
      .put(`/api/providers/${kind}`)
      .set('Authorization', as)
      .send(body);

  const storedSecret = async (kind: 'payment' | 'pms') => {
    const [row] = await db
      .select()
      .from(providerConfigs)
      .where(
        and(
          eq(providerConfigs.property_id, propertyId),
          eq(providerConfigs.kind, kind)
        )
      );
    return decryptSecret(row.secret_encrypted);
  };

  beforeEach(async () => {
    const property = await createTestProperty({ name: 'Hotel A' });
    const otherProperty = await createTestProperty({ name: 'Hotel B' });
    propertyId = property.id;

    const { user, token } = await createTestUser({ first_name: 'Ada' });
    const { user: other, token: otherToken } = await createTestUser();
    userId = user.id;
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
    await request(app).get('/api/providers/payment').expect(401);
  });

  test('only configurable kinds exist', async () => {
    await get('door_lock').expect(404);
    await get('nonsense').expect(404);
    await put('door_lock', {}).expect(404);
  });

  test('is null until a provider is set up', async () => {
    expect((await get('payment').expect(200)).body).toBeNull();
    expect((await get('pms').expect(200)).body).toBeNull();
  });

  test('sets up a provider, names who did it and never returns the secret', async () => {
    const { body: saved } = await put('payment', {
      provider: 'adyen',
      secret: 'secret-key',
      config: adyen
    }).expect(200);

    const { body } = await get('payment').expect(200);

    expect(body).toEqual(saved);
    expect(body).toMatchObject({
      provider: 'adyen',
      secretConfigured: true,
      config: { ...adyen, addressLine1: '', mappings: { visa: {} } },
      updated_by: { id: userId, first_name: 'Ada' }
    });
    expect(JSON.stringify(body)).not.toContain('secret-key');
    expect(await storedSecret('payment')).toBe('secret-key');
  });

  test('an empty secret keeps the stored one, a new one replaces it', async () => {
    const save = (secret: string, mockCode: string) =>
      put('pms', {
        provider: 'casablanca',
        secret,
        config: { ...casablanca, mockCode }
      }).expect(200);

    await save('first-token', '');
    const { body } = await save('', 'MOCK');
    expect(body.config.mockCode).toBe('MOCK');
    expect(await storedSecret('pms')).toBe('first-token');

    await save('second-token', 'MOCK');
    expect(await storedSecret('pms')).toBe('second-token');
  });

  test('each kind keeps its own provider', async () => {
    await put('payment', {
      provider: 'adyen',
      secret: 'k',
      config: adyen
    }).expect(200);
    await put('pms', {
      provider: 'apaleo',
      secret: 's',
      config: apaleo
    }).expect(200);

    expect((await get('payment')).body.provider).toBe('adyen');
    expect((await get('pms')).body).toMatchObject({
      provider: 'apaleo',
      config: { ...apaleo, groupFolioByRatePlan: false }
    });
  });

  test('another provider of the same kind replaces the current one, and needs its own secret', async () => {
    await put('pms', {
      provider: 'casablanca',
      secret: 'token',
      config: casablanca
    }).expect(200);

    // Casablanca's token is not Apaleo's secret
    await put('pms', { provider: 'apaleo', secret: '', config: apaleo }).expect(
      400
    );
    expect((await get('pms')).body.provider).toBe('casablanca');

    await put('pms', {
      provider: 'apaleo',
      secret: 'apaleo-secret',
      config: apaleo
    }).expect(200);

    const { body } = await get('pms').expect(200);
    expect(body).toMatchObject({ provider: 'apaleo', config: apaleo });
    expect(body.config).not.toHaveProperty('hotelId');
    expect(await storedSecret('pms')).toBe('apaleo-secret');
  });

  test('validates the request', async () => {
    // First setup needs a secret
    await put('payment', {
      provider: 'adyen',
      secret: '',
      config: adyen
    }).expect(400);
    await put('payment', {
      provider: 'adyen',
      secret: 'k',
      config: { ...adyen, merchantId: ' ' }
    }).expect(400);
    await put('payment', {
      provider: 'adyen',
      secret: 'k',
      config: { ...adyen, mappings: { visa: { ecom: 'abc' } } }
    }).expect(400);
    // Not available yet
    await put('payment', {
      provider: 'payone',
      secret: 'k',
      config: adyen
    }).expect(400);
    // A provider of another kind, and one with the wrong configuration
    await put('pms', { provider: 'adyen', secret: 'k', config: adyen }).expect(
      400
    );
    await put('pms', {
      provider: 'apaleo',
      secret: 'k',
      config: casablanca
    }).expect(400);
  });

  test("one property's provider is invisible to another", async () => {
    await put('pms', {
      provider: 'casablanca',
      secret: 'token',
      config: casablanca
    }).expect(200);

    expect((await get('pms', otherAuth).expect(200)).body).toBeNull();
  });

  test('without a selected property there is nothing to read or write', async () => {
    expect((await get('pms', noPropertyAuth).expect(200)).body).toBeNull();

    await put(
      'pms',
      { provider: 'casablanca', secret: 'k', config: casablanca },
      noPropertyAuth
    ).expect(400);
  });
});
