import {
  CircleAlertIcon,
  FileQuestionMarkIcon,
  ServerCrashIcon,
  WifiOffIcon
} from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/api/client';

import { describeRequestError, isTransientError } from './request-error';

const offline = new ApiError('Network Error');
const serverDown = new ApiError('Bad Gateway', undefined, 502);
const missing = new ApiError('Not found', undefined, 404);
const refused = new ApiError('Invalid input', 'VALIDATION', 400);
const broken = new Error('Invalid API response format');

describe('request errors', () => {
  it('retries only what may pass on a second try', () => {
    expect(isTransientError(offline)).toBe(true);
    expect(isTransientError(serverDown)).toBe(true);
    expect(isTransientError(missing)).toBe(false);
    expect(isTransientError(refused)).toBe(false);
    expect(isTransientError(broken)).toBe(false);
  });

  it('says why in words and as an icon, never the raw message', () => {
    expect(describeRequestError(offline)).toMatchObject({
      icon: WifiOffIcon,
      message: expect.stringMatching(/reach the server/)
    });
    expect(describeRequestError(serverDown)).toMatchObject({
      icon: ServerCrashIcon,
      message: expect.stringMatching(/server ran into a problem/)
    });
    expect(describeRequestError(missing)).toMatchObject({
      icon: FileQuestionMarkIcon,
      message: expect.stringMatching(/deleted or moved/)
    });
    expect(describeRequestError(refused).icon).toBe(CircleAlertIcon);
    expect(describeRequestError(broken).message).toMatch(/unexpected/);
  });
});
