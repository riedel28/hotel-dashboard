import dayjs from 'dayjs';

/** Nights between two moments, by calendar date rather than 24-hour spans. */
export function countNights(from: Date, to: Date) {
  // Rounded: a day is 23 or 25 hours long across a DST change.
  return Math.round(
    dayjs(to).startOf('day').diff(dayjs(from).startOf('day'), 'day', true)
  );
}
