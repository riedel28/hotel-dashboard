import { createSecretKey } from 'crypto';

import { jwtVerify, SignJWT } from 'jose';

import env from '../../env';

/**
 * Distinguishes a full session token from the short-lived token handed out
 * between the two steps of a 2FA login. A challenge token must never be
 * accepted as proof of authentication.
 */
export type TokenPurpose = 'auth' | '2fa_challenge';

export interface JWTPayload {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  /** Compared against users.token_version to revoke sessions on password change. */
  token_version: number;
  purpose?: TokenPurpose;
  /** Issued-at, in seconds. Used by requireFreshAuth. */
  iat?: number;
  [key: string]: unknown;
}

export interface ChallengePayload {
  id: string;
  purpose: '2fa_challenge';
}

function getSecretKey() {
  const secret = env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable not set');
  }

  return createSecretKey(secret, 'utf-8');
}

async function generateToken(
  payload: Omit<JWTPayload, 'purpose' | 'iat'>,
  options?: { rememberMe?: boolean }
): Promise<string> {
  const shortExpiration = '24h';
  const longExpiration = env.JWT_EXPIRES_IN || '30d';

  const expiration = options?.rememberMe ? longExpiration : shortExpiration;

  return await new SignJWT({ ...payload, purpose: 'auth' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(getSecretKey());
}

async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecretKey());

  if (payload.purpose !== 'auth') {
    throw new Error('Token is not a session token');
  }

  return {
    id: payload.id as string,
    email: payload.email as string,
    first_name: payload.first_name as string,
    last_name: payload.last_name as string,
    is_admin: payload.is_admin as boolean,
    token_version: (payload.token_version as number) ?? 0,
    purpose: 'auth',
    iat: payload.iat
  };
}

/**
 * Issued once the password has been accepted but before the TOTP code has.
 * Carries no identity beyond the user id and is useless to `authenticateToken`.
 */
async function generateChallengeToken(userId: number): Promise<string> {
  return await new SignJWT({ id: String(userId), purpose: '2fa_challenge' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(getSecretKey());
}

async function verifyChallengeToken(token: string): Promise<ChallengePayload> {
  const { payload } = await jwtVerify(token, getSecretKey());

  if (payload.purpose !== '2fa_challenge') {
    throw new Error('Token is not a 2FA challenge token');
  }

  return { id: payload.id as string, purpose: '2fa_challenge' };
}

export {
  generateChallengeToken,
  generateToken,
  verifyChallengeToken,
  verifyToken
};
