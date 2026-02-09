import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import { properties as propertiesTable } from '../src/db/schema';
import { cleanupDatabase, createTestUser } from './helpers/db-helpers';

describe('Properties API', () => {
  let authToken: string;

  beforeEach(async () => {
    // Clean up first to ensure a clean slate (order matters for foreign keys)
    await cleanupDatabase();

    // Create test user
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

  afterEach(async () => {
    await cleanupDatabase();
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
});
