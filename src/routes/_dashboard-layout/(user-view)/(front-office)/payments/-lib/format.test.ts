import { describe, expect, it } from 'vitest';

import { maskCardNumber, truncateMiddle } from './format';

describe('maskCardNumber', () => {
  it('shows the last four digits only', () => {
    expect(maskCardNumber('4242')).toBe('•••• 4242');
  });

  it('never shows more than four digits, even when given a full number', () => {
    expect(maskCardNumber('4111111111111111')).toBe('•••• 1111');
  });
});

describe('truncateMiddle', () => {
  it('keeps the start and the end of a long value', () => {
    expect(truncateMiddle('PSP-7Q2K9X4M1B8N5T3R')).toBe('PSP-7Q2K…8N5T3R');
  });

  it('leaves a value that would barely shrink as it is', () => {
    expect(truncateMiddle('ABCDEFGHIJKLMNO')).toBe('ABCDEFGHIJKLMNO');
    expect(truncateMiddle('ABCDEFGHIJKLMNOP')).toBe('ABCDEFGH…KLMNOP');
  });
});
