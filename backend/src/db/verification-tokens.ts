import { and, eq, gt, isNull } from 'drizzle-orm';

import { generateVerificationToken } from '../utils/token';
import { db, type Transaction } from './pool';
import { emailVerificationTokens } from './schema';

// The whole life of an emailed link: issued, revoked, used once.

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

/** Stores a new link of this type and returns the token to put in the email. */
export async function createToken(
  executor: Executor,
  userId: number,
  type: TokenType
) {
  const token = generateVerificationToken();
  await executor.insert(emailVerificationTokens).values({
    user_id: userId,
    token,
    type,
    expires_at: new Date(Date.now() + TOKEN_TTL_MS[type])
  });
  return token;
}

/** A fresh link of this type, the ones sent before it spent so only it works. */
export async function issueToken(
  executor: Executor,
  userId: number,
  type: TokenType
) {
  await revokeTokens(executor, userId, type);
  return createToken(executor, userId, type);
}

/**
 * Uses up a link: marks it used and returns whose it is, or null when it is
 * unknown, expired or already used. One statement, so two requests racing with
 * the same link can't both get through. Call it in the transaction that acts
 * on the link, so a failure there leaves the link unused.
 */
export async function consumeToken(
  executor: Executor,
  token: string,
  type: TokenType
): Promise<number | null> {
  const [consumed] = await executor
    .update(emailVerificationTokens)
    .set({ used_at: new Date() })
    .where(
      and(
        eq(emailVerificationTokens.token, token),
        eq(emailVerificationTokens.type, type),
        isNull(emailVerificationTokens.used_at),
        gt(emailVerificationTokens.expires_at, new Date())
      )
    )
    .returning({ userId: emailVerificationTokens.user_id });
  return consumed?.userId ?? null;
}
