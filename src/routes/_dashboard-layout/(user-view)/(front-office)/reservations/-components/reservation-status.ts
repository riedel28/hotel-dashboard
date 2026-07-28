import type { ReservationStatus } from '@/api/reservations';
import type { BadgeProps } from '@/components/ui/badge';

interface ReservationStatusStyle {
  /** Badge color for the table cell. */
  badgeColor: BadgeProps['color'];
  /** Dot color for the status filter. Deeper shade than the badge fill. */
  dotClassName: string;
}

const fallbackStyle: ReservationStatusStyle = {
  badgeColor: 'gray',
  dotClassName: 'bg-gray-400 dark:bg-gray-500'
};

const reservationStatusStyles: Record<
  ReservationStatus,
  ReservationStatusStyle
> = {
  pending: {
    badgeColor: 'yellow',
    dotClassName: 'bg-yellow-500 dark:bg-yellow-400'
  },
  started: { badgeColor: 'sky', dotClassName: 'bg-sky-500 dark:bg-sky-400' },
  done: {
    badgeColor: 'emerald',
    dotClassName: 'bg-emerald-500 dark:bg-emerald-400'
  },
  all: fallbackStyle
};

/**
 * Single source of truth for how a reservation status is colored, so the table
 * cell and the status filter cannot drift apart.
 */
function getReservationStatusStyle(
  status: ReservationStatus
): ReservationStatusStyle {
  return reservationStatusStyles[status] ?? fallbackStyle;
}

export { getReservationStatusStyle, type ReservationStatusStyle };
