import { useLingui } from '@lingui/react/macro';
import { ListFilterIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useReservationFilter } from '../../-hooks/use-monitoring-search';
import { ReservationLink } from '../reservation-link';

interface BookingCellProps {
  bookingNr: string | null;
  reservationId: number | null;
}

export function BookingCell({ bookingNr, reservationId }: BookingCellProps) {
  const { t } = useLingui();
  const reservationFilter = useReservationFilter();
  const isFiltered =
    bookingNr !== null && bookingNr === reservationFilter.reservation;

  if (!bookingNr) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    // A click on the row opens the log. Only the link and the filter button
    // keep the click to themselves; the empty space around them still opens it.
    <div className="flex min-w-0 items-center gap-1">
      {/* The wrapper clips a long number; clipping the link itself would
          also cut its hover underline */}
      <span className="min-w-0 truncate py-0.5" title={bookingNr}>
        {reservationId === null ? (
          bookingNr
        ) : (
          <ReservationLink
            reservationId={reservationId}
            bookingNr={bookingNr}
            onClick={(event) => event.stopPropagation()}
          />
        )}
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-pressed={isFiltered}
        aria-label={
          isFiltered
            ? t`Remove filter by reservation ${bookingNr}`
            : t`Show only logs of reservation ${bookingNr}`
        }
        title={
          isFiltered ? t`Remove reservation filter` : t`Filter by reservation`
        }
        className={cn(
          'shrink-0 text-muted-foreground/60 hover:text-foreground',
          isFiltered && 'bg-muted text-foreground'
        )}
        onClick={(event) => {
          event.stopPropagation();
          reservationFilter.toggle(bookingNr);
        }}
      >
        <ListFilterIcon className="size-3.5" />
      </Button>
    </div>
  );
}
