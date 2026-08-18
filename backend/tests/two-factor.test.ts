import { eq } from 'drizzle-orm';
import { generate } from 'otplib';
import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import { users } from '../src/db/schema';
import { decryptSecret } from '../src/utils/secret-box';
import { createTestUser } from './helpers/db-helpers';

const VALID_PASSWORD = 'Password123!';

/** Reads the secret the server parked on the row and produces a live code. */
async function currentCodeFor(userId: number): Promise<string> {
  const [record] = await db
    .select({ totp_secret: users.totp_secret })
    .from(users)
    .where(eq(users.id, userId));

  if (!record?.totp_secret) {
    throw new Error('No TOTP secret stored for user');
  }

  return generate({ secret: decryptSecret(record.totp_secret) });
}

/** Walks setup → enable and returns the recovery codes handed out. */
async function enrol(token: string, userId: number): Promise<string[]> {
  await request(app)
    .post('/api/two-factor/setup')
    .set('Authorization', `Bearer ${token}`)
    .send({})
    .expect(200);

  const response = await request(app)
    .post('/api/two-factor/enable')
    .set('Authorization', `Bearer ${token}`)
    .send({ code: await currentCodeFor(userId) })
    .expect(200);

  return response.body.recovery_codes;
}

describe('Two-factor authentication', () => {
  let authToken: string;
  let userId: number;
  let userEmail: string;

  beforeEach(async () => {
    const { token, user } = await createTestUser({ password: VALID_PASSWORD });
    authToken = token;
    userId = user.id;
    userEmail = user.email;
  });

  describe('status', () => {
    test('reports disabled for a fresh account', async () => {
      const response = await request(app)
        .get('/api/two-factor')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.enabled).toBe(false);
      expect(response.body.recovery_codes_remaining).toBe(0);
      expect(response.body.recovery_codes_generated).toBe(false);
    });
  });

  describe('setup', () => {
    test('returns a QR code and a manually enterable secret', async () => {
      const response = await request(app)
        .post('/api/two-factor/setup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      expect(response.body.qr_data_uri).toMatch(/^data:image\/png;base64,/);
      expect(response.body.otpauth_uri).toContain('otpauth://totp/');
      expect(response.body.secret).toMatch(/^[A-Z2-7 ]+$/);
    });

    test('stores the secret encrypted, not in the clear', async () => {
      const response = await request(app)
        .post('/api/two-factor/setup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      const [record] = await db
        .select({ totp_secret: users.totp_secret })
        .from(users)
        .where(eq(users.id, userId));

      const plainSecret = response.body.secret.replace(/ /g, '');
      expect(record?.totp_secret).toBeTruthy();
      expect(record?.totp_secret).not.toContain(plainSecret);
      expect(record?.totp_secret).toMatch(/^v1:/);
      expect(decryptSecret(record!.totp_secret!)).toBe(plainSecret);
    });

    test('leaves 2FA off until a code is verified', async () => {
      await request(app)
        .post('/api/two-factor/setup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      const status = await request(app)
        .get('/api/two-factor')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(status.body.enabled).toBe(false);

      // An abandoned setup must not start demanding a code at sign-in.
      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: userEmail, password: VALID_PASSWORD })
        .expect(200);

      expect(login.body.requires_2fa).toBeUndefined();
    });
  });

  describe('enable', () => {
    test('rejects a wrong code and stays disabled', async () => {
      await request(app)
        .post('/api/two-factor/setup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      const response = await request(app)
        .post('/api/two-factor/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: '000000' })
        .expect(401);

      expect(response.body.code).toBe('INVALID_2FA_CODE');

      const status = await request(app)
        .get('/api/two-factor')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(status.body.enabled).toBe(false);
    });

    test('issues ten recovery codes on success', async () => {
      const codes = await enrol(authToken, userId);

      expect(codes).toHaveLength(10);
      codes.forEach((code) =>
        expect(code).toMatch(/^[a-z0-9]{4}-[a-z0-9]{4}$/)
      );

      const status = await request(app)
        .get('/api/two-factor')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(status.body.enabled).toBe(true);
      expect(status.body.recovery_codes_remaining).toBe(10);
      expect(status.body.enabled_at).toBeTruthy();
    });

    test('refuses when setup was never started', async () => {
      const response = await request(app)
        .post('/api/two-factor/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: '123456' })
        .expect(409);

      expect(response.body.code).toBe('NO_PENDING_SETUP');
    });
  });

  describe('two-step login', () => {
    test('withholds the session until a code is supplied', async () => {
      await enrol(authToken, userId);

      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: userEmail, password: VALID_PASSWORD })
        .expect(200);

      expect(login.body.requires_2fa).toBe(true);
      expect(login.body.challenge_token).toBeTruthy();
      expect(login.body.user).toBeUndefined();
      expect(login.headers['set-cookie']).toBeUndefined();
    });

    test('completes with a valid TOTP code', async () => {
      await enrol(authToken, userId);

      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: userEmail, password: VALID_PASSWORD })
        .expect(200);

      const response = await request(app)
        .post('/api/auth/login/2fa')
        .send({
          challenge_token: login.body.challenge_token,
          code: await currentCodeFor(userId)
        })
        .expect(200);

      expect(response.body.user.id).toBe(userId);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('rejects a wrong code', async () => {
      await enrol(authToken, userId);

      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: userEmail, password: VALID_PASSWORD })
        .expect(200);

      const response = await request(app)
        .post('/api/auth/login/2fa')
        .send({ challenge_token: login.body.challenge_token, code: '000000' })
        .expect(401);

      expect(response.body.code).toBe('INVALID_2FA_CODE');
    });

    test('will not accept a session token as a challenge token', async () => {
      await enrol(authToken, userId);

      const response = await request(app)
        .post('/api/auth/login/2fa')
        .send({
          challenge_token: authToken,
          code: await currentCodeFor(userId)
        })
        .expect(401);

      expect(response.body.code).toBe('CHALLENGE_EXPIRED');
    });

    test('accepts a recovery code and spends it', async () => {
      const codes = await enrol(authToken, userId);
      const recoveryCode = codes[0]!;

      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: userEmail, password: VALID_PASSWORD })
        .expect(200);

      await request(app)
        .post('/api/auth/login/2fa')
        .send({
          challenge_token: login.body.challenge_token,
          code: recoveryCode
        })
        .expect(200);

      const status = await request(app)
        .get('/api/two-factor')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(status.body.recovery_codes_remaining).toBe(9);

      // The same code a second time must fail.
      const second = await request(app)
        .post('/api/auth/login')
        .send({ email: userEmail, password: VALID_PASSWORD })
        .expect(200);

      await request(app)
        .post('/api/auth/login/2fa')
        .send({
          challenge_token: second.body.challenge_token,
          code: recoveryCode
        })
        .expect(401);
    });
  });

  describe('password change with 2FA on', () => {
    test('demands a code', async () => {
      await enrol(authToken, userId);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          current_password: VALID_PASSWORD,
          new_password: 'BrandNewPass9!'
        })
        .expect(400);

      expect(response.body.code).toBe('TOTP_REQUIRED');
    });

    test('succeeds with a valid code', async () => {
      await enrol(authToken, userId);

      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          current_password: VALID_PASSWORD,
          new_password: 'BrandNewPass9!',
          totp_code: await currentCodeFor(userId)
        })
        .expect(200);
    });
  });

  describe('disable', () => {
    test('clears the secret, the codes and every other session', async () => {
      await enrol(authToken, userId);

      await request(app)
        .post('/api/two-factor/disable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: await currentCodeFor(userId) })
        .expect(200);

      const [record] = await db
        .select({
          totp_secret: users.totp_secret,
          totp_enabled_at: users.totp_enabled_at,
          token_version: users.token_version
        })
        .from(users)
        .where(eq(users.id, userId));

      expect(record?.totp_secret).toBeNull();
      expect(record?.totp_enabled_at).toBeNull();
      expect(record?.token_version).toBe(1);

      // Sign-in is single-step again.
      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: userEmail, password: VALID_PASSWORD })
        .expect(200);

      expect(login.body.requires_2fa).toBeUndefined();
    });

    test('refuses a wrong code', async () => {
      await enrol(authToken, userId);

      await request(app)
        .post('/api/two-factor/disable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: '000000' })
        .expect(401);

      const status = await request(app)
        .get('/api/two-factor')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(status.body.enabled).toBe(true);
    });
  });

  describe('fresh-auth requirement', () => {
    /** A session older than the 15-minute freshness window. */
    async function staleTokenFor(id: number, isAdmin = false) {
      const { createSecretKey } = await import('node:crypto');
      const { SignJWT } = await import('jose');
      const issuedAt = Math.floor(Date.now() / 1000) - 60 * 60;

      return new SignJWT({
        id: String(id),
        email: userEmail,
        first_name: '',
        last_name: '',
        is_admin: isAdmin,
        token_version: 0,
        purpose: 'auth'
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(issuedAt)
        .setExpirationTime('24h')
        .sign(createSecretKey(process.env.JWT_SECRET!, 'utf-8'));
    }

    test('an old session must confirm the password first', async () => {
      const stale = await staleTokenFor(userId);

      const response = await request(app)
        .post('/api/two-factor/setup')
        .set('Authorization', `Bearer ${stale}`)
        .send({})
        .expect(401);

      expect(response.body.code).toBe('REAUTH_REQUIRED');
    });

    test('replaying the request with the password succeeds', async () => {
      const stale = await staleTokenFor(userId);

      await request(app)
        .post('/api/two-factor/setup')
        .set('Authorization', `Bearer ${stale}`)
        .send({ current_password: VALID_PASSWORD })
        .expect(200);
    });

    test('a wrong password is reported as such, not as a missing one', async () => {
      const stale = await staleTokenFor(userId);

      const response = await request(app)
        .post('/api/two-factor/setup')
        .set('Authorization', `Bearer ${stale}`)
        .send({ current_password: 'NotMyPassword1!' })
        .expect(401);

      expect(response.body.code).toBe('REAUTH_FAILED');
    });

    test('a recent session needs no password', async () => {
      await request(app)
        .post('/api/two-factor/setup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);
    });
  });

  describe('recovery code regeneration', () => {
    test('replaces the old batch outright', async () => {
      const original = await enrol(authToken, userId);

      const response = await request(app)
        .post('/api/two-factor/recovery-codes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      expect(response.body.recovery_codes).toHaveLength(10);
      expect(response.body.recovery_codes).not.toEqual(original);

      // An old code must no longer work.
      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: userEmail, password: VALID_PASSWORD })
        .expect(200);

      await request(app)
        .post('/api/auth/login/2fa')
        .send({
          challenge_token: login.body.challenge_token,
          code: original[0]
        })
        .expect(401);
    });

    test('refuses when 2FA is off', async () => {
      const response = await request(app)
        .post('/api/two-factor/recovery-codes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(409);

      expect(response.body.code).toBe('NOT_ENABLED');
    });
  });
});
