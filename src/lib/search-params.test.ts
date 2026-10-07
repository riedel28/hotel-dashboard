import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { isInAppPath, lenientSearch } from './search-params';

describe('isInAppPath', () => {
  it('accepts paths inside the app', () => {
    expect(isInAppPath('/monitoring')).toBe(true);
    expect(isInAppPath('/monitoring?period=30d&log=2')).toBe(true);
  });

  it('rejects anything that resolves to another origin', () => {
    expect(isInAppPath('https://evil.com')).toBe(false);
    expect(isInAppPath('//evil.com')).toBe(false);
    expect(isInAppPath('/\\evil.com')).toBe(false);
    expect(isInAppPath('/\t/evil.com')).toBe(false);
    expect(isInAppPath('monitoring')).toBe(false);
    expect(isInAppPath('javascript:alert(1)')).toBe(false);
  });
});

describe('lenientSearch', () => {
  const schema = lenientSearch(
    z.object({
      status: z.enum(['success', 'error']).optional(),
      per_page: z.coerce.number().int().positive().optional(),
      q: z.string().optional()
    })
  );

  it('passes a valid search through', () => {
    expect(schema.parse({ status: 'error', q: 'lock' })).toEqual({
      status: 'error',
      q: 'lock'
    });
  });

  it('blanks only the params that fail validation', () => {
    const parsed = schema.parse({ status: 'nope', per_page: 'abc', q: 'lock' });

    expect(parsed).toEqual({ q: 'lock' });
    // Present but undefined, so it overrides the raw value the router keeps
    expect(parsed).toHaveProperty('status', undefined);
    expect(parsed).toHaveProperty('per_page', undefined);
  });
});
