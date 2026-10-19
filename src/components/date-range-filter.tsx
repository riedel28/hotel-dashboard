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
 * A list filter on a range of days, kept in the URL as YYYY-MM-DD: quick
 * picks beside the calendar, a complete range applies as soon as it is
 * picked, and Reset takes it off.
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
  onRangeChange: (range: DayRange | undefined) => void;
  /** Days after today can be picked too, e.g. for what is planned. */
  allowFuture?: boolean;
  className?: string;
}) {
  const { t } = useLingui();
  const applied =
    from && to
      ? { from: dayjs(from).toDate(), to: dayjs(to).toDate() }
      : undefined;

  return (
    <DateRangePopover
      className={className}
      allowFuture={allowFuture}
      applyOnSelect
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
      presets={(close) =>
        rangePresets.map((preset) => {
          const range = preset.range();
          const isActive = Boolean(applied && sameDays(applied, range));
          return (
            <Button
              key={preset.label.id}
              type="button"
              variant="ghost"
              aria-pressed={isActive}
              className={cn(
                'h-7 w-full justify-start px-2 text-xs font-normal',
                // The grey of a picked range's ends
                isActive && 'bg-foreground/10 dark:bg-foreground/15'
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
      }
      actions={(close) => (
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
      )}
    />
  );
}
