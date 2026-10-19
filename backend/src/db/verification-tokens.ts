import { and, eq, isNull } from 'drizzle-orm';

import { generateVerificationToken } from '../utils/token';
import { db } from './pool';
import type { Transaction } from './room-queries';
import { emailVerificationTokens } from './schema';

const HOUR_MS = 60 * 60 * 1000;

/** How long each kind of emailed link stays valid. */
const TOKEN_TTL_MS = {
  verification: 24 * HOUR_MS,
  invitation: 7 * 24 * HOUR_MS,
  reset: HOUR_MS
} as const;

export type TokenType = keyof typeof TOKEN_TTL_MS;

type Executor = typeof db | Transaction;

/**
 * Spends every unused link the user was sent: of one type, or with no type of
 * every kind (when the address they went to stops being theirs).
 */
export async function revokeTokens(
  executor: Executor,
  userId: number,
  type?: TokenType
) {
  await executor
    .update(emailVerificationTokens)
    .set({ used_at: new Date() })
    .where(
      and(
        eq(emailVerificationTokens.user_id, userId),
        type ? eq(emailVerificationTokens.type, type) : undefined,
        isNull(emailVerificationTokens.used_at)
      )
    );
}

/**
 * Issues a fresh link of this type, spending the ones sent before it so only
 * the newest works. Returns the token to put in the email.
 */
export async function issueToken(
  executor: Executor,
  userId: number,
  type: TokenType
) {
  await revokeTokens(executor, userId, type);

  const token = generateVerificationToken();
  await executor.insert(emailVerificationTokens).values({
    user_id: userId,
    token,
    type,
    expires_at: new Date(Date.now() + TOKEN_TTL_MS[type])
  });
  return token;
}
