import { describe, expect, test } from 'vitest';

import { parseTime } from './time-input';

describe('parseTime', () => {
  test.each([
    ['9', '09:00'],
    ['15', '15:00'],
    ['215', '02:15'],
    ['2150', '21:50'],
    ['9:5', '09:05'],
    [' 14:37 ', '14:37']
  ])('normalizes %j to %s', (input, expected) => {
    expect(parseTime(input)).toBe(expected);
  });

  test.each(['', '24', '1260', '12:60', '12345', 'noon'])(
    'rejects %j',
    (input) => {
      expect(parseTime(input)).toBeNull();
    }
  );
});
