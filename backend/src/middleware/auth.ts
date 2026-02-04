import type { NextFunction, Request, Response } from 'express';

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
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const payload = await verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}
