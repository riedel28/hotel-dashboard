# Auth pages

- Auth pages live under `src/routes/_auth-layout/auth/`
- Token-based pages (accept-invitation, reset-password, verify-email) read `token` from search params via `validateSearch`
- Three-state pattern: no token → error view, form → input view, mutation success → success view
- Use `useMutation` from TanStack Query for form submissions, not `react-hook-form`'s `isSubmitting`
- Success/error views use consistent icon+heading+description+link layout
