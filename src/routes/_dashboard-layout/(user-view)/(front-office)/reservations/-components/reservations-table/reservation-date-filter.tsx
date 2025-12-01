'use client';

import { useState } from 'react';

import { Trans } from '@lingui/react/macro';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';

interface ReservationDateFilterProps {
  from?: Date;
  to?: Date;
  className?: string;
  onDateChange?: (dateRange: { from?: Date; to?: Date } | undefined) => void;
}

function ReservationDateFilter({
  from,
  to,
  className = '',
  onDateChange
}: ReservationDateFilterProps) {
  const today = new Date();

  // Define preset ranges
  const presets = [
    { label: 'Today', range: { from: today, to: today } },
    {
      label: 'Yesterday',
      range: { from: dayjs().subtract(1, 'day').toDate(), to: dayjs().subtract(1, 'day').toDate() }
    },
    { label: 'Last 7 days', range: { from: dayjs().subtract(6, 'day').toDate(), to: today } },
    { label: 'Last 30 days', range: { from: dayjs().subtract(29, 'day').toDate(), to: today } },
    { label: 'Month to date', range: { from: dayjs().startOf('month').toDate(), to: today } },
    {
      label: 'Last month',
      range: {
        from: dayjs().subtract(1, 'month').startOf('month').toDate(),
        to: dayjs().subtract(1, 'month').endOf('month').toDate()
      }
    },
    { label: 'Year to date', range: { from: dayjs().startOf('year').toDate(), to: today } },
    {
      label: 'Last year',
      range: {
        from: dayjs().subtract(1, 'year').startOf('year').toDate(),
        to: dayjs().subtract(1, 'year').endOf('year').toDate()
      }
    }
  ];

  const defaultDate: DateRange = {
    from: undefined,
    to: undefined
  };

  const initialDate: DateRange | undefined =
    from || to
      ? {
          from: from || undefined,
          to: to || undefined
        }
      : defaultDate;

  const [date, setDate] = useState<DateRange | undefined>(initialDate);
  const [month, setMonth] = useState(today);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Derive current date from props (URL parameters)
  const currentDateFromUrl: DateRange | undefined =
    from || to
      ? {
          from: from || undefined,
          to: to || undefined
        }
      : defaultDate;

  // Use URL-derived date if it's different from local state
  const displayDate =
    date?.from?.getTime() === currentDateFromUrl?.from?.getTime() &&
    date?.to?.getTime() === currentDateFromUrl?.to?.getTime()
      ? date
      : currentDateFromUrl;

  const handleApply = () => {
    if (date) {
      setDate(date);
      onDateChange?.(date);
    }
    setIsPopoverOpen(false);
  };

  const handleReset = () => {
    setDate(defaultDate);
    onDateChange?.(defaultDate);
    setIsPopoverOpen(false);
  };

  const handleSelect = (selected: DateRange | undefined) => {
    const newDate = {
      from: selected?.from || undefined,
      to: selected?.to || undefined
    };
    setDate(newDate);
    setSelectedPreset(null); // Clear preset when manually selecting a range

    // Only call onDateChange if both dates are selected (complete range)
    if (newDate.from && newDate.to) {
      onDateChange?.(newDate);
    }
  };

  const handlePresetSelect = (preset: (typeof presets)[0]) => {
    setDate(preset.range);
    setMonth(preset.range.from || today);
    setSelectedPreset(preset.label);
    onDateChange?.(preset.range);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          mode="input"
          placeholder={!displayDate?.from && !displayDate?.to}
          className={cn('shadow-xs', className)}
        >
          <CalendarIcon />
          {displayDate?.from ? (
            displayDate.to ? (
              <>
                {dayjs(displayDate.from).format('DD.MM.YYYY')}
                {' - '}
                {dayjs(displayDate.to).format('DD.MM.YYYY')}
              </>
            ) : (
              dayjs(displayDate.to).format('DD.MM.YYYY')
            )
          ) : (
            <span>
              <Trans>Pick a date range</Trans>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <div className="flex max-sm:flex-col">
          <div className="relative border-border max-sm:order-1 max-sm:border-t sm:w-36">
            <div className="h-full border-border py-2 sm:border-e">
              <div className="flex flex-col gap-[2px] px-2">
                {presets.map((preset, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    className={cn(
                      'h-8 w-full justify-start',
                      selectedPreset === preset.label && 'bg-accent'
                    )}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <Calendar
            autoFocus
            mode="range"
            month={month}
            onMonthChange={setMonth}
            showOutsideDays={false}
            selected={displayDate}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </div>
        <div className="flex items-center justify-end gap-1.5 border-t border-border p-3">
          <Button variant="outline" onClick={handleReset}>
            <Trans>Reset</Trans>
          </Button>
          <Button onClick={handleApply}>
            <Trans>Apply</Trans>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { ReservationDateFilter };
