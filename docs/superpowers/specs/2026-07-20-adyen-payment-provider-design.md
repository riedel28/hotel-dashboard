# Adyen Payment Provider — configuration page

Date: 2026-07-20
Status: Approved

## Goal

Add a Payment Provider configuration page for **Adyen**, consistent with the
existing integration pages (`pms-provider`, `door-locks`), but laid out as a
wider three-section settings form with a sticky action bar.

## Decisions (from brainstorming)

- **Logo**: Adyen is a wordmark-only brand (2021 rebrand), lowercase `adyen` in
  Momentum Green `#0ABF53`. Reproduce faithfully as `public/adyen-logo.svg` plus
  a white `public/adyen-logo-inverse.svg` for dark mode (raw vendor SVG not
  reliably extractable via tooling).
- **Layout**: one wide `Card` (`max-w-[1080px]`) with three divider-separated
  sections.
- **Test connection**: new Adyen-specific dialog reusing the door-locks
  step-runner visual pattern; simulated.
- **Route & nav**: `/payment-provider`, added to the **Integrations** sidebar
  group as "Payment Provider".
- **Scope**: frontend/mock only (setTimeout + `toast`), no backend.
- **Form**: `react-hook-form` + `zod` (matches `door-locks-form`). Submit is not
  pre-disabled; on invalid submit focus first error; lock fields + spinner during
  submit.

## Structure

### Shell
`payment-provider.tsx` — breadcrumb (Home / Integrations / Payment Provider),
page header, `<PaymentProviderForm />`. One wide Card; header shows title
"Adyen configuration", the inverse-aware logo, and a live environment badge
(`LIVE` amber/red, `TEST` slate/blue) driven by the Environment field.

### §1 Credentials (vertical, full width)
1. Environment — `ToggleGroup` segmented control (Test / Live). Test→Live opens
   an `AlertDialog` confirmation.
2. Merchant ID — text input.
3. API Key — "Configured (ends ••••8F2A) + [Replace]" pattern; Replace reveals an
   empty `PasswordInput` with show/hide; only persists on Save.
4. Client Key — full width, Copy button (`input-group`).
5. Public Key — full width.
6. Additional configuration — monospace `Textarea`.
7. `[Test connection]` at the bottom → Adyen test dialog.

### §2 Payment Recipient
- Address line (100%), `autocomplete="address-line1"`.
- Address line 2 *(Optional)* (100%), `address-line2`.
- Row: ZIP (25% / `postal-code`) | City (50% / `address-level2`) | Country (25% /
  `country-picker`, `country`). Tablet: ZIP+City 50/50, Country full-width below.
  Mobile: all stacked.

### §3 Mapping Codes
- Desktop `table`: Payment method (50%, brand icon + text) | E-com (25%) | POS (25%).
- Inputs `type="text" inputmode="numeric"` (preserves leading zeros like `0024`).
- Inline per-cell validation below the input without shifting the row.
- Dirty-cell indicator (dot / colored ring) until saved.
- Mobile: collapse to one card per payment method.
- Methods: MasterCard, Visa, American Express, PayPal.

### Sticky action bar
Bottom bar: "Unsaved changes" indicator + `Cancel` / `Save changes`. Sticky on
mobile and long desktop pages. Fields lock + button spinner during submit.

### Test connection dialog
`payment-test-connection-dialog.tsx` — reuses door-locks step-runner visuals.
Steps (simulated): Reach Adyen API → Authenticate credentials → Verify
environment → Fetch merchant account. Validates current form values before open.

## Files

Create:
- `public/adyen-logo.svg`, `public/adyen-logo-inverse.svg`
- `src/routes/_dashboard-layout/(user-view)/payment-provider.tsx`
- `.../payment-provider/-components/payment-provider-form.tsx`
- `.../payment-provider/-components/payment-test-connection-dialog.tsx`

Edit:
- `src/routes/_dashboard-layout/-components/mobile-menu.tsx` (+ desktop sidebar if present)

## Verification
- `bun run typecheck:all`
- `bun run check`
- Drive the page in the app: environment switch confirmation, API key replace,
  mapping-code dirty state, responsive reflow, test-connection dialog.
