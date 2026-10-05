import { randomInt } from 'node:crypto';

import bcrypt from 'bcrypt';
import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';

import env from '../../env';
import { decryptSecret } from './secret-box';

/** Shown on the authenticator's account entry. */
export const TOTP_ISSUER = 'Hotel Back-office';

/**
 * Accept codes one step either side of now, so a phone whose clock drifts by a
 * few seconds still works. otplib takes this as seconds, and one TOTP step is 30.
 */
const EPOCH_TOLERANCE_SECONDS = 30;

export const RECOVERY_CODE_COUNT = 10;

/**
 * No `l`, `1`, `o` or `0` — these codes get read off a screen and typed back in,
 * often from a printout, and the pairs are indistinguishable in most fonts.
 */
const RECOVERY_CODE_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';
const RECOVERY_CODE_GROUP_LENGTH = 4;

export function createTotpSecret(): string {
  return generateSecret();
}

export function buildOtpauthUri(secret: string, email: string): string {
  return generateURI({
    issuer: TOTP_ISSUER,
    label: email,
    secret
  });
}

export async function renderQrDataUri(otpauthUri: string): Promise<string> {
  return QRCode.toDataURL(otpauthUri, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 240
  });
}

/** Groups a base32 secret in fours for the "enter the key manually" fallback. */
export function formatSecretForDisplay(secret: string): string {
  return secret.replace(/(.{4})/g, '$1 ').trim();
}

/** Verifies against a secret held encrypted at rest. */
export async function verifyTotpCode(
  encryptedSecret: string,
  code: string
): Promise<boolean> {
  try {
    const result = await verify({
      secret: decryptSecret(encryptedSecret),
      token: code,
      epochTolerance: EPOCH_TOLERANCE_SECONDS
    });
    return result.valid;
  } catch (error) {
    console.error('TOTP verification failed:', error);
    return false;
  }
}

function randomRecoveryGroup(): string {
  let group = '';
  for (let i = 0; i < RECOVERY_CODE_GROUP_LENGTH; i++) {
    group += RECOVERY_CODE_ALPHABET[randomInt(RECOVERY_CODE_ALPHABET.length)];
  }
  return group;
}

/**
 * Returns the codes in plaintext — the only time they exist in that form — and
 * their hashes for storage. The caller must show the former exactly once.
 */
export async function createRecoveryCodes(): Promise<{
  codes: string[];
  hashes: string[];
}> {
  const codes = Array.from(
    { length: RECOVERY_CODE_COUNT },
    () => `${randomRecoveryGroup()}-${randomRecoveryGroup()}`
  );

  const hashes = await Promise.all(
    codes.map((code) => bcrypt.hash(code, env.BCRYPT_ROUNDS))
  );

  return { codes, hashes };
}

/**
 * Finds which of the user's unspent hashes matches. Hashes aren't searchable, so
 * this walks the (at most ten) candidates; it only runs when someone actually
 * falls back to a recovery code.
 */
export async function matchRecoveryCode(
  code: string,
  candidates: { id: number; code_hash: string }[]
): Promise<number | null> {
  for (const candidate of candidates) {
    if (await bcrypt.compare(code, candidate.code_hash)) {
      return candidate.id;
    }
  }
  return null;
}

export function isRecoveryCodeFormat(value: string): boolean {
  return /^[a-z0-9]{4}-[a-z0-9]{4}$/.test(value);
}
