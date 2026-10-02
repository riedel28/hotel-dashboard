import { eq } from 'drizzle-orm';
import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import { users } from '../src/db/schema';
import { createTestProperty, createTestUser } from './helpers/db-helpers';

describe('Products API', () => {
  let auth: string;
  let otherAuth: string;
  let noPropertyAuth: string;

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
  });

  async function createCategory(title: string, parent_id?: number) {
    const res = await request(app)
      .post('/api/product-categories')
      .set('Authorization', auth)
      .send({ title, parent_id });
    expect(res.status).toBe(201);
    return res.body.id as number;
  }

  async function createProduct(category_id: number, title = 'Cola') {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', auth)
      .send({
        title,
        category_id,
        price: 4,
        quantity: 12,
        description: 'Cold'
      });
    expect(res.status).toBe(201);
    return res.body.id as number;
  }

  describe('access', () => {
    it('requires authentication', async () => {
      await request(app).get('/api/products').expect(401);
      await request(app).get('/api/product-categories').expect(401);
    });

    it('returns empty lists and rejects writes without a selected property', async () => {
      for (const path of ['/api/products', '/api/product-categories']) {
        const res = await request(app)
          .get(path)
          .set('Authorization', noPropertyAuth)
          .expect(200);
        expect(res.body).toEqual([]);
      }
      await request(app)
        .post('/api/product-categories')
        .set('Authorization', noPropertyAuth)
        .send({ title: 'Mini-bar' })
        .expect(400);
    });

    it("hides another property's products from read, update and delete", async () => {
      const productId = await createProduct(await createCategory('Drinks'));

      await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', otherAuth)
        .expect(404);
      await request(app)
        .patch(`/api/products/${productId}`)
        .set('Authorization', otherAuth)
        .send({ price: 1 })
        .expect(404);
      await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', otherAuth)
        .expect(404);

      // Still intact for the owner.
      await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', auth)
        .expect(200);
    });
  });

  describe('categories', () => {
    it('gets, renames and re-parents a category', async () => {
      const drinks = await createCategory('Drinks');
      const snacks = await createCategory('Snacks');
      const water = await createCategory('Water', drinks);

      const fetched = await request(app)
        .get(`/api/product-categories/${water}`)
        .set('Authorization', auth)
        .expect(200);
      expect(fetched.body).toEqual({
        id: water,
        title: 'Water',
        parent_id: drinks
      });

      const moved = await request(app)
        .patch(`/api/product-categories/${water}`)
        .set('Authorization', auth)
        .send({ title: 'Sparkling water', parent_id: snacks })
        .expect(200);
      expect(moved.body).toEqual({
        id: water,
        title: 'Sparkling water',
        parent_id: snacks
      });

      const toRoot = await request(app)
        .patch(`/api/product-categories/${water}`)
        .set('Authorization', auth)
        .send({ parent_id: null })
        .expect(200);
      expect(toRoot.body.parent_id).toBeNull();
    });

    it('rejects a parent from another property', async () => {
      const foreign = await request(app)
        .post('/api/product-categories')
        .set('Authorization', otherAuth)
        .send({ title: 'Foreign' })
        .expect(201);

      await request(app)
        .post('/api/product-categories')
        .set('Authorization', auth)
        .send({ title: 'Child', parent_id: foreign.body.id })
        .expect(400);
    });

    it('refuses to delete a category that still has products', async () => {
      const drinks = await createCategory('Drinks');
      await createProduct(drinks);

      await request(app)
        .delete(`/api/product-categories/${drinks}`)
        .set('Authorization', auth)
        .expect(409);
    });

    it('deletes an empty category', async () => {
      const drinks = await createCategory('Drinks');

      await request(app)
        .delete(`/api/product-categories/${drinks}`)
        .set('Authorization', auth)
        .expect(200);
      await request(app)
        .get(`/api/product-categories/${drinks}`)
        .set('Authorization', auth)
        .expect(404);
    });
  });

  describe('products', () => {
    it('updates only the fields sent', async () => {
      const drinks = await createCategory('Drinks');
      const snacks = await createCategory('Snacks');
      const productId = await createProduct(drinks);

      const res = await request(app)
        .patch(`/api/products/${productId}`)
        .set('Authorization', auth)
        .send({ price: 2.5, description: null, category_id: snacks })
        .expect(200);
      expect(res.body).toEqual({
        id: productId,
        category_id: snacks,
        title: 'Cola',
        price: 2.5,
        quantity: 12,
        description: null
      });
    });

    it("rejects moving a product into another property's category", async () => {
      const productId = await createProduct(await createCategory('Drinks'));
      const foreign = await request(app)
        .post('/api/product-categories')
        .set('Authorization', otherAuth)
        .send({ title: 'Foreign' })
        .expect(201);

      await request(app)
        .patch(`/api/products/${productId}`)
        .set('Authorization', auth)
        .send({ category_id: foreign.body.id })
        .expect(400);
    });

    it('deletes a product', async () => {
      const productId = await createProduct(await createCategory('Drinks'));

      await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', auth)
        .expect(200);
      await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', auth)
        .expect(404);
    });

    it('rejects an invalid category filter', async () => {
      await request(app)
        .get('/api/products?category_id=abc')
        .set('Authorization', auth)
        .expect(400);
    });
  });

  it('creates products and filters by category only', async () => {
    const drinks = await createCategory('Drinks');
    const water = await createCategory('Water', drinks);

    await request(app)
      .post('/api/products')
      .set('Authorization', auth)
      .send({ title: 'Cola', category_id: drinks, price: 4, quantity: 12 })
      .expect(201);
    const created = await request(app)
      .post('/api/products')
      .set('Authorization', auth)
      .send({
        title: 'Still',
        category_id: water,
        price: 0,
        quantity: 0,
        description: ' '
      })
      .expect(201);
    expect(created.body).toMatchObject({
      price: 0,
      quantity: 0,
      description: null
    });

    const res = await request(app)
      .get(`/api/products?category_id=${drinks}`)
      .set('Authorization', auth)
      .expect(200);
    expect(res.body.map((p: { title: string }) => p.title)).toEqual(['Cola']);
  });

  it('rejects invalid prices and quantities', async () => {
    const id = await createCategory('Spa');
    const invalid = [
      { price: -1, quantity: 1 },
      { price: 1.234, quantity: 1 },
      { price: 1, quantity: -1 },
      { price: 1, quantity: 1.5 },
      { price: 1 }
    ];
    for (const fields of invalid) {
      await request(app)
        .post('/api/products')
        .set('Authorization', auth)
        .send({ title: 'Massage', category_id: id, ...fields })
        .expect(400);
    }
  });

  it('rejects moving a category into its own subtree', async () => {
    const root = await createCategory('Root');
    const child = await createCategory('Child', root);
    const grandchild = await createCategory('Grandchild', child);

    for (const parent_id of [root, grandchild]) {
      await request(app)
        .patch(`/api/product-categories/${root}`)
        .set('Authorization', auth)
        .send({ parent_id })
        .expect(400);
    }
  });

  it('refuses to delete a non-empty category', async () => {
    const root = await createCategory('Root');
    await createCategory('Child', root);

    await request(app)
      .delete(`/api/product-categories/${root}`)
      .set('Authorization', auth)
      .expect(409);
  });

  it('scopes data to the selected property', async () => {
    const id = await createCategory('Mini-bar');

    const list = await request(app)
      .get('/api/product-categories')
      .set('Authorization', otherAuth)
      .expect(200);
    expect(list.body).toEqual([]);

    await request(app)
      .post('/api/products')
      .set('Authorization', otherAuth)
      .send({ title: 'Nuts', category_id: id, price: 5, quantity: 1 })
      .expect(400);
    await request(app)
      .delete(`/api/product-categories/${id}`)
      .set('Authorization', otherAuth)
      .expect(404);
  });
});
