import { t } from '@lingui/core/macro';
import { isAxiosError } from 'axios';

import { ApiError } from '@/api/client';

/**
 * The HTTP status of a failed request; `undefined` when no response came back
 * at all (offline, server down, timeout) or the error isn't a request's.
 */
function statusOf(error: unknown): number | undefined {
  if (error instanceof ApiError) return error.status;
  if (isAxiosError(error)) return error.response?.status;
  return undefined;
}

function isRequestError(error: unknown) {
  return error instanceof ApiError || isAxiosError(error);
}

/** Worth asking again: nothing came back, or the server itself failed. */
export function isTransientError(error: unknown) {
  if (!isRequestError(error)) return false;
  const status = statusOf(error);
  return status === undefined || status >= 500;
}

/**
 * What to tell a person about a load that failed, in their language. The raw
 * message ("Network Error", "Request failed with status code 502") is for the
 * console, not for them.
 */
export function describeLoadError(error: unknown): string {
  const status = statusOf(error);
  if (isRequestError(error) && status === undefined) {
    return t`Can't reach the server. Check your connection and try again.`;
  }
  if (status !== undefined && status >= 500) {
    return t`The server ran into a problem. Try again in a moment.`;
  }
  if (status === 404) {
    return t`It may have been deleted or moved.`;
  }
  return t`Something unexpected happened. Try again.`;
}
