import dayjs from 'dayjs';

export type DayKind = 'today' | 'yesterday' | 'this-year' | 'older';

/** How a day header is worded, judged in the browser's time zone. */
export function dayKind(day: Date, now: Date = new Date()): DayKind {
  const daysAgo = dayjs(now)
    .startOf('day')
    .diff(dayjs(day).startOf('day'), 'day');
  if (daysAgo === 0) return 'today';
  if (daysAgo === 1) return 'yesterday';
  return dayjs(day).isSame(now, 'year') ? 'this-year' : 'older';
}

export interface Day<T> {
  /** Local midnight of the day. */
  date: Date;
  entries: T[];
}

/** Buckets entries by local calendar day, keeping the order they came in. */
export function groupByDay<T extends { created_at: string }>(
  entries: T[]
): Day<T>[] {
  const days = new Map<number, Day<T>>();
  for (const entry of entries) {
    const date = dayjs(entry.created_at).startOf('day').toDate();
    const day = days.get(date.getTime()) ?? { date, entries: [] };
    day.entries.push(entry);
    days.set(date.getTime(), day);
  }
  return [...days.values()];
}
