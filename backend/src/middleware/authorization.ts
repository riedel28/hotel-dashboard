import type { NextFunction, Response } from 'express';

import type { AuthenticatedRequest } from './auth';

/**
 * Requires the authenticated user to be an admin.
 * Must be used after `authenticateToken`.
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.is_admin !== true) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

/**
 * Requires the authenticated user to be either the resource owner (matching param ID)
 * or an admin. Must be used after `authenticateToken`.
 *
 * @param paramName - The route parameter name to compare against req.user.id (default: 'id')
 */
export function requireSelfOrAdmin(paramName = 'id') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceId = req.params[paramName];
    const userId = String(req.user.id);

    if (userId !== resourceId && req.user.is_admin !== true) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
}

/**
 * Strips admin-only fields (`is_admin`, `role_ids`) from the request body
 * if the authenticated user is not an admin. This prevents privilege escalation
 * via self-promotion.
 *
 * Must be used after `authenticateToken`.
 */
export function stripAdminFields(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.is_admin !== true && req.body) {
    delete req.body.is_admin;
    delete req.body.role_ids;
  }

  next();
}
