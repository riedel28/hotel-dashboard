import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import dayjs from 'dayjs';

import {
  DateRangePopover,
  formatDateRange
} from '@/components/date-range-popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DayRange = { from: Date; to: Date };

const today = () => dayjs();

// Quick picks beside the calendar, worked out when the filter opens.
const rangePresets: { label: MessageDescriptor; range: () => DayRange }[] = [
  {
    label: msg`Today`,
    range: () => ({ from: today().toDate(), to: today().toDate() })
  },
  {
    label: msg`Yesterday`,
    range: () => {
      const day = today().subtract(1, 'day').toDate();
      return { from: day, to: day };
    }
  },
  {
    label: msg`Last 7 days`,
    range: () => ({
      from: today().subtract(6, 'day').toDate(),
      to: today().toDate()
    })
  },
  {
    label: msg`Last 30 days`,
    range: () => ({
      from: today().subtract(29, 'day').toDate(),
      to: today().toDate()
    })
  },
  {
    label: msg`Month to date`,
    range: () => ({
      from: today().startOf('month').toDate(),
      to: today().toDate()
    })
  },
  {
    label: msg`Last month`,
    range: () => {
      const month = today().subtract(1, 'month');
      return {
        from: month.startOf('month').toDate(),
        to: month.endOf('month').toDate()
      };
    }
  },
  {
    label: msg`Year to date`,
    range: () => ({
      from: today().startOf('year').toDate(),
      to: today().toDate()
    })
  },
  {
    label: msg`Last year`,
    range: () => {
      const year = today().subtract(1, 'year');
      return {
        from: year.startOf('year').toDate(),
        to: year.endOf('year').toDate()
      };
    }
  }
];

const sameDays = (a: DayRange, b: DayRange) =>
  dayjs(a.from).isSame(b.from, 'day') && dayjs(a.to).isSame(b.to, 'day');

/**
 * A list filter on a range of days, kept in the URL as YYYY-MM-DD.
 *
 * - `apply` (payments): "All dates" while none is set, Apply commits the
 *   range, and "All dates" again takes it off.
 * - `quick` (reservations, events): quick picks beside the calendar, a
 *   complete range applies at once, "Pick a date range" while none is set
 *   and Reset to take it off.
 */
export function DateRangeFilter({
  from,
  to,
  onRangeChange,
  allowFuture,
  variant = 'apply',
  className
}: {
  from?: string;
  to?: string;
  onRangeChange: (range: DayRange | undefined) => void;
  /** Days after today can be picked too, e.g. for what is planned. */
  allowFuture?: boolean;
  variant?: 'apply' | 'quick';
  className?: string;
}) {
  const quick = variant === 'quick';
  const { t } = useLingui();
  const applied =
    from && to
      ? { from: dayjs(from).toDate(), to: dayjs(to).toDate() }
      : undefined;

  return (
    <DateRangePopover
      className={className}
      allowFuture={allowFuture}
      applyOnSelect={quick}
      label={
        applied ? (
          formatDateRange(applied)
        ) : (
          <span className="text-muted-foreground">
            {quick ? (
              <Trans>Pick a date range</Trans>
            ) : (
              <Trans>All dates</Trans>
            )}
          </span>
        )
      }
      value={applied}
      onApply={onRangeChange}
      applyLabel={<Trans>Apply</Trans>}
      presets={
        quick
          ? (close) =>
              rangePresets.map((preset) => {
                const range = preset.range();
                const isActive = applied && sameDays(applied, range);
                return (
                  <Button
                    key={preset.label.id}
                    type="button"
                    variant="ghost"
                    aria-pressed={Boolean(isActive)}
                    className={cn(
                      'h-7 w-full justify-start px-2 text-xs font-normal',
                      isActive && 'bg-accent'
                    )}
                    onClick={() => {
                      onRangeChange(range);
                      close();
                    }}
                  >
                    {t(preset.label)}
                  </Button>
                );
              })
          : undefined
      }
      actions={(close) =>
        quick ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onRangeChange(undefined);
              close();
            }}
          >
            <Trans>Reset</Trans>
          </Button>
        ) : (
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
        )
      }
    />
  );
}
