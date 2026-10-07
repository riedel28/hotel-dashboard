import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
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

  if (!bookingNr) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-1">
      {reservationId === null ? (
        <span className="truncate" title={bookingNr}>
          {bookingNr}
        </span>
      ) : (
        <Link
          to="/reservations/$reservationId"
          params={{ reservationId: String(reservationId) }}
          // A long number is cut with an ellipsis instead of spilling over
          title={bookingNr}
          className="truncate rounded-sm text-cyan-800 underline-offset-4 hover:underline dark:text-cyan-200/85"
        >
          {bookingNr}
        </Link>
      )}
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
