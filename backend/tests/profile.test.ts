import request from 'supertest';

import app from '../src/app';
import { createTestUser } from './helpers/db-helpers';

const VALID_PASSWORD = 'Password123!';
const NEW_PASSWORD = 'BrandNewPass9!';

describe('Profile API', () => {
  let authToken: string;
  let userId: number;
  let userEmail: string;

  beforeEach(async () => {
    const { token, user } = await createTestUser({
      password: VALID_PASSWORD,
      country_code: 'DE'
    });
    authToken = token;
    userId = user.id;
    userEmail = user.email;
  });

  describe('GET /api/users/me', () => {
    test('returns the signed-in user with roles and 2FA state', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe(userEmail);
      expect(response.body).toHaveProperty('roles');
      expect(response.body.two_factor_enabled).toBe(false);
      expect(response.body.avatar_url).toBeNull();
    });

    test('never exposes the password or TOTP secret', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('totp_secret');
      expect(response.body).not.toHaveProperty('token_version');
    });

    test('requires authentication', async () => {
      await request(app).get('/api/users/me').expect(401);
    });
  });

  describe('GET /api/users', () => {
    test('omits the avatar from the list response', async () => {
      await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ avatar_url: `data:image/webp;base64,${'A'.repeat(64)}` })
        .expect(200);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const me = response.body.index.find(
        (u: { id: number }) => u.id === userId
      );
      expect(me).toBeDefined();
      expect(me).not.toHaveProperty('avatar_url');
    });
  });

  describe('PATCH /api/users/me', () => {
    test('updates name and country', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ first_name: 'Sarah', last_name: 'Wilson', country_code: 'AT' })
        .expect(200);

      expect(response.body.first_name).toBe('Sarah');
      expect(response.body.last_name).toBe('Wilson');
      expect(response.body.country_code).toBe('AT');
    });

    test('stores and returns an avatar data URI', async () => {
      const avatar = `data:image/webp;base64,${'A'.repeat(128)}`;

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ avatar_url: avatar })
        .expect(200);

      expect(response.body.avatar_url).toBe(avatar);
    });

    test('rejects an avatar that is not an image data URI', async () => {
      await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ avatar_url: 'https://example.com/cat.png' })
        .expect(400);
    });

    test('rejects an avatar over the size cap with a readable error', async () => {
      // Over the 80 KB Zod cap but under the 100 KB express.json limit, so the
      // request reaches validation instead of being cut off as a bare 413.
      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ avatar_url: `data:image/webp;base64,${'A'.repeat(90_000)}` })
        .expect(400);

      expect(JSON.stringify(response.body)).toContain('too large');
    });

    test('cannot change email, is_admin or roles', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          first_name: 'Sarah',
          email: 'hijack@example.com',
          is_admin: true,
          role_ids: [1]
        })
        .expect(400);

      // The schema is strict about unknown keys rather than silently dropping
      // them, so a privilege-escalation attempt is a visible failure.
      expect(response.body).toHaveProperty('error');

      const after = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(after.body.email).toBe(userEmail);
      expect(after.body.is_admin).toBe(false);
    });

    test('returns 409 when the row changed since the client read it', async () => {
      const stale = new Date(Date.now() - 60_000).toISOString();

      await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ first_name: 'Sarah', expected_updated_at: stale })
        .expect(409);
    });

    test('accepts a matching expected_updated_at', async () => {
      const current = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          first_name: 'Sarah',
          expected_updated_at: current.body.updated_at
        })
        .expect(200);
    });
  });

  describe('POST /api/auth/change-password', () => {
    test('changes the password and lets the user sign in with it', async () => {
      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          current_password: VALID_PASSWORD,
          new_password: NEW_PASSWORD
        })
        .expect(200);

      await request(app)
        .post('/api/auth/login')
        .send({ email: userEmail, password: NEW_PASSWORD })
        .expect(200);

      await request(app)
        .post('/api/auth/login')
        .send({ email: userEmail, password: VALID_PASSWORD })
        .expect(401);
    });

    test('rejects a wrong current password with a specific code', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          current_password: 'NotMyPassword1!',
          new_password: NEW_PASSWORD
        })
        .expect(401);

      expect(response.body.code).toBe('INVALID_CURRENT_PASSWORD');
    });

    test('refuses to set the same password again', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          current_password: VALID_PASSWORD,
          new_password: VALID_PASSWORD
        })
        .expect(400);

      expect(response.body.code).toBe('PASSWORD_UNCHANGED');
    });

    test('enforces the 12-character minimum', async () => {
      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ current_password: VALID_PASSWORD, new_password: 'Short1!a' })
        .expect(400);
    });

    test('revokes other sessions by bumping token_version', async () => {
      // A second token minted from the same pre-change state stands in for
      // another device.
      const otherDeviceToken = authToken;

      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          current_password: VALID_PASSWORD,
          new_password: NEW_PASSWORD
        })
        .expect(200);

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${otherDeviceToken}`)
        .expect(401);

      expect(response.body.code).toBe('SESSION_REVOKED');
    });
  });
});
