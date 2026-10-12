import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync
} from 'node:crypto';

import env from '../../env';

/**
 * Symmetric encryption for secrets that must be recoverable in plaintext: the
 * TOTP shared secret, which has to be handed back to otplib on every
 * verification, and a property's payment provider API key.
 *
 * The key is derived from TOTP_ENCRYPTION_KEY, falling back to JWT_SECRET.
 * Rotating whichever one is in use makes every stored secret undecryptable:
 * affected users must re-enrol their authenticator and every payment provider
 * API key must be entered again.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const KEY_SALT = 'hotel-dashboard/totp-secret/v1';
const PREFIX = 'v1';

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const material = env.TOTP_ENCRYPTION_KEY || env.JWT_SECRET;

  if (!material) {
    throw new Error('No key material available to encrypt TOTP secrets');
  }

  cachedKey = scryptSync(material, KEY_SALT, 32);
  return cachedKey;
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  return [
    PREFIX,
    iv.toString('base64'),
    cipher.getAuthTag().toString('base64'),
    ciphertext.toString('base64')
  ].join(':');
}

export function decryptSecret(payload: string): string {
  const [version, ivPart, tagPart, dataPart] = payload.split(':');

  if (version !== PREFIX || !ivPart || !tagPart || !dataPart) {
    throw new Error('Malformed encrypted secret');
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivPart, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tagPart, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, 'base64')),
    decipher.final()
  ]).toString('utf8');
}
