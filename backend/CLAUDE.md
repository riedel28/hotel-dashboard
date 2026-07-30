# Backend

## Email Verification & Token System

- `emailVerificationTokens` table handles three token types: `'verification'`, `'invitation'`, `'reset'`
- Token flow pattern: generate token → store in DB with expiry → send email with link → validate on use → mark `used_at` in transaction
- Always return generic 200 responses for email-based endpoints (forgot-password, resend-verification) to prevent email enumeration
- Invalidate old unused tokens (set `used_at`) before creating new ones for the same user/type
- Password reset tokens expire in 1 hour; verification/invitation tokens expire in 24h/7d
- Email templates live in `backend/src/utils/email.ts` — use `emailLayout()` wrapper for consistent styling
- Controllers in `backend/src/controllers/verification-controller.ts`, routes in `backend/src/routes/verification.ts`
