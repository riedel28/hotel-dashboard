import { eq } from 'drizzle-orm';
import type { NextFunction, Response } from 'express';

import { db } from '../db/pool';
import { users } from '../db/schema';
import type { AuthenticatedRequest } from './auth';

// AuthenticatedRequest augmented with the caller's resolved property scope.
export interface SelectedPropertyRequest extends AuthenticatedRequest {
  selectedPropertyId?: string | null;
}

// Resolve the caller's selected property (the JWT doesn't carry it) and attach
// it to the request. Runs after authenticateToken, so req.user is present.
// How a missing property is handled is left to each handler.
export async function attachSelectedProperty(
  req: SelectedPropertyRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(req.user.id)),
      columns: { selected_property_id: true }
    });
    req.selectedPropertyId = user?.selected_property_id ?? null;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to resolve selected property' });
  }
}
