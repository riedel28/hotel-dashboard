import { eq } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';

import { db } from '../db/pool';
import { users } from '../db/schema';
import { type JWTPayload, verifyToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Primary: read from httpOnly cookie
    let token = req.cookies?.auth_token;

    // Fallback: Authorization header (for tests using createTestUser helper)
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const payload = await verifyToken(token);

    // A stateless JWT can't be withdrawn, so every request compares the version
    // it was minted with against the user's current one. Changing the password
    // or disabling 2FA bumps that counter, retiring every other session.
    const [current] = await db
      .select({ token_version: users.token_version })
      .from(users)
      .where(eq(users.id, Number(payload.id)));

    if (!current) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    if (current.token_version !== payload.token_version) {
      return res.status(401).json({
        error: 'Session has been revoked. Please sign in again.',
        code: 'SESSION_REVOKED'
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}
