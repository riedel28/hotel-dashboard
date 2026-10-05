import bcrypt from 'bcrypt';
import { and, eq, isNull } from 'drizzle-orm';
import type { Response } from 'express';

import env from '../../env';
import { db } from '../db/pool';
import { twoFactorRecoveryCodes, users } from '../db/schema';
import type { AuthenticatedRequest } from '../middleware/auth';
import {
  generateChallengeToken,
  generateToken,
  verifyChallengeToken
} from '../utils/jwt';
import {
  isRecoveryCodeFormat,
  matchRecoveryCode,
  verifyTotpCode
} from '../utils/totp';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const isProduction = env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/'
};

function setAuthCookie(res: Response, token: string, rememberMe = false) {
  res.cookie('auth_token', token, {
    ...cookieOptions,
    maxAge: rememberMe ? THIRTY_DAYS_MS : ONE_DAY_MS
  });
}

async function register(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    // Create user (admin-created users are pre-verified)
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        first_name,
        last_name,
        email_verified: true
      })
      .returning({
        id: users.id,
        email: users.email,
        first_name: users.first_name,
        last_name: users.last_name,
        selected_property_id: users.selected_property_id,
        created_at: users.created_at,
        updated_at: users.updated_at,
        is_admin: users.is_admin
      });

    // Generate JWT Token — a freshly inserted row is always at version 0
    const token = await generateToken({
      id: String(newUser.id),
      email: newUser.email,
      first_name: newUser.first_name || '',
      last_name: newUser.last_name || '',
      is_admin: newUser.is_admin,
      token_version: 0
    });

    setAuthCookie(res, token);

    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

/**
 * Loads the user, mints the session token and sets the cookie. Shared by the
 * single-step login and the second step of a 2FA login so both produce an
 * identical session.
 */
async function issueSession(
  res: Response,
  userId: number,
  rememberMe: boolean
) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      first_name: users.first_name,
      last_name: users.last_name,
      country_code: users.country_code,
      is_admin: users.is_admin,
      selected_property_id: users.selected_property_id,
      token_version: users.token_version,
      created_at: users.created_at,
      updated_at: users.updated_at
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) return null;

  const { token_version, ...publicUser } = user;

  const token = await generateToken(
    {
      id: String(user.id),
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      is_admin: user.is_admin,
      token_version
    },
    { rememberMe }
  );

  setAuthCookie(res, token, rememberMe);

  return publicUser;
}

async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user — fetch password and verification status
    const [userRecord] = await db
      .select({
        id: users.id,
        password: users.password,
        email_verified: users.email_verified,
        totp_enabled_at: users.totp_enabled_at
      })
      .from(users)
      .where(eq(users.email, email));

    if (!userRecord) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Invited user who hasn't set password yet — still do bcrypt.compare
    // against a dummy hash to prevent timing-based user enumeration
    if (!userRecord.password) {
      await bcrypt.compare(password, '$2b$10$dummyhashfortimingequalityx.');
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, userRecord.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Block unverified users
    if (!userRecord.email_verified) {
      return res.status(403).json({
        error: 'Please verify your email address before logging in',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Password is right, but the account demands a second factor. No cookie is
    // set here — the caller must come back to /auth/login/2fa with a code.
    if (userRecord.totp_enabled_at) {
      const challengeToken = await generateChallengeToken(userRecord.id);
      return res.status(200).json({
        requires_2fa: true,
        challenge_token: challengeToken
      });
    }

    const user = await issueSession(res, userRecord.id, Boolean(rememberMe));

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}

/**
 * Second step of a 2FA login. Accepts either a live TOTP code or an unspent
 * recovery code; a recovery code is burned on use.
 */
async function loginTwoFactor(req: AuthenticatedRequest, res: Response) {
  try {
    const { challenge_token, code, rememberMe } = req.body;

    let userId: number;
    try {
      const challenge = await verifyChallengeToken(challenge_token);
      userId = Number(challenge.id);
    } catch {
      return res.status(401).json({
        error: 'This sign-in attempt has expired. Please start again.',
        code: 'CHALLENGE_EXPIRED'
      });
    }

    const [userRecord] = await db
      .select({
        id: users.id,
        totp_secret: users.totp_secret,
        totp_enabled_at: users.totp_enabled_at
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!userRecord?.totp_enabled_at || !userRecord.totp_secret) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accepted = await consumeSecondFactor(
      userId,
      userRecord.totp_secret,
      code
    );

    if (!accepted) {
      return res.status(401).json({
        error: 'That code isn’t valid. Check your app and try again.',
        code: 'INVALID_2FA_CODE'
      });
    }

    await db
      .update(users)
      .set({ totp_last_used_at: new Date() })
      .where(eq(users.id, userId));

    const user = await issueSession(res, userId, Boolean(rememberMe));

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Two-factor login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}

/**
 * Accepts a TOTP code or spends a recovery code. Returns whether the second
 * factor was satisfied.
 */
async function consumeSecondFactor(
  userId: number,
  encryptedSecret: string,
  code: string
): Promise<boolean> {
  if (isRecoveryCodeFormat(code)) {
    const candidates = await db
      .select({
        id: twoFactorRecoveryCodes.id,
        code_hash: twoFactorRecoveryCodes.code_hash
      })
      .from(twoFactorRecoveryCodes)
      .where(
        and(
          eq(twoFactorRecoveryCodes.user_id, userId),
          isNull(twoFactorRecoveryCodes.used_at)
        )
      );

    const matchedId = await matchRecoveryCode(code, candidates);

    if (matchedId === null) return false;

    await db
      .update(twoFactorRecoveryCodes)
      .set({ used_at: new Date() })
      .where(eq(twoFactorRecoveryCodes.id, matchedId));

    return true;
  }

  return verifyTotpCode(encryptedSecret, code);
}

/**
 * Self-service password change. Requires the current password, plus a TOTP code
 * when 2FA is on, and retires every other session on success.
 */
async function changePassword(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = Number(req.user.id);
  const { current_password, new_password, totp_code } = req.body;

  try {
    const [record] = await db
      .select({
        password: users.password,
        totp_secret: users.totp_secret,
        totp_enabled_at: users.totp_enabled_at,
        token_version: users.token_version
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!record?.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const currentMatches = await bcrypt.compare(
      current_password,
      record.password
    );

    // Reported against the current-password field specifically — the new
    // password the user just composed stays in the form.
    if (!currentMatches) {
      return res.status(401).json({
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    const sameAsCurrent = await bcrypt.compare(new_password, record.password);

    if (sameAsCurrent) {
      return res.status(400).json({
        error: 'New password must be different from your current one',
        code: 'PASSWORD_UNCHANGED'
      });
    }

    if (record.totp_enabled_at && record.totp_secret) {
      if (!totp_code) {
        return res.status(400).json({
          error: 'Enter the 6-digit code from your authenticator app',
          code: 'TOTP_REQUIRED'
        });
      }

      const codeValid = await verifyTotpCode(record.totp_secret, totp_code);

      if (!codeValid) {
        return res.status(401).json({
          error: 'That code isn’t valid. Check your app and try again.',
          code: 'INVALID_2FA_CODE'
        });
      }
    }

    const hashedPassword = await bcrypt.hash(new_password, env.BCRYPT_ROUNDS);
    const nextTokenVersion = record.token_version + 1;

    await db
      .update(users)
      .set({
        password: hashedPassword,
        token_version: nextTokenVersion,
        updated_at: new Date()
      })
      .where(eq(users.id, userId));

    // Bumping token_version invalidated this device too, so re-issue its cookie.
    const refreshed = await issueSession(res, userId, false);

    if (!refreshed) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Password updated',
      other_sessions_signed_out: true
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
}

async function logout(_req: AuthenticatedRequest, res: Response) {
  res.clearCookie('auth_token', cookieOptions);
  res.status(200).json({ message: 'Logged out successfully' });
}

export {
  changePassword,
  consumeSecondFactor,
  login,
  loginTwoFactor,
  logout,
  register
};
