import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { NextFunction, Response } from 'express';

import { db } from '../db/pool';
import { users } from '../db/schema';
import type { AuthenticatedRequest } from './auth';

/** How long a password entry keeps counting as proof of presence. */
export const FRESH_AUTH_WINDOW_SECONDS = 15 * 60;

/**
 * Guards operations where a merely valid session isn't enough — enabling or
 * disabling 2FA, regenerating recovery codes. Passes if the session was minted
 * within the last 15 minutes, or if the request carries the current password.
 *
 * On failure it answers 401 `REAUTH_REQUIRED`, which the client turns into a
 * password prompt before replaying the identical request with `current_password`.
 *
 * Must be used after `authenticateToken`.
 */
export async function requireFreshAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const issuedAt = req.user.iat;
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (
    typeof issuedAt === 'number' &&
    nowSeconds - issuedAt < FRESH_AUTH_WINDOW_SECONDS
  ) {
    return next();
  }

  const currentPassword = req.body?.current_password;

  if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
    return res.status(401).json({
      error: 'Please confirm your password to continue',
      code: 'REAUTH_REQUIRED'
    });
  }

  try {
    const [record] = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.id, Number(req.user.id)));

    if (!record?.password) {
      return res.status(401).json({
        error: 'Please confirm your password to continue',
        code: 'REAUTH_REQUIRED'
      });
    }

    const matches = await bcrypt.compare(currentPassword, record.password);

    if (!matches) {
      return res.status(401).json({
        error: 'Incorrect password',
        code: 'REAUTH_FAILED'
      });
    }

    return next();
  } catch (error) {
    console.error('Fresh auth check failed:', error);
    return res.status(500).json({ error: 'Failed to verify password' });
  }
}
