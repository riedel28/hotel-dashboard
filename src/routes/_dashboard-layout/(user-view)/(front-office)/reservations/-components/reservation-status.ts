import type { ReservationStatus } from '@/api/reservations';
import type { BadgeProps } from '@/components/ui/badge';

interface ReservationStatusStyle {
  badgeColor: BadgeProps['color'];
}

const fallbackStyle: ReservationStatusStyle = { badgeColor: 'gray' };

const reservationStatusStyles: Record<
  ReservationStatus,
  ReservationStatusStyle
> = {
  pending: { badgeColor: 'yellow' },
  started: { badgeColor: 'sky' },
  done: { badgeColor: 'emerald' },
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
