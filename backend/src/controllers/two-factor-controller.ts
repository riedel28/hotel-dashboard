import { and, count, eq, isNull } from 'drizzle-orm';
import type { Response } from 'express';

import { db } from '../db/pool';
import { twoFactorRecoveryCodes, users } from '../db/schema';
import type { AuthenticatedRequest } from '../middleware/auth';
import { encryptSecret } from '../utils/secret-box';
import {
  buildOtpauthUri,
  createRecoveryCodes,
  createTotpSecret,
  formatSecretForDisplay,
  renderQrDataUri,
  verifyTotpCode
} from '../utils/totp';
import { consumeSecondFactor } from './auth-controller';

/**
 * Enrolment is two calls: `setup` mints a secret and parks it on the row, then
 * `enable` proves the user's app can produce a matching code and only then
 * stamps totp_enabled_at. Until that stamp exists 2FA is off, so an abandoned
 * setup leaves nobody locked out.
 */

async function getStatus(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = Number(req.user.id);

  try {
    const [record] = await db
      .select({
        totp_enabled_at: users.totp_enabled_at,
        totp_last_used_at: users.totp_last_used_at
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!record) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [remaining] = await db
      .select({ value: count() })
      .from(twoFactorRecoveryCodes)
      .where(
        and(
          eq(twoFactorRecoveryCodes.user_id, userId),
          isNull(twoFactorRecoveryCodes.used_at)
        )
      );

    const [issued] = await db
      .select({ value: count() })
      .from(twoFactorRecoveryCodes)
      .where(eq(twoFactorRecoveryCodes.user_id, userId));

    res.status(200).json({
      enabled: record.totp_enabled_at !== null,
      enabled_at: record.totp_enabled_at,
      last_used_at: record.totp_last_used_at,
      recovery_codes_remaining: remaining?.value ?? 0,
      recovery_codes_generated: (issued?.value ?? 0) > 0
    });
  } catch (error) {
    console.error('Two-factor status error:', error);
    res.status(500).json({ error: 'Failed to load two-factor status' });
  }
}

async function setup(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = Number(req.user.id);

  try {
    const [record] = await db
      .select({ email: users.email, totp_enabled_at: users.totp_enabled_at })
      .from(users)
      .where(eq(users.id, userId));

    if (!record) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (record.totp_enabled_at) {
      return res.status(409).json({
        error: 'Two-factor authentication is already enabled',
        code: 'ALREADY_ENABLED'
      });
    }

    // A fresh secret each time setup is opened, so a half-finished attempt
    // can't be resumed from a QR code someone photographed earlier.
    const secret = createTotpSecret();
    const otpauthUri = buildOtpauthUri(secret, record.email);

    await db
      .update(users)
      .set({ totp_secret: encryptSecret(secret) })
      .where(eq(users.id, userId));

    res.status(200).json({
      secret: formatSecretForDisplay(secret),
      otpauth_uri: otpauthUri,
      qr_data_uri: await renderQrDataUri(otpauthUri)
    });
  } catch (error) {
    console.error('Two-factor setup error:', error);
    res.status(500).json({ error: 'Failed to start two-factor setup' });
  }
}

async function enable(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = Number(req.user.id);
  const { code } = req.body;

  try {
    const [record] = await db
      .select({
        totp_secret: users.totp_secret,
        totp_enabled_at: users.totp_enabled_at
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!record?.totp_secret) {
      return res.status(409).json({
        error: 'Start the setup again to get a new QR code',
        code: 'NO_PENDING_SETUP'
      });
    }

    if (record.totp_enabled_at) {
      return res.status(409).json({
        error: 'Two-factor authentication is already enabled',
        code: 'ALREADY_ENABLED'
      });
    }

    const codeValid = await verifyTotpCode(record.totp_secret, code);

    if (!codeValid) {
      return res.status(401).json({
        error: 'That code isn’t valid. Check your app and try again.',
        code: 'INVALID_2FA_CODE'
      });
    }

    const { codes, hashes } = await createRecoveryCodes();

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ totp_enabled_at: new Date(), updated_at: new Date() })
        .where(eq(users.id, userId));

      await tx.insert(twoFactorRecoveryCodes).values(
        hashes.map((code_hash) => ({
          user_id: userId,
          code_hash
        }))
      );
    });

    // The only time these exist in plaintext.
    res.status(200).json({ recovery_codes: codes });
  } catch (error) {
    console.error('Two-factor enable error:', error);
    res
      .status(500)
      .json({ error: 'Failed to enable two-factor authentication' });
  }
}

async function disable(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = Number(req.user.id);
  const { code } = req.body;

  try {
    const [record] = await db
      .select({
        totp_secret: users.totp_secret,
        totp_enabled_at: users.totp_enabled_at,
        token_version: users.token_version
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!record?.totp_enabled_at || !record.totp_secret) {
      return res.status(409).json({
        error: 'Two-factor authentication is not enabled',
        code: 'NOT_ENABLED'
      });
    }

    const accepted = await consumeSecondFactor(
      userId,
      record.totp_secret,
      code
    );

    if (!accepted) {
      return res.status(401).json({
        error: 'That code isn’t valid. Check your app and try again.',
        code: 'INVALID_2FA_CODE'
      });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          totp_secret: null,
          totp_enabled_at: null,
          totp_last_used_at: null,
          // Dropping a factor is a downgrade in account security; anything
          // signed in elsewhere has to prove itself again.
          token_version: record.token_version + 1,
          updated_at: new Date()
        })
        .where(eq(users.id, userId));

      await tx
        .delete(twoFactorRecoveryCodes)
        .where(eq(twoFactorRecoveryCodes.user_id, userId));
    });

    res.status(200).json({ message: 'Two-factor authentication disabled' });
  } catch (error) {
    console.error('Two-factor disable error:', error);
    res
      .status(500)
      .json({ error: 'Failed to disable two-factor authentication' });
  }
}

async function regenerateRecoveryCodes(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = Number(req.user.id);

  try {
    const [record] = await db
      .select({ totp_enabled_at: users.totp_enabled_at })
      .from(users)
      .where(eq(users.id, userId));

    if (!record?.totp_enabled_at) {
      return res.status(409).json({
        error: 'Two-factor authentication is not enabled',
        code: 'NOT_ENABLED'
      });
    }

    const { codes, hashes } = await createRecoveryCodes();

    await db.transaction(async (tx) => {
      // Replace outright — any code the user still holds stops working.
      await tx
        .delete(twoFactorRecoveryCodes)
        .where(eq(twoFactorRecoveryCodes.user_id, userId));

      await tx.insert(twoFactorRecoveryCodes).values(
        hashes.map((code_hash) => ({
          user_id: userId,
          code_hash
        }))
      );
    });

    res.status(200).json({ recovery_codes: codes });
  } catch (error) {
    console.error('Recovery code regeneration error:', error);
    res.status(500).json({ error: 'Failed to regenerate recovery codes' });
  }
}

export { disable, enable, getStatus, regenerateRecoveryCodes, setup };
