import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import {
  customers as customersTable,
  properties as propertiesTable
} from '../src/db/schema';
import { createTestUser } from './helpers/db-helpers';

const ullman = {
  first_name: 'Stuart',
  last_name: 'Ullman',
  company_name: 'Overlook Hospitality Inc.',
  email: 'stuart.ullman@example.com',
  address_line_1: '333 Wonderview Avenue',
  address_line_2: null,
  zip: '80517',
  city: 'Estes Park',
  country_code: 'US'
};

const fawlty = {
  first_name: 'Basil',
  last_name: 'Fawlty',
  company_name: null,
  email: 'basil@example.com',
  address_line_1: '16 Elwood Avenue',
  address_line_2: 'Flat 2',
  zip: 'TQ1 2DA',
  city: 'Torquay',
  country_code: 'GB'
};

describe('Customers API', () => {
  let adminToken: string;

  beforeEach(async () => {
    ({ token: adminToken } = await createTestUser({ is_admin: true }));
  });

  const asAdmin = (req: request.Test) =>
    req.set('Authorization', `Bearer ${adminToken}`);

  describe('access', () => {
    test('rejects an unauthenticated request', async () => {
      await request(app).get('/api/customers').expect(401);
    });

    test('rejects a non-admin on every endpoint', async () => {
      const { token } = await createTestUser();
      const [customer] = await db
        .insert(customersTable)
        .values(ullman)
        .returning();
      const auth = { Authorization: `Bearer ${token}` };

      await request(app).get('/api/customers').set(auth).expect(403);
      await request(app)
        .get(`/api/customers/${customer.id}`)
        .set(auth)
        .expect(403);
      await request(app)
        .post('/api/customers')
        .set(auth)
        .send(fawlty)
        .expect(403);
      await request(app)
        .patch(`/api/customers/${customer.id}`)
        .set(auth)
        .send({ city: 'Boulder' })
        .expect(403);
    });
  });

  describe('POST /api/customers', () => {
    test('creates a customer', async () => {
      const response = await asAdmin(
        request(app).post('/api/customers').send(ullman)
      ).expect(201);

      expect(response.body).toMatchObject({ ...ullman, property_count: 0 });
      expect(response.body.id).toEqual(expect.any(String));
    });

    test('stores empty optional fields as null', async () => {
      const response = await asAdmin(
        request(app)
          .post('/api/customers')
          .send({ ...ullman, company_name: '', address_line_2: '  ' })
      ).expect(201);

      expect(response.body.company_name).toBeNull();
      expect(response.body.address_line_2).toBeNull();
    });

    test('rejects a missing required field', async () => {
      const { address_line_1: _omitted, ...withoutAddress } = ullman;

      await asAdmin(
        request(app).post('/api/customers').send(withoutAddress)
      ).expect(400);
    });

    test('rejects an invalid email and an unknown country', async () => {
      await asAdmin(
        request(app)
          .post('/api/customers')
          .send({ ...ullman, email: 'not-an-email' })
      ).expect(400);
      await asAdmin(
        request(app)
          .post('/api/customers')
          .send({ ...ullman, country_code: 'ZZ' })
      ).expect(400);
    });

    test('rejects a duplicate email regardless of case', async () => {
      await asAdmin(request(app).post('/api/customers').send(ullman)).expect(
        201
      );

      await asAdmin(
        request(app)
          .post('/api/customers')
          .send({ ...fawlty, email: 'Stuart.Ullman@Example.com' })
      ).expect(409);
    });
  });

  describe('GET /api/customers', () => {
    beforeEach(async () => {
      const [owner] = await db
        .insert(customersTable)
        .values([ullman, fawlty])
        .returning();
      await db.insert(propertiesTable).values([
        {
          name: 'The Overlook Hotel',
          stage: 'production',
          customer_id: owner.id
        },
        { name: 'The Dolphin Hotel', stage: 'template', customer_id: owner.id },
        { name: 'Nobody’s Inn', stage: 'demo' }
      ]);
    });

    test('lists customers with their property count', async () => {
      const response = await asAdmin(
        request(app).get('/api/customers?sort_by=name')
      ).expect(200);

      expect(response.body).toMatchObject({
        page: 1,
        per_page: 10,
        total: 2,
        page_count: 1
      });
      expect(
        response.body.index.map(
          (c: { last_name: string; property_count: number }) => [
            c.last_name,
            c.property_count
          ]
        )
      ).toEqual([
        ['Fawlty', 0],
        ['Ullman', 2]
      ]);
    });

    test('sorts by property count', async () => {
      const response = await asAdmin(
        request(app).get(
          '/api/customers?sort_by=property_count&sort_order=desc'
        )
      ).expect(200);

      expect(response.body.index[0].last_name).toBe('Ullman');
    });

    test.each([
      ['first name', 'basil', 'Fawlty'],
      ['last name', 'ullm', 'Ullman'],
      ['company', 'hospitality', 'Ullman'],
      ['email', 'basil@', 'Fawlty'],
      ['city', 'torquay', 'Fawlty']
    ])('searches by %s', async (_field, q, lastName) => {
      const response = await asAdmin(
        request(app).get(`/api/customers?q=${encodeURIComponent(q)}`)
      ).expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.index[0].last_name).toBe(lastName);
    });

    test('paginates', async () => {
      const response = await asAdmin(
        request(app).get('/api/customers?per_page=5&page=2')
      ).expect(200);

      expect(response.body.index).toEqual([]);
      expect(response.body.total).toBe(2);
    });

    test('rejects an unknown sort column', async () => {
      await asAdmin(request(app).get('/api/customers?sort_by=zip')).expect(400);
    });
  });

  describe('GET /api/customers/:id', () => {
    test('returns the customer with the properties it owns', async () => {
      const [owner] = await db
        .insert(customersTable)
        .values(ullman)
        .returning();
      await db.insert(propertiesTable).values([
        {
          name: 'The Overlook Hotel',
          stage: 'production',
          customer_id: owner.id
        },
        { name: 'Someone else’s', stage: 'demo' }
      ]);

      const response = await asAdmin(
        request(app).get(`/api/customers/${owner.id}`)
      ).expect(200);

      expect(response.body).toMatchObject({ ...ullman, property_count: 1 });
      expect(response.body.properties).toEqual([
        {
          id: expect.any(String),
          name: 'The Overlook Hotel',
          country_code: 'DE',
          stage: 'production'
        }
      ]);
    });

    test('returns 404 for an unknown customer', async () => {
      await asAdmin(
        request(app).get('/api/customers/cc198b13-4933-43aa-977e-dcd95fa30770')
      ).expect(404);
    });
  });

  describe('PATCH /api/customers/:id', () => {
    test('updates only the fields sent', async () => {
      const [customer] = await db
        .insert(customersTable)
        .values(ullman)
        .returning();

      const response = await asAdmin(
        request(app)
          .patch(`/api/customers/${customer.id}`)
          .send({ city: 'Boulder', company_name: '' })
      ).expect(200);

      expect(response.body).toMatchObject({
        ...ullman,
        city: 'Boulder',
        company_name: null
      });
    });

    test('rejects an email another customer already has', async () => {
      const [, second] = await db
        .insert(customersTable)
        .values([ullman, fawlty])
        .returning();

      await asAdmin(
        request(app)
          .patch(`/api/customers/${second.id}`)
          .send({ email: ullman.email.toUpperCase() })
      ).expect(409);
    });

    test('returns 404 for an unknown customer', async () => {
      await asAdmin(
        request(app)
          .patch('/api/customers/cc198b13-4933-43aa-977e-dcd95fa30770')
          .send({ city: 'Boulder' })
      ).expect(404);
    });
  });

  test('a customer that owns a property cannot be deleted', async () => {
    const [owner] = await db.insert(customersTable).values(ullman).returning();
    await db.insert(propertiesTable).values({
      name: 'The Overlook Hotel',
      stage: 'production',
      customer_id: owner.id
    });

    await expect(db.delete(customersTable)).rejects.toThrow();
  });
});
