import { useLingui } from '@lingui/react/macro';
import { Link, useLocation } from '@tanstack/react-router';
import { ListFilterIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BookingCellProps {
  bookingNr: string | null;
  reservationId: number | null;
  isFiltered: boolean;
  onToggleFilter: (bookingNr: string) => void;
}

export function BookingCell({
  bookingNr,
  reservationId,
  isFiltered,
  onToggleFilter
}: BookingCellProps) {
  const { t } = useLingui();
  // The reservation page links back to this exact view of the logs
  const back = useLocation({ select: (location) => location.href });

  if (!bookingNr) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    // The row opens the log on click; the link and the filter must not
    <div
      className="flex min-w-0 items-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      {/* The wrapper clips a long number; clipping the link itself would
          also cut its hover underline */}
      <span className="min-w-0 truncate py-0.5" title={bookingNr}>
        {reservationId === null ? (
          bookingNr
        ) : (
          <Link
            to="/reservations/$reservationId"
            params={{ reservationId: String(reservationId) }}
            search={{ back }}
            className="rounded-sm text-cyan-800 underline-offset-4 hover:underline dark:text-cyan-200/85"
          >
            {bookingNr}
          </Link>
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
        onClick={() => onToggleFilter(bookingNr)}
      >
        <ListFilterIcon className="size-3.5" />
      </Button>
    </div>
  );
}
