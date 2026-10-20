import { eq } from 'drizzle-orm';
import type { NextFunction, Response } from 'express';

import { DEMO_FORBIDDEN, isDemoEmail } from '../../../shared/demo';
import { db } from '../db/pool';
import { users } from '../db/schema';
import type { AuthenticatedRequest } from './auth';

// A 403 with this code is answered in place by the client, not taken for a
// lost session.
const refuse = (res: Response) =>
  res
    .status(403)
    .json({ error: 'Not available in the demo', code: DEMO_FORBIDDEN });

/**
 * Refuses the request outright to the demo account: what would lock the next
 * visitor out (password, 2FA) or send email to an address of the visitor's
 * choosing (invitations). Must be used after `authenticateToken`.
 */
export function forbidDemo(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (isDemoEmail(req.user?.email)) return refuse(res);
  next();
}

/**
 * For PATCH and DELETE /users/:id. The demo account is an admin, so it may
 * edit and delete other users, but not itself — demoting, renaming the email
 * of or deleting the account everyone signs in with — and not change anyone's
 * email, which mails a link to the new address. Must be used after
 * `authenticateToken` and `validateParams`.
 */
export async function guardDemoUserEdit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!isDemoEmail(req.user?.email)) return next();

  const targetId = Number(req.params.id);
  if (targetId === Number(req.user?.id)) return refuse(res);

  const email: unknown = req.body?.email;
  if (typeof email === 'string') {
    const [target] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, targetId));
    if (target && target.email.toLowerCase() !== email.toLowerCase()) {
      return refuse(res);
    }
  }

  next();
}
