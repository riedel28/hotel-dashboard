import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import dayjs from 'dayjs';
import { type DateRange } from 'react-day-picker';
import type { MonitoringPeriod } from 'shared/types/monitoring';

import {
  DateRangePopover,
  formatDateRange
} from '@/components/date-range-popover';
import { Button } from '@/components/ui/button';
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
  onPeriodChange: (period: MonitoringPeriod) => void;
  onRangeChange: (range: { from: Date; to: Date }) => void;
}

export function MonitoringPeriodFilter({
  period,
  from,
  to,
  onPeriodChange,
  onRangeChange
}: MonitoringPeriodFilterProps) {
  const { t } = useLingui();

  const activePreset = periodPresets.find((preset) => preset.value === period);
  const appliedRange: DateRange | undefined =
    from || to
      ? {
          from: from ? dayjs(from).toDate() : undefined,
          to: to ? dayjs(to).toDate() : undefined
        }
      : undefined;

  return (
    <DateRangePopover
      label={
        activePreset
          ? t(activePreset.label)
          : appliedRange && formatDateRange(appliedRange)
      }
      value={appliedRange}
      onApply={onRangeChange}
      applyLabel={<Trans>Apply custom range</Trans>}
      presets={(close) =>
        periodPresets.map((preset) => (
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
              close();
            }}
          >
            {t(preset.label)}
          </Button>
        ))
      }
    />
  );
}
