import { z } from 'zod';

import { strongPasswordSchema } from './users';

/**
 * Shapes shared by the profile page and the endpoints behind it:
 * self-service updates, password changes and two-factor enrolment.
 */

// ---------------------------------------------------------------- avatar

/**
 * Avatars travel as data URIs inside ordinary JSON — see
 * docs/adr/0001-avatar-as-data-uri.md. The client emits a 256×256 WebP of
 * roughly 15 KB, so ~20 KB once base64-encoded; 80 KB leaves ample headroom.
 *
 * Deliberately below the 100 KB `express.json` limit in app.ts. If it were
 * above, an oversized avatar would be cut off by the body parser as an opaque
 * 413 and the user would never see "Image is too large".
 */
export const MAX_AVATAR_DATA_URI_LENGTH = 80_000;

export const avatarDataUriSchema = z
  .string()
  .max(MAX_AVATAR_DATA_URI_LENGTH, 'Image is too large')
  .regex(
    /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/,
    'Avatar must be a base64 WebP, PNG or JPEG data URI'
  );

// ---------------------------------------------------------------- profile

/**
 * Strict on purpose. The handler spreads the parsed body straight into the
 * UPDATE, so an unexpected key that happens to name a real column — `is_admin`,
 * `token_version`, `email` — must be a loud 400 rather than a silent strip.
 */
export const updateProfileSchema = z
  .object({
    first_name: z.string().min(1).max(50).optional(),
    last_name: z.string().min(1).max(50).optional(),
    country_code: z.string().length(2).nullable().optional(),
    avatar_url: avatarDataUriSchema.nullable().optional(),
    /**
     * The `updated_at` the client rendered from. When present and stale the
     * server answers 409 rather than overwriting someone else's edit.
     */
    expected_updated_at: z.coerce.date().optional()
  })
  .strict();

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

// --------------------------------------------------------------- password

export const TOTP_CODE_LENGTH = 6;

export const totpCodeSchema = z
  .string()
  .regex(
    new RegExp(`^\\d{${TOTP_CODE_LENGTH}}$`),
    `Code must be ${TOTP_CODE_LENGTH} digits`
  );

/** Recovery codes are shown and typed as `a1b2-c3d4`. */
export const recoveryCodeSchema = z
  .string()
  .regex(/^[a-z0-9]{4}-[a-z0-9]{4}$/, 'Invalid recovery code');

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: strongPasswordSchema,
  /** Required when the account has two-factor authentication switched on. */
  totp_code: totpCodeSchema.optional()
});

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

// ------------------------------------------------------------ two-factor

/**
 * `current_password` appears on every sensitive body so the client can replay
 * the same request after a REAUTH_REQUIRED — see middleware/require-fresh-auth.
 */
const reauthFields = {
  current_password: z.string().min(1).optional()
};

export const twoFactorSetupSchema = z.object({ ...reauthFields });

export const twoFactorEnableSchema = z.object({
  ...reauthFields,
  code: totpCodeSchema
});

export const twoFactorDisableSchema = z.object({
  ...reauthFields,
  /** Either a live TOTP code or an unspent recovery code. */
  code: z.union([totpCodeSchema, recoveryCodeSchema])
});

export const regenerateRecoveryCodesSchema = z.object({ ...reauthFields });

export const twoFactorSetupResponseSchema = z.object({
  /** Base32, grouped in fours for manual entry. */
  secret: z.string(),
  otpauth_uri: z.string(),
  /** PNG data URI, rendered server-side so the client needs no QR library. */
  qr_data_uri: z.string()
});

export const recoveryCodesResponseSchema = z.object({
  recovery_codes: z.array(z.string())
});

export const twoFactorStatusSchema = z.object({
  enabled: z.boolean(),
  enabled_at: z.coerce.date().nullable(),
  last_used_at: z.coerce.date().nullable(),
  recovery_codes_remaining: z.number().int().nonnegative(),
  /** True once codes were issued, whether or not the user saved them. */
  recovery_codes_generated: z.boolean()
});

export type TwoFactorSetupResponse = z.infer<
  typeof twoFactorSetupResponseSchema
>;
export type RecoveryCodesResponse = z.infer<typeof recoveryCodesResponseSchema>;
export type TwoFactorStatus = z.infer<typeof twoFactorStatusSchema>;

// ------------------------------------------------------------- 2FA login

export const loginTwoFactorSchema = z.object({
  challenge_token: z.string().min(1),
  code: z.union([totpCodeSchema, recoveryCodeSchema])
});

export type LoginTwoFactorData = z.infer<typeof loginTwoFactorSchema>;

/** Returned by POST /auth/login when the password is right but 2FA is on. */
export const loginChallengeResponseSchema = z.object({
  requires_2fa: z.literal(true),
  challenge_token: z.string()
});
