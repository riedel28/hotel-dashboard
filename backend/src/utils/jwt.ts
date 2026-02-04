import { createSecretKey } from 'crypto';
import { jwtVerify, SignJWT } from 'jose';

import env from '../../env';

export interface JWTPayload {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  [key: string]: unknown;
}

async function generateToken(
  payload: JWTPayload,
  options?: { rememberMe?: boolean }
): Promise<string> {
  const secret = env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable not set');
  }

  const secretKey = createSecretKey(secret, 'utf-8');

  const shortExpiration = '24h';
  const longExpiration = env.JWT_EXPIRES_IN || '30d';

  const expiration = options?.rememberMe ? longExpiration : shortExpiration;

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(secretKey);
}

async function verifyToken(token: string): Promise<JWTPayload> {
  const secretKey = createSecretKey(env.JWT_SECRET, 'utf-8');
  const { payload } = await jwtVerify(token, secretKey);

  return {
    id: payload.id as string,
    email: payload.email as string,
    first_name: payload.first_name as string,
    last_name: payload.last_name as string,
    is_admin: payload.is_admin as boolean
  };
}

export { generateToken, verifyToken };
