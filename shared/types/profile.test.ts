import { describe, expect, test } from 'vitest';

import {
  avatarDataUriSchema,
  changePasswordSchema,
  MAX_AVATAR_DATA_URI_LENGTH,
  recoveryCodeSchema,
  totpCodeSchema,
  updateProfileSchema
} from './profile';
import { MIN_PASSWORD_LENGTH, strongPasswordSchema } from './users';

describe('strongPasswordSchema', () => {
  test(`requires ${MIN_PASSWORD_LENGTH} characters`, () => {
    // 11 characters, otherwise perfectly compliant
    expect(strongPasswordSchema.safeParse('Passw0rd!aB').success).toBe(false);
    expect(strongPasswordSchema.safeParse('Passw0rd!aBc').success).toBe(true);
  });

  test('rejects a password missing a character class', () => {
    expect(strongPasswordSchema.safeParse('alllowercase1!').success).toBe(
      false
    );
    expect(strongPasswordSchema.safeParse('NoDigitsHere!!').success).toBe(
      false
    );
    expect(strongPasswordSchema.safeParse('NoSymbols1234').success).toBe(false);
  });

  test('does not block password managers with a low length cap', () => {
    const long = `${'aB1!'.repeat(31)}aB1!`; // 128 chars
    expect(long).toHaveLength(128);
    expect(strongPasswordSchema.safeParse(long).success).toBe(true);
  });

  test('allows spaces, so passphrases work', () => {
    expect(
      strongPasswordSchema.safeParse('correct Horse 9 battery!').success
    ).toBe(true);
  });
});

describe('avatarDataUriSchema', () => {
  const body = 'A'.repeat(64);

  test('accepts the formats the client can produce', () => {
    for (const type of ['webp', 'png', 'jpeg']) {
      expect(
        avatarDataUriSchema.safeParse(`data:image/${type};base64,${body}`)
          .success
      ).toBe(true);
    }
  });

  test('rejects a remote URL', () => {
    expect(
      avatarDataUriSchema.safeParse('https://example.com/cat.png').success
    ).toBe(false);
  });

  test('rejects a non-image data URI', () => {
    expect(
      avatarDataUriSchema.safeParse(`data:text/html;base64,${body}`).success
    ).toBe(false);
  });

  test('rejects an SVG, which can carry script', () => {
    expect(
      avatarDataUriSchema.safeParse(`data:image/svg+xml;base64,${body}`).success
    ).toBe(false);
  });

  test('caps the size below the express.json body limit', () => {
    // 100 KB is the body-parser ceiling in backend/src/app.ts; the schema cap
    // must stay under it so oversized images fail with a readable message.
    expect(MAX_AVATAR_DATA_URI_LENGTH).toBeLessThan(100 * 1024);

    const oversized = `data:image/webp;base64,${'A'.repeat(
      MAX_AVATAR_DATA_URI_LENGTH
    )}`;
    expect(avatarDataUriSchema.safeParse(oversized).success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  test('accepts the fields a user may change about themselves', () => {
    const result = updateProfileSchema.safeParse({
      first_name: 'Sarah',
      last_name: 'Wilson',
      country_code: 'DE'
    });
    expect(result.success).toBe(true);
  });

  test('refuses privilege escalation rather than silently dropping it', () => {
    // The handler spreads the parsed body into an UPDATE, so a stripped key
    // would be an invisible near-miss. These must be loud failures.
    for (const payload of [
      { is_admin: true },
      { email: 'hijack@example.com' },
      { role_ids: [1] },
      { token_version: 0 },
      { password: 'whatever' }
    ]) {
      expect(updateProfileSchema.safeParse(payload).success).toBe(false);
    }
  });

  test('allows clearing the country but not the name', () => {
    expect(updateProfileSchema.safeParse({ country_code: null }).success).toBe(
      true
    );
    expect(updateProfileSchema.safeParse({ first_name: '' }).success).toBe(
      false
    );
  });
});

describe('code formats', () => {
  test('a TOTP code is exactly six digits', () => {
    expect(totpCodeSchema.safeParse('482917').success).toBe(true);
    expect(totpCodeSchema.safeParse('48291').success).toBe(false);
    expect(totpCodeSchema.safeParse('4829170').success).toBe(false);
    expect(totpCodeSchema.safeParse('48291a').success).toBe(false);
  });

  test('a recovery code is two groups of four', () => {
    expect(recoveryCodeSchema.safeParse('a1b2-c3d4').success).toBe(true);
    expect(recoveryCodeSchema.safeParse('A1B2-C3D4').success).toBe(false);
    expect(recoveryCodeSchema.safeParse('a1b2c3d4').success).toBe(false);
  });

  test('the two formats cannot be confused for one another', () => {
    expect(recoveryCodeSchema.safeParse('482917').success).toBe(false);
    expect(totpCodeSchema.safeParse('a1b2-c3d4').success).toBe(false);
  });
});

describe('changePasswordSchema', () => {
  test('requires the current password', () => {
    expect(
      changePasswordSchema.safeParse({
        current_password: '',
        new_password: 'BrandNewPass9!'
      }).success
    ).toBe(false);
  });

  test('treats the TOTP code as optional', () => {
    expect(
      changePasswordSchema.safeParse({
        current_password: 'Password123!',
        new_password: 'BrandNewPass9!'
      }).success
    ).toBe(true);
  });
});
