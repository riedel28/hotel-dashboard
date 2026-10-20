import { t } from '@lingui/core/macro';
import axios, { AxiosError, isAxiosError } from 'axios';
import { DEMO_FORBIDDEN } from 'shared/demo';
import z from 'zod';

type UnauthorizedHandler = (() => void) | null;
let unauthorizedHandler: UnauthorizedHandler = null;

function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

// Axios client configured with inline timeout and headers.
// baseURL is sourced from environment (VITE_API_BASE_URL).
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 401s and 403s the caller is expected to handle in place. These mean "prove
 * yourself again for this one action" (or "not this one, in the demo"), not
 * "your session is gone" — signing the user out and bouncing them to the login
 * page would destroy whatever they were doing.
 */
const IN_FLOW_CHALLENGE_CODES = new Set([
  DEMO_FORBIDDEN,
  'REAUTH_REQUIRED',
  'REAUTH_FAILED',
  'INVALID_CURRENT_PASSWORD',
  'INVALID_2FA_CODE',
  'CHALLENGE_EXPIRED'
]);

/** A 401/403 that means the session is gone, not a challenge in place. */
function endsSession(status: number | undefined, code: string | undefined) {
  return (
    (status === 401 || status === 403) &&
    !(code && IN_FLOW_CHALLENGE_CODES.has(code))
  );
}

// Pass through responses and errors unchanged
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error)) {
      const code = (error.response?.data as { code?: string } | undefined)
        ?.code;
      if (endsSession(error.response?.status, code)) {
        unauthorizedHandler?.();
      }
    }
    return Promise.reject(error);
  }
);

class ApiError extends Error {
  code?: string;
  status?: number;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/** The demo account was refused the request; the message says so. */
function isDemoForbidden(error: unknown): error is ApiError {
  return error instanceof ApiError && error.code === DEMO_FORBIDDEN;
}

/** A failed request that signed the user out; the login page says enough. */
function isSessionError(error: unknown) {
  return error instanceof ApiError && endsSession(error.status, error.code);
}

function handleApiError(err: unknown, context: string): never {
  if (isAxiosError(err)) {
    const ae = err as AxiosError<{
      error?: string;
      message?: string;
      code?: string;
    }>;
    const code = ae.response?.data?.code;
    throw new ApiError(
      code === DEMO_FORBIDDEN
        ? t`This isn't available in the demo`
        : (ae.response?.data?.error ??
            ae.response?.data?.message ??
            ae.message),
      code,
      ae.response?.status
    );
  }
  if (err instanceof z.ZodError) {
    console.error(`Validation error (${context}):`, err.issues);
    throw new Error('Invalid API response format');
  }
  throw err instanceof Error ? err : new Error(String(err));
}

export {
  ApiError,
  client,
  handleApiError,
  isDemoForbidden,
  isSessionError,
  setUnauthorizedHandler
};
