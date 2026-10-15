import { describe, expect, it } from 'vitest';

import { ApiError } from '@/api/client';

import { describeLoadError, isTransientError } from './load-error';

const offline = new ApiError('Network Error');
const serverDown = new ApiError('Bad Gateway', undefined, 502);
const missing = new ApiError('Not found', undefined, 404);
const refused = new ApiError('Invalid input', 'VALIDATION', 400);
const broken = new Error('Invalid API response format');

describe('load errors', () => {
  it('retries only what may pass on a second try', () => {
    expect(isTransientError(offline)).toBe(true);
    expect(isTransientError(serverDown)).toBe(true);
    expect(isTransientError(missing)).toBe(false);
    expect(isTransientError(refused)).toBe(false);
    expect(isTransientError(broken)).toBe(false);
  });

  it('says why in words, never the raw message', () => {
    expect(describeLoadError(offline)).toMatch(/reach the server/);
    expect(describeLoadError(serverDown)).toMatch(/server ran into a problem/);
    expect(describeLoadError(missing)).toMatch(/deleted or moved/);
    expect(describeLoadError(refused)).toMatch(/unexpected/);
    expect(describeLoadError(broken)).toMatch(/unexpected/);
  });
});
