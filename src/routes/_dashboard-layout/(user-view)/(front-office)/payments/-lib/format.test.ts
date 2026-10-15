import { describe, expect, it } from 'vitest';

import { maskCardNumber } from './format';

describe('maskCardNumber', () => {
  it('shows the last four digits only', () => {
    expect(maskCardNumber('4242')).toBe('•••• 4242');
  });

  it('never shows more than four digits, even when given a full number', () => {
    expect(maskCardNumber('4111111111111111')).toBe('•••• 1111');
  });
});
