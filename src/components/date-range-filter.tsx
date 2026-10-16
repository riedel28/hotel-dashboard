import { Trans } from '@lingui/react/macro';
import dayjs from 'dayjs';

import {
  DateRangePopover,
  formatDateRange
} from '@/components/date-range-popover';
import { Button } from '@/components/ui/button';

/**
 * A list filter on a range of days, kept in the URL as YYYY-MM-DD: "All
 * dates" while none is set, and a way back to that.
 */
export function DateRangeFilter({
  from,
  to,
  onRangeChange,
  allowFuture,
  className
}: {
  from?: string;
  to?: string;
  onRangeChange: (range: { from: Date; to: Date } | undefined) => void;
  /** Days after today can be picked too, e.g. for what is planned. */
  allowFuture?: boolean;
  className?: string;
}) {
  const applied =
    from && to
      ? { from: dayjs(from).toDate(), to: dayjs(to).toDate() }
      : undefined;

  return (
    <DateRangePopover
      className={className}
      allowFuture={allowFuture}
      label={
        applied ? (
          formatDateRange(applied)
        ) : (
          <span className="text-muted-foreground">
            <Trans>All dates</Trans>
          </span>
        )
      }
      value={applied}
      onApply={onRangeChange}
      applyLabel={<Trans>Apply</Trans>}
      actions={(close) =>
        applied && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onRangeChange(undefined);
              close();
            }}
          >
            <Trans>All dates</Trans>
          </Button>
        )
      }
    />
  );
}
