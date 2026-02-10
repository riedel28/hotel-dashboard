import { and, eq, gt, isNull } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../db/pool';
import { emailVerificationTokens, users } from '../db/schema';
import { sendInvitationEmail, sendVerificationEmail } from '../utils/email';
import { hashPassword } from '../utils/password';
import { generateVerificationToken } from '../utils/token';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

async function signUp(req: Request, res: Response) {
  const { email, password, first_name, last_name } = req.body;

  try {
    // Check duplicate email
    const existing = await db.query.users.findFirst({
      columns: { id: true },
      where: eq(users.email, email)
    });

    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        first_name,
        last_name,
        email_verified: false
      })
      .returning({ id: users.id, email: users.email });

    // Generate verification token (24h expiry)
    const token = generateVerificationToken();
    await db.insert(emailVerificationTokens).values({
      user_id: newUser.id,
      token,
      type: 'verification',
      expires_at: new Date(Date.now() + TWENTY_FOUR_HOURS_MS)
    });

    await sendVerificationEmail(email, token);

    res.status(201).json({
      message:
        'Account created successfully. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
}

async function verifyEmail(req: Request, res: Response) {
  const { token } = req.body;

  try {
    // Look up valid token (unused, not expired, type verification)
    const [tokenRecord] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          eq(emailVerificationTokens.type, 'verification'),
          isNull(emailVerificationTokens.used_at),
          gt(emailVerificationTokens.expires_at, new Date())
        )
      );

    if (!tokenRecord) {
      // Check if this token was already used and the user is verified (idempotent)
      const [usedToken] = await db
        .select({ user_id: emailVerificationTokens.user_id })
        .from(emailVerificationTokens)
        .where(
          and(
            eq(emailVerificationTokens.token, token),
            eq(emailVerificationTokens.type, 'verification')
          )
        );

      if (usedToken) {
        const verifiedUser = await db.query.users.findFirst({
          columns: { email_verified: true },
          where: and(
            eq(users.id, usedToken.user_id),
            eq(users.email_verified, true)
          )
        });

        if (verifiedUser) {
          return res
            .status(200)
            .json({
              message: 'Email verified successfully. You can now log in.'
            });
        }
      }

      return res
        .status(400)
        .json({ error: 'Invalid or expired verification link' });
    }

    // In transaction: mark user verified and token used
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ email_verified: true, updated_at: new Date() })
        .where(eq(users.id, tokenRecord.user_id));

      await tx
        .update(emailVerificationTokens)
        .set({ used_at: new Date() })
        .where(eq(emailVerificationTokens.id, tokenRecord.id));
    });

    res
      .status(200)
      .json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
}

async function resendVerification(req: Request, res: Response) {
  const { email } = req.body;

  try {
    // Generic 200 response to prevent email enumeration
    const genericResponse = {
      message:
        'If an account with that email exists, a verification email has been sent.'
    };

    const user = await db.query.users.findFirst({
      columns: { id: true, email_verified: true },
      where: eq(users.email, email)
    });

    if (!user || user.email_verified) {
      return res.status(200).json(genericResponse);
    }

    // Invalidate old tokens by marking them used
    await db
      .update(emailVerificationTokens)
      .set({ used_at: new Date() })
      .where(
        and(
          eq(emailVerificationTokens.user_id, user.id),
          eq(emailVerificationTokens.type, 'verification'),
          isNull(emailVerificationTokens.used_at)
        )
      );

    // Create new token (24h expiry)
    const token = generateVerificationToken();
    await db.insert(emailVerificationTokens).values({
      user_id: user.id,
      token,
      type: 'verification',
      expires_at: new Date(Date.now() + TWENTY_FOUR_HOURS_MS)
    });

    await sendVerificationEmail(email, token);

    res.status(200).json(genericResponse);
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
}

async function acceptInvitation(req: Request, res: Response) {
  const { token, password, first_name, last_name } = req.body;

  try {
    // Look up valid token (unused, not expired, type invitation)
    const [tokenRecord] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          eq(emailVerificationTokens.type, 'invitation'),
          isNull(emailVerificationTokens.used_at),
          gt(emailVerificationTokens.expires_at, new Date())
        )
      );

    if (!tokenRecord) {
      return res
        .status(400)
        .json({ error: 'Invalid or expired invitation link' });
    }

    const hashedPassword = await hashPassword(password);

    // In transaction: update user and mark token used
    await db.transaction(async (tx) => {
      const [updatedUser] = await tx
        .update(users)
        .set({
          password: hashedPassword,
          first_name: first_name || undefined,
          last_name: last_name || undefined,
          email_verified: true,
          updated_at: new Date()
        })
        .where(eq(users.id, tokenRecord.user_id))
        .returning({ id: users.id });

      if (!updatedUser) {
        throw Object.assign(new Error('User no longer exists'), {
          statusCode: 404
        });
      }

      await tx
        .update(emailVerificationTokens)
        .set({ used_at: new Date() })
        .where(eq(emailVerificationTokens.id, tokenRecord.id));
    });

    res.status(200).json({
      message: 'Account activated successfully. You can now log in.'
    });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode === 404) {
      return res.status(404).json({ error: err.message });
    }
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
}

export { signUp, verifyEmail, resendVerification, acceptInvitation };
