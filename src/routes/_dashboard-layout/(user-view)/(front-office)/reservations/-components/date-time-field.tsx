import { useLingui } from '@lingui/react/macro';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { TimeInput } from '@/components/ui/time-input';

interface DateTimeFieldProps {
  /** Goes on the date button, so a `<label htmlFor>` reaches it. */
  id: string;
  /** What the field is for, e.g. "Arrival"; names the time input. */
  label: string;
  value: Date;
  onChange: (value: Date) => void;
  invalid?: boolean;
}

/** A date (calendar popover) and a time side by side, editing one `Date`. */
export function DateTimeField({
  id,
  label,
  value,
  onChange,
  invalid
}: DateTimeFieldProps) {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          type="button"
          aria-invalid={invalid}
          className="inline-flex h-9 min-w-0 flex-1 items-center justify-start gap-2 rounded-lg border border-input px-3 py-2 text-sm font-normal whitespace-nowrap hover:text-accent-foreground aria-invalid:border-danger data-popup-open:bg-accent dark:border-input dark:bg-input/30"
        >
          <CalendarIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {dayjs(value).format('DD.MM.YYYY')}
        </PopoverTrigger>
        <PopoverContent
          className="w-auto min-w-(--anchor-width) p-0"
          align="start"
        >
          <Calendar
            autoFocus
            mode="single"
            // Stretches with the popup, and marks the selected day in grey
            // rather than the primary colour.
            className="w-full"
            classNames={{
              month_grid: 'w-full',
              weekday: 'h-8 p-0 text-xs font-medium text-muted-foreground/80',
              day: 'group h-8 px-0 py-px text-sm',
              day_button:
                'relative mx-auto flex size-8 cursor-pointer items-center justify-center rounded-md p-0 text-foreground outline-none group-data-disabled:pointer-events-none group-data-disabled:text-foreground/30 group-data-outside:text-foreground/30 group-data-selected:bg-foreground/10 group-data-selected:font-medium hover:bg-accent focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50'
            }}
            defaultMonth={value}
            selected={value}
            onSelect={(day) => {
              if (!day) return;
              // The calendar hands back midnight; keep the time of day.
              const current = dayjs(value);
              onChange(
                dayjs(day)
                  .hour(current.hour())
                  .minute(current.minute())
                  .toDate()
              );
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <div className="w-28 shrink-0">
        <TimeInput
          aria-label={t`${label} time`}
          aria-invalid={invalid}
          value={dayjs(value).format('HH:mm')}
          onValueChange={(time) => {
            const [hours = 0, minutes = 0] = time.split(':').map(Number);
            onChange(
              dayjs(value)
                .hour(hours)
                .minute(minutes)
                .second(0)
                .millisecond(0)
                .toDate()
            );
          }}
        />
      </div>
    </div>
  );
}

/** Nights between two moments, by calendar date rather than 24-hour spans. */
export function countNights(from: Date, to: Date) {
  // Rounded: a day is 23 or 25 hours long across a DST change.
  return Math.round(
    dayjs(to).startOf('day').diff(dayjs(from).startOf('day'), 'day', true)
  );
}
