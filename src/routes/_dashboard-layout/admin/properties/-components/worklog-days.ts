import dayjs from 'dayjs';

export type DayKind = 'today' | 'yesterday' | 'this-year' | 'older';

/** How a day header is worded, judged in the browser's time zone. */
export function dayKind(day: string | Date, now: Date = new Date()): DayKind {
  const daysAgo = dayjs(now)
    .startOf('day')
    .diff(dayjs(day).startOf('day'), 'day');
  if (daysAgo === 0) return 'today';
  if (daysAgo === 1) return 'yesterday';
  return dayjs(day).isSame(now, 'year') ? 'this-year' : 'older';
}

/** Buckets entries by local calendar day, keeping the order they came in. */
export function groupByDay<T extends { created_at: string }>(
  entries: T[]
): [day: string, entries: T[]][] {
  const days = new Map<string, T[]>();
  for (const entry of entries) {
    const day = dayjs(entry.created_at).format('YYYY-MM-DD');
    days.set(day, [...(days.get(day) ?? []), entry]);
  }
  return [...days];
}
