import { eq } from 'drizzle-orm';
import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import { propertyWorklogs, users } from '../src/db/schema';
import { createTestProperty, createTestUser } from './helpers/db-helpers';

describe('Property worklogs API', () => {
  let admin: Awaited<ReturnType<typeof createTestUser>>;
  let propertyId: string;

  const url = (suffix = '') =>
    `/api/properties/${propertyId}/worklogs${suffix}`;
  const as = (token: string) => ({ Authorization: `Bearer ${token}` });

  beforeEach(async () => {
    admin = await createTestUser({ is_admin: true, first_name: 'Ada' });
    propertyId = (await createTestProperty()).id;
  });

  test('rejects non-admins', async () => {
    const { token } = await createTestUser();
    await request(app).get(url()).set(as(token)).expect(403);
    await request(app)
      .post(url())
      .set(as(token))
      .send({ message: 'hi' })
      .expect(403);
  });

  test('creates an entry and lists newest first with its author', async () => {
    await request(app)
      .post(url())
      .set(as(admin.token))
      .send({ message: '  first  ' })
      .expect(201);
    await request(app)
      .post(url())
      .set(as(admin.token))
      .send({ message: 'second' })
      .expect(201);

    const { body } = await request(app)
      .get(url())
      .set(as(admin.token))
      .expect(200);

    expect(body.map((w: { message: string }) => w.message)).toEqual([
      'second',
      'first'
    ]);
    expect(body[0].created_by).toMatchObject({
      id: admin.user.id,
      first_name: 'Ada'
    });
    expect(body[0].updated_at).toBeNull();
    expect(body[0].updated_by).toBeNull();
  });

  test('validates the message', async () => {
    await request(app)
      .post(url())
      .set(as(admin.token))
      .send({ message: '   ' })
      .expect(400);
    await request(app)
      .post(url())
      .set(as(admin.token))
      .send({ message: 'x'.repeat(2001) })
      .expect(400);
  });

  test('an unknown property is a 404 for reading and writing alike', async () => {
    const unknown =
      '/api/properties/00000000-0000-4000-8000-000000000000/worklogs';
    await request(app).get(unknown).set(as(admin.token)).expect(404);
    await request(app)
      .post(unknown)
      .set(as(admin.token))
      .send({ message: 'hi' })
      .expect(404);
  });

  test('an edit by another admin records who and when', async () => {
    const created = await request(app)
      .post(url())
      .set(as(admin.token))
      .send({ message: 'before' })
      .expect(201);
    const other = await createTestUser({ is_admin: true, first_name: 'Bob' });

    const { body } = await request(app)
      .patch(url(`/${created.body.id}`))
      .set(as(other.token))
      .send({ message: 'after' })
      .expect(200);

    expect(body.message).toBe('after');
    expect(body.updated_at).not.toBeNull();
    expect(body.updated_by.first_name).toBe('Bob');
    expect(body.created_by.first_name).toBe('Ada');
  });

  test('saving the same text is not an edit', async () => {
    const created = await request(app)
      .post(url())
      .set(as(admin.token))
      .send({ message: 'same' })
      .expect(201);

    const { body } = await request(app)
      .patch(url(`/${created.body.id}`))
      .set(as(admin.token))
      .send({ message: ' same ' })
      .expect(200);

    expect(body.updated_at).toBeNull();
    expect(body.updated_by).toBeNull();
  });

  test('an entry cannot be reached through another property', async () => {
    const created = await request(app)
      .post(url())
      .set(as(admin.token))
      .send({ message: 'mine' })
      .expect(201);
    const otherProperty = await createTestProperty();
    const foreign = `/api/properties/${otherProperty.id}/worklogs/${created.body.id}`;

    await request(app)
      .patch(foreign)
      .set(as(admin.token))
      .send({ message: 'hijack' })
      .expect(404);
    await request(app).delete(foreign).set(as(admin.token)).expect(404);

    const rows = await db.select().from(propertyWorklogs);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.message).toBe('mine');
  });

  test('deletes an entry', async () => {
    const created = await request(app)
      .post(url())
      .set(as(admin.token))
      .send({ message: 'bye' })
      .expect(201);

    await request(app)
      .delete(url(`/${created.body.id}`))
      .set(as(admin.token))
      .expect(200);
    await request(app)
      .delete(url(`/${created.body.id}`))
      .set(as(admin.token))
      .expect(404);
  });

  test('an entry outlives its author', async () => {
    const author = await createTestUser({ is_admin: true });
    await request(app)
      .post(url())
      .set(as(author.token))
      .send({ message: 'orphan' })
      .expect(201);
    await db.delete(users).where(eq(users.id, author.user.id));

    const { body } = await request(app)
      .get(url())
      .set(as(admin.token))
      .expect(200);

    expect(body).toHaveLength(1);
    expect(body[0].created_by).toBeNull();
  });
});
