import crypto from 'node:crypto';

function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export { generateVerificationToken };
