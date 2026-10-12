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

  const storedSecret = async (kind: 'payment' | 'pms' | 'door_lock') => {
    const [row] = await db
      .select()
      .from(providerConfigs)
      .where(
        and(
          eq(providerConfigs.property_id, propertyId),
          eq(providerConfigs.kind, kind)
        )
      );
    return row.secret_encrypted && decryptSecret(row.secret_encrypted);
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
    await request(app).get('/api/providers/payment').expect(401);
  });

  test('only the kinds of provider exist', async () => {
    await get('nonsense').expect(404);
    await put('nonsense', {}).expect(404);
  });

  test('is null until a provider is set up', async () => {
    expect((await get('payment').expect(200)).body).toBeNull();
    expect((await get('pms').expect(200)).body).toBeNull();
  });

  test('sets up a provider and never returns the secret', async () => {
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
      config: { ...adyen, addressLine1: '', mappings: { visa: {} } }
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

  describe('SALTO, which needs a secret only over SHIP', () => {
    const overPms = { mode: 'pms', host: '10.0.0.5', port: '8090' };
    const overShip = {
      mode: 'ship',
      shipType: 'https',
      shipUrl: 'https://salto.example',
      username: 'ship'
    };
    const save = (config: object, secret = '') =>
      put('door_lock', { provider: 'salto', secret, config });

    test('is set up over the PMS interface without one', async () => {
      const { body } = await save(overPms).expect(200);

      expect(body).toMatchObject({
        provider: 'salto',
        secretConfigured: false,
        config: { ...overPms, username: '' }
      });
      expect(await storedSecret('door_lock')).toBeNull();
    });

    test('takes a password to switch to SHIP, then keeps it', async () => {
      await save(overPms).expect(200);
      await save(overShip).expect(400);

      const { body } = await save(overShip, 'ship-password').expect(200);
      expect(body.secretConfigured).toBe(true);

      // Back and forth without entering it again
      await save({ ...overShip, ...overPms }).expect(200);
      await save({ ...overPms, ...overShip }).expect(200);
      expect(await storedSecret('door_lock')).toBe('ship-password');
    });

    test('checks the fields of the interface in use', async () => {
      await save({ mode: 'pms', host: '', port: '8090' }).expect(400);
      await save({ mode: 'pms', host: 'h', port: '70000' }).expect(400);
      await save({ ...overShip, shipUrl: '' }, 'p').expect(400);
      await save({ ...overShip, username: '' }, 'p').expect(400);
      // STP has no URL
      await save({ mode: 'ship', shipType: 'stp', username: 'u' }, 'p').expect(
        200
      );
    });
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
