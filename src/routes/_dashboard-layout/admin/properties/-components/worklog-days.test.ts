import { describe, expect, test } from 'vitest';

import { dayKind, groupByDay } from './worklog-days';

// Local-time constructors, so the test holds in any time zone.
const at = (y: number, m: number, d: number, h = 12) =>
  new Date(y, m - 1, d, h);

describe('dayKind', () => {
  const now = at(2026, 3, 10, 0);

  test('judges by calendar day, not by elapsed hours', () => {
    expect(dayKind(at(2026, 3, 10, 23), now)).toBe('today');
    // One minute before midnight is yesterday, though under an hour ago.
    expect(dayKind(new Date(2026, 2, 9, 23, 59), now)).toBe('yesterday');
    expect(dayKind(at(2026, 3, 8), now)).toBe('this-year');
    expect(dayKind(at(2025, 12, 31), now)).toBe('older');
  });

  test('yesterday wins over the year boundary', () => {
    expect(dayKind(at(2025, 12, 31), at(2026, 1, 1))).toBe('yesterday');
  });
});

describe('groupByDay', () => {
  test('splits on the local day and keeps the incoming order', () => {
    const entry = (id: number, date: Date) => ({
      id,
      created_at: date.toISOString()
    });
    const groups = groupByDay([
      entry(1, at(2026, 3, 10, 9)),
      entry(2, at(2026, 3, 10, 0)),
      entry(3, new Date(2026, 2, 9, 23, 59)),
      entry(4, at(2025, 12, 1))
    ]);

    expect(
      groups.map(({ date, entries }) => [date, entries.map((e) => e.id)])
    ).toEqual([
      [at(2026, 3, 10, 0), [1, 2]],
      [at(2026, 3, 9, 0), [3]],
      [at(2025, 12, 1, 0), [4]]
    ]);
  });
});
