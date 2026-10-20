/**
 * The public demo account. Its credentials are shown on the login page, so
 * anyone can sign in with them — the backend refuses it whatever would lock
 * the next visitor out or send email (see middleware/demo.ts), and the
 * scheduled reseed undoes the rest.
 */
export const DEMO_EMAIL = 'demo@example.com';
export const DEMO_PASSWORD = 'overlook-demo';

/** The error code of a request the demo account isn't allowed to make. */
export const DEMO_FORBIDDEN = 'DEMO_FORBIDDEN';

export const isDemoEmail = (email: string | null | undefined) =>
  email?.toLowerCase() === DEMO_EMAIL;
