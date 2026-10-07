import { Link, useLocation } from '@tanstack/react-router';
import type { MouseEventHandler } from 'react';

interface ReservationLinkProps {
  reservationId: number;
  bookingNr: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/**
 * A reservation's number, linked to the reservation. It hands the current view
 * over as the reservation page's `back` target, so Back returns right here.
 */
export function ReservationLink({
  reservationId,
  bookingNr,
  onClick
}: ReservationLinkProps) {
  const back = useLocation({ select: (location) => location.href });

  return (
    <Link
      to="/reservations/$reservationId"
      params={{ reservationId: String(reservationId) }}
      search={{ back }}
      onClick={onClick}
      className="rounded-sm text-cyan-800 underline-offset-4 hover:underline dark:text-cyan-200/85"
    >
      {bookingNr}
    </Link>
  );
}
