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
    <div className="flex min-w-0 items-center">
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
      {/* The filter button takes no room of its own, so the column only has
          to fit the number: it appears right after it when the row is hovered
          or the button focused, and stays while its filter is on. Devices
          without hover set the filter from the log's details instead.
          Centred with auto margins rather than a transform: the button's own
          pressed-state transform would replace a translate and move it out
          from under the pointer mid-click. */}
      <span className="relative w-0 self-stretch [@media(hover:none)]:hidden">
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
            'absolute inset-y-0 left-1 my-auto text-muted-foreground/60 opacity-0 group-hover/row:opacity-100 hover:text-foreground focus-visible:opacity-100',
            isFiltered && 'bg-muted text-foreground opacity-100'
          )}
          onClick={(event) => {
            event.stopPropagation();
            reservationFilter.toggle(bookingNr);
          }}
        >
          <ListFilterIcon className="size-3.5" />
        </Button>
      </span>
    </div>
  );
}
