import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { type DateRange } from 'react-day-picker';
import type { MonitoringPeriod } from 'shared/types/monitoring';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const periodPresets = [
  { value: '1h', label: msg`Last hour` },
  { value: '24h', label: msg`Last 24 hours` },
  { value: '7d', label: msg`Last 7 days` },
  { value: '30d', label: msg`Last 30 days` }
] as const satisfies ReadonlyArray<{
  value: MonitoringPeriod;
  label: MessageDescriptor;
}>;

interface MonitoringPeriodFilterProps {
  /** The active preset; undefined while a custom range is shown. */
  period?: MonitoringPeriod;
  from?: string;
  to?: string;
  className?: string;
  onPeriodChange: (period: MonitoringPeriod) => void;
  onRangeChange: (range: { from: Date; to: Date }) => void;
}

export function MonitoringPeriodFilter({
  period,
  from,
  to,
  className,
  onPeriodChange,
  onRangeChange
}: MonitoringPeriodFilterProps) {
  const { t } = useLingui();
  const [isOpen, setIsOpen] = useState(false);
  // The range being picked; committed to the URL only on Apply
  const [draft, setDraft] = useState<DateRange | undefined>();

  const activePreset = periodPresets.find((preset) => preset.value === period);
  const appliedRange: DateRange | undefined =
    from || to
      ? {
          from: from ? dayjs(from).toDate() : undefined,
          to: to ? dayjs(to).toDate() : undefined
        }
      : undefined;
  const selected = draft ?? appliedRange;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    setDraft(undefined);
  };

  const formatRange = (range: DateRange) =>
    [range.from, range.to]
      .filter((date) => date !== undefined)
      .map((date) => dayjs(date).format('DD.MM.YYYY'))
      .join(' - ');

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className={cn(
          'inline-flex h-9 min-w-fit items-center justify-start gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal whitespace-nowrap dark:border-input dark:bg-input/30',
          className
        )}
      >
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        {activePreset
          ? t(activePreset.label)
          : appliedRange && formatRange(appliedRange)}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex max-sm:flex-col">
          <div className="flex flex-col gap-0.5 border-border p-1 max-sm:order-1 max-sm:border-t sm:w-36 sm:border-e">
            {periodPresets.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                variant="ghost"
                aria-pressed={preset.value === period}
                className={cn(
                  'h-7 w-full justify-start px-2 text-xs font-normal',
                  preset.value === period && 'bg-accent'
                )}
                onClick={() => {
                  onPeriodChange(preset.value);
                  handleOpenChange(false);
                }}
              >
                {t(preset.label)}
              </Button>
            ))}
          </div>
          <Calendar
            mode="range"
            // Future days are disabled, so end the two-month view on today
            defaultMonth={
              selected?.from ?? dayjs().subtract(1, 'month').toDate()
            }
            showOutsideDays={false}
            selected={selected}
            onSelect={setDraft}
            disabled={{ after: new Date() }}
            numberOfMonths={2}
          />
        </div>
        <div className="flex items-center justify-end border-t border-border p-1.5">
          <Button
            size="sm"
            disabled={!draft?.from || !draft.to}
            onClick={() => {
              if (draft?.from && draft.to) {
                onRangeChange({ from: draft.from, to: draft.to });
              }
              handleOpenChange(false);
            }}
          >
            <Trans>Apply custom range</Trans>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
