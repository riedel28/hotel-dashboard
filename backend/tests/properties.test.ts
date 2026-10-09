import { eq } from 'drizzle-orm';
import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import {
  customers as customersTable,
  properties as propertiesTable
} from '../src/db/schema';
import { createTestUser } from './helpers/db-helpers';

describe('Properties API', () => {
  let authToken: string;

  beforeEach(async () => {
    const { token } = await createTestUser({
      password: 'Password123!'
    });
    authToken = token;

    // Create test properties (UUIDs will be auto-generated)
    await db.insert(propertiesTable).values([
      { name: 'Development (2)', stage: 'demo' },
      { name: 'Staging', stage: 'staging' },
      { name: 'Development 13, Adyen', stage: 'template' },
      { name: 'Kullturboden-Hallstadt', stage: 'production' },
      { name: 'Grand Hotel Vienna', stage: 'production' },
      { name: 'Seaside Resort Barcelona', stage: 'staging' },
      { name: 'Mountain Lodge Switzerland', stage: 'demo' },
      { name: 'Urban Boutique Hotel Berlin', stage: 'template' },
      { name: 'Historic Palace Hotel Prague', stage: 'production' },
      { name: 'Lorem ipsum dolor sit amet', stage: 'production' }
    ]);
  });

  describe('GET /api/properties', () => {
    test('should get all properties successfully with default pagination', async () => {
      const response = await request(app)
        .get('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('index');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('per_page');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page_count');
      expect(response.body.page).toBe(1);
      expect(response.body.per_page).toBe(10);
      expect(response.body.total).toBe(10);
      expect(response.body.page_count).toBe(1);
      expect(Array.isArray(response.body.index)).toBe(true);
      expect(response.body.index.length).toBe(10);

      // Verify property structure
      const property = response.body.index[0];
      expect(property).toHaveProperty('id');
      expect(property).toHaveProperty('name');
      expect(property).toHaveProperty('stage');
      expect(['demo', 'production', 'staging', 'template']).toContain(
        property.stage
      );
    });

    test('should return paginated results', async () => {
      const response = await request(app)
        .get('/api/properties?page=1&per_page=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.per_page).toBe(5);
      expect(response.body.total).toBe(10);
      expect(response.body.page_count).toBe(2);
      expect(response.body.index.length).toBe(5);
    });

    test('should return second page correctly', async () => {
      const response = await request(app)
        .get('/api/properties?page=2&per_page=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(2);
      expect(response.body.per_page).toBe(5);
      expect(response.body.total).toBe(10);
      expect(response.body.page_count).toBe(2);
      expect(response.body.index.length).toBe(5);
    });

    test('should return empty array for page beyond available data', async () => {
      const response = await request(app)
        .get('/api/properties?page=10&per_page=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(10);
      expect(response.body.per_page).toBe(5);
      expect(response.body.total).toBe(10);
      expect(response.body.page_count).toBe(2);
      expect(response.body.index.length).toBe(0);
    });

    test('should filter properties by search query', async () => {
      const response = await request(app)
        .get('/api/properties?q=Vienna')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBeGreaterThan(0);
      expect(
        response.body.index.some((prop: { name: string }) =>
          prop.name.includes('Vienna')
        )
      ).toBe(true);
    });

    test('should return empty results for non-matching search query', async () => {
      const response = await request(app)
        .get('/api/properties?q=NonexistentProperty123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBe(0);
      expect(response.body.index.length).toBe(0);
    });

    test('should combine pagination and search', async () => {
      const response = await request(app)
        .get('/api/properties?q=Hotel&page=1&per_page=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index.length).toBeLessThanOrEqual(5);
      expect(
        response.body.index.every((prop: { name: string }) =>
          prop.name.toLowerCase().includes('hotel')
        )
      ).toBe(true);
    });

    test('should return 401 without authentication', async () => {
      await request(app).get('/api/properties').expect(401);
    });

    test('should return 400 for invalid per_page value', async () => {
      await request(app)
        .get('/api/properties?per_page=3')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    test('should return 400 for invalid page value', async () => {
      await request(app)
        .get('/api/properties?page=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    test('should accept valid per_page values', async () => {
      const validPerPageValues = [5, 10, 25, 50, 100];

      for (const perPage of validPerPageValues) {
        const response = await request(app)
          .get(`/api/properties?per_page=${perPage}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.per_page).toBe(perPage);
      }
    });
  });

  describe('PATCH /api/properties/:id disabled_nav_items', () => {
    async function createAdminAndPickProperty() {
      const { token } = await createTestUser({ is_admin: true });
      const [property] = await db.select().from(propertiesTable).limit(1);
      return { token, property };
    }

    test('defaults to no disabled nav items', async () => {
      const { property } = await createAdminAndPickProperty();

      const response = await request(app)
        .get(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.disabled_nav_items).toEqual([]);
    });

    test('saves disabled nav items without touching other fields', async () => {
      const { token, property } = await createAdminAndPickProperty();

      const response = await request(app)
        .patch(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ disabled_nav_items: ['rooms', 'door-locks'] })
        .expect(200);

      expect(response.body.disabled_nav_items).toEqual(['rooms', 'door-locks']);
      expect(response.body.name).toBe(property.name);

      const reread = await request(app)
        .get(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(reread.body.disabled_nav_items).toEqual(['rooms', 'door-locks']);
    });

    test('stores each nav item id once', async () => {
      const { token, property } = await createAdminAndPickProperty();

      const response = await request(app)
        .patch(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ disabled_nav_items: ['rooms', 'rooms', 'users'] })
        .expect(200);

      expect(response.body.disabled_nav_items).toEqual(['rooms', 'users']);
    });

    test('rejects an unknown nav item id', async () => {
      const { token, property } = await createAdminAndPickProperty();

      await request(app)
        .patch(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ disabled_nav_items: ['rooms', 'not-a-nav-item'] })
        .expect(400);
    });

    test('rejects a non-admin', async () => {
      const { property } = await createAdminAndPickProperty();

      await request(app)
        .patch(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ disabled_nav_items: ['rooms'] })
        .expect(403);
    });
  });

  describe('customer of a property', () => {
    async function setup() {
      const { token } = await createTestUser({ is_admin: true });
      const [customer] = await db
        .insert(customersTable)
        .values({
          first_name: 'Winston',
          last_name: 'Scott',
          company_name: 'Continental Hotels Ltd.',
          email: 'winston@example.com',
          address_line_1: '1 Wall Street Court',
          zip: '10005',
          city: 'New York',
          country_code: 'US'
        })
        .returning();
      const [property] = await db.select().from(propertiesTable).limit(1);
      return { token, customer, property };
    }

    test('assigns and unassigns a customer', async () => {
      const { token, customer, property } = await setup();

      const assigned = await request(app)
        .patch(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ customer_id: customer.id })
        .expect(200);

      expect(assigned.body.customer_id).toBe(customer.id);
      expect(assigned.body.customer).toEqual({
        id: customer.id,
        first_name: 'Winston',
        last_name: 'Scott',
        company_name: 'Continental Hotels Ltd.'
      });

      const unassigned = await request(app)
        .patch(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ customer_id: null })
        .expect(200);

      expect(unassigned.body.customer_id).toBeNull();
      expect(unassigned.body.customer).toBeNull();
    });

    test('leaves the customer alone when another field is updated', async () => {
      const { token, customer, property } = await setup();
      await db.update(propertiesTable).set({ customer_id: customer.id });

      const response = await request(app)
        .patch(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Renamed' })
        .expect(200);

      expect(response.body.customer_id).toBe(customer.id);
    });

    test('creates a property with a customer', async () => {
      const { token, customer } = await setup();

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'The Continental',
          country_code: 'US',
          stage: 'production',
          customer_id: customer.id
        })
        .expect(201);

      expect(response.body.customer_id).toBe(customer.id);
    });

    test('rejects a customer that does not exist', async () => {
      const { token, property } = await setup();

      await request(app)
        .patch(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ customer_id: 'cc198b13-4933-43aa-977e-dcd95fa30770' })
        .expect(400);
    });

    test('lists the customer for an admin and sorts by it', async () => {
      const { token, customer, property } = await setup();
      await db
        .update(propertiesTable)
        .set({ customer_id: customer.id })
        .where(eq(propertiesTable.id, property.id));

      const response = await request(app)
        .get('/api/properties?sort_by=customer')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.index[0].id).toBe(property.id);
      expect(response.body.index[0].customer.company_name).toBe(
        'Continental Hotels Ltd.'
      );
      expect(response.body.index[1].customer).toBeNull();
    });

    test('hides the customer from a non-admin', async () => {
      const { customer, property } = await setup();
      await db.update(propertiesTable).set({ customer_id: customer.id });

      const one = await request(app)
        .get(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(one.body.customer_id).toBeNull();
      expect(one.body.customer).toBeNull();

      const list = await request(app)
        .get('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(
        list.body.index.every(
          (p: { customer: unknown; customer_id: unknown }) =>
            p.customer === null && p.customer_id === null
        )
      ).toBe(true);
    });
  });
});
