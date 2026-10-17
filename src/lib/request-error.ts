import { t } from '@lingui/core/macro';
import { isAxiosError } from 'axios';
import {
  CircleAlertIcon,
  FileQuestionMarkIcon,
  type LucideIcon,
  ServerCrashIcon,
  WifiOffIcon
} from 'lucide-react';

import { ApiError } from '@/api/client';

/** Why a request failed, as far as a person needs to know. */
type RequestErrorKind = 'offline' | 'server' | 'missing' | 'other';

function requestErrorKind(error: unknown): RequestErrorKind {
  if (!(error instanceof ApiError || isAxiosError(error))) return 'other';
  const status =
    error instanceof ApiError ? error.status : error.response?.status;
  // No response at all: offline, the server down, a timeout
  if (status === undefined) return 'offline';
  if (status >= 500) return 'server';
  if (status === 404) return 'missing';
  return 'other';
}

/** Worth asking again: nothing came back, or the server itself failed. */
export function isTransientError(error: unknown) {
  const kind = requestErrorKind(error);
  return kind === 'offline' || kind === 'server';
}

/**
 * What to show a person about a load that failed: the cause in their language
 * and as a picture. The raw message ("Network Error", "Request failed with
 * status code 502") is for the console, not for them.
 */
export function describeRequestError(error: unknown): {
  message: string;
  icon: LucideIcon;
} {
  // Built per call, not at module scope: the messages need the active locale
  switch (requestErrorKind(error)) {
    case 'offline':
      return {
        icon: WifiOffIcon,
        message: t`Can't reach the server. Check your connection and try again.`
      };
    case 'server':
      return {
        icon: ServerCrashIcon,
        message: t`The server ran into a problem. Try again in a moment.`
      };
    case 'missing':
      return {
        icon: FileQuestionMarkIcon,
        message: t`It may have been deleted or moved.`
      };
    case 'other':
      return {
        icon: CircleAlertIcon,
        message: t`Something unexpected happened. Try again.`
      };
  }
}
