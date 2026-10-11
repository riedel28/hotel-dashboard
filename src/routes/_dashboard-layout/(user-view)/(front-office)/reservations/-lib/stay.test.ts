import { describe, expect, test } from 'vitest';

import { countNights } from './stay';

describe('countNights', () => {
  test('counts calendar dates, whatever the times of day', () => {
    expect(
      countNights(new Date(2024, 2, 15, 23, 30), new Date(2024, 2, 18, 0, 15))
    ).toBe(3);
  });

  test('is zero for the same day and negative when departure comes first', () => {
    expect(
      countNights(new Date(2024, 2, 15, 8), new Date(2024, 2, 15, 20))
    ).toBe(0);
    expect(countNights(new Date(2024, 2, 15), new Date(2024, 2, 14))).toBe(-1);
  });
});
