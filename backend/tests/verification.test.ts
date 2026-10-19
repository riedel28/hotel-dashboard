import { eq } from 'drizzle-orm';
import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import { emailVerificationTokens, users } from '../src/db/schema';
import { createTestUser } from './helpers/db-helpers';

const NEW_PASSWORD = 'Another-Password-42!';

async function insertToken(
  userId: number,
  type: 'verification' | 'invitation' | 'reset',
  expiresInMs = 60 * 60 * 1000
) {
  const token = `${type}-${Date.now()}-${Math.random()}`;
  await db.insert(emailVerificationTokens).values({
    user_id: userId,
    token,
    type,
    expires_at: new Date(Date.now() + expiresInMs)
  });
  return token;
}

describe('Emailed links', () => {
  test('a reset link works once, even for two requests at the same time', async () => {
    const { user } = await createTestUser();
    const token = await insertToken(user.id, 'reset');

    const statuses = (
      await Promise.all(
        [0, 1].map(() =>
          request(app)
            .post('/api/auth/reset-password')
            .send({ token, password: NEW_PASSWORD })
        )
      )
    )
      .map((response) => response.status)
      .sort();

    expect(statuses).toEqual([200, 400]);
  });

  test('an expired reset link is refused', async () => {
    const { user } = await createTestUser();
    const token = await insertToken(user.id, 'reset', -1000);

    await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: NEW_PASSWORD })
      .expect(400);
  });

  test('an invitation is accepted once, even for two requests at the same time', async () => {
    const [invited] = await db
      .insert(users)
      .values({
        email: `invited-${Date.now()}@example.com`,
        email_verified: false
      })
      .returning({ id: users.id });
    const token = await insertToken(invited.id, 'invitation');

    const statuses = (
      await Promise.all(
        [0, 1].map(() =>
          request(app)
            .post('/api/auth/accept-invitation')
            .send({ token, password: NEW_PASSWORD })
        )
      )
    )
      .map((response) => response.status)
      .sort();

    expect(statuses).toEqual([200, 400]);
  });

  test('verifying marks the address verified and stays fine when repeated', async () => {
    const { user } = await createTestUser();
    await db
      .update(users)
      .set({ email_verified: false })
      .where(eq(users.id, user.id));
    const token = await insertToken(user.id, 'verification');

    await request(app)
      .post('/api/auth/verify-email')
      .send({ token })
      .expect(200);
    // An already used link of a verified user answers as success.
    await request(app)
      .post('/api/auth/verify-email')
      .send({ token })
      .expect(200);

    const [row] = await db
      .select({ email_verified: users.email_verified })
      .from(users)
      .where(eq(users.id, user.id));
    expect(row.email_verified).toBe(true);
  });
});
