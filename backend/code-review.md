# Code Review: Email Verification & User Invitation System

## Summary

This is a well-structured feature adding email verification for sign-up and an admin invitation flow. The architecture is solid: separate verification controller, token-based verification, proper transaction usage, and good UX with resend capabilities. However, there are a few issues worth addressing before merge.

---

## Critical / Bugs

### 1. "Resend invitation" is broken — sends wrong email type

`src/routes/_dashboard-layout/(user-view)/users/-components/row-actions.tsx:40` calls `resendVerification(email)` which hits `POST /auth/resend-verification`. But that endpoint only creates `type: 'verification'` tokens and sends a **verification** email (links to `/auth/verify-email`).

For invited users, this is wrong — they need an `invitation` token that links to `/auth/accept-invitation` so they can set a password. Currently, clicking "Resend invitation" would:
1. Create a `verification` token (not `invitation`)
2. Send a "verify your email" email (not an invitation email)
3. The user clicks the link, gets verified, but still has **no password** and can't log in

**Fix:** Add a dedicated `POST /users/invite/:id/resend` (or similar) endpoint that creates an `invitation` token and calls `sendInvitationEmail`.

### 2. Hardcoded placeholder text in users page

`src/routes/_dashboard-layout/(user-view)/users/index.tsx:235-237`:
```tsx
You have <span className="font-medium">3</span> of{' '}
<span className="font-medium">12</span> invitations available
```
This is hardcoded dummy data, not wrapped in `<Trans>`, and not driven by any API. Should either be wired to real data or removed before shipping.

### 3. `verify-email.tsx` double-fires in React Strict Mode (dev)

`src/routes/_auth-layout/auth/verify-email.tsx:25-31`: The `useEffect` calls `verifyMutation.mutate()` on mount. In React 18 Strict Mode, effects run twice — the first call succeeds and marks the token as used, then the second call fails because the token is already consumed. This causes the UI to flash from "Verifying..." to "Verification failed" during development.

Consider using a ref guard or `mutateAsync` with an abort check.

---

## Security

### 4. Is `/api/auth/register` still accessible unauthenticated?

`app.ts:55` mounts `authRouter` which includes the `register` endpoint. The `register` controller (`auth-controller.ts:24`) creates pre-verified users with immediate login. If this endpoint doesn't require authentication, anyone can bypass the email verification flow entirely by calling `/register` instead of `/sign-up`.

**Recommendation:** Either remove the `register` route, or add `authenticateToken` + `requireAdmin` middleware to it so only admins can create pre-verified accounts.

### 5. Login error detection is fragile

`src/routes/_auth-layout/auth/login.tsx:83`:
```ts
if (error.message?.includes('verify your email'))
```
This relies on substring matching of the error message. If the server-side message in `auth-controller.ts:108` changes even slightly, this breaks silently. The server already returns `code: 'EMAIL_NOT_VERIFIED'` — match on that instead.

### 6. HTML injection in invitation email

`backend/src/utils/email.ts:85`:
```ts
<h2>You've been invited${inviterText}!</h2>
```
`inviterText` comes from `first_name`/`last_name` of the authenticated user. If a user's name contains HTML (e.g. `<script>alert(1)</script>`), it gets injected into the email body. While most email clients sanitize, this is still a best practice violation. Escape HTML entities before interpolation.

### 7. Minor: Timing difference in login for invited users

`auth-controller.ts:91-95` returns immediately when `!userRecord.password`, skipping the `bcrypt.compare`. This creates a measurable timing difference that could distinguish invited-but-not-accepted users from non-existent users. Low severity given the generic error message, but a dummy `bcrypt.compare` would be more robust.

---

## Code Quality

### 8. `t` macro called at module scope in invite-user-modal

`src/routes/_dashboard-layout/(user-view)/users/-components/invite-user-modal.tsx:36`:
```tsx
email: z.string().email(t`Invalid email address`),
```
Per CLAUDE.md: *"Do not call translation macros at module scope (locale may not be activated yet)"*. Move this schema inside the component or use a factory function.

### 9. Email sending inside database transaction

`backend/src/controllers/user-controller.ts:504`: `sendInvitationEmail` is called inside the `db.transaction()` block. If the SMTP server is slow or times out, the database transaction stays open unnecessarily. Consider moving the email send after the transaction commits (pass the token out of the transaction scope).

### 10. Duplicate password validation schemas

Password rules are defined separately in:
- `backend/src/routes/verification.ts:14-23`
- `src/lib/schemas.ts:10-19`

These match today but could drift. Consider sharing via the `shared/` directory, consistent with how `shared/types/users.ts` is already used.

---

## Minor / Nits

- **`acceptInvitation` doesn't verify the user still exists** (`verification-controller.ts:180-196`): If the admin deletes the user between invitation and acceptance, the update silently affects 0 rows but returns a success message.
- **`verification-controller.ts:63-75`** — The token lookup and subsequent transaction aren't fully atomic; a race condition could allow double-verification. Low impact since verification is idempotent.
- **`'use client'` directive** in `row-actions.tsx:1` — not needed in a Vite/React project (this is a Next.js convention). Harmless but misleading.

---

## What looks good

- Token generation via `crypto.randomBytes(32)` — cryptographically secure
- Generic response in `resendVerification` to prevent email enumeration
- Proper use of database transactions for multi-table updates
- Email verification tokens have expiry and used_at tracking
- Dev fallback for email (console logging when no SMTP configured)
- Invitation tokens with 7-day expiry vs 24h for verification — appropriate distinction
- Schema design with proper indexes, FK cascades, and check constraints
- Clean separation of verification routes (public) from user routes (authenticated)
- The `beforeLoad` guards on auth pages preventing authenticated users from seeing login/signup
