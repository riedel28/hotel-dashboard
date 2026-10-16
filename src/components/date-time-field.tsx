import { Trans, useLingui } from '@lingui/react/macro';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { type Ref, useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import { fieldTriggerClassName } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { TimeInput } from '@/components/ui/time-input';
import { cn } from '@/lib/utils';

/**
 * A date and a time of day as a clock on the wall shows them, in no
 * timezone of their own: YYYY-MM-DD and HH:mm, each '' while not entered.
 */
export interface WallClock {
  date: string;
  time: string;
}

/** A moment as the browser's clock shows it. */
export const wallClockOf = (moment: Date): WallClock => ({
  date: dayjs(moment).format('YYYY-MM-DD'),
  time: dayjs(moment).format('HH:mm')
});

/** A complete wall clock as a moment of the browser's timezone. */
export const dateOf = ({ date, time }: WallClock) =>
  dayjs(`${date}T${time}`).toDate();

interface DateTimeFieldProps {
  /** Goes on the date button, so a `<label htmlFor>` reaches it. */
  id: string;
  /** What the field is for, e.g. "Arrival"; names the time input. */
  label: string;
  value: WallClock;
  onChange: (value: WallClock) => void;
  invalid?: boolean;
  /** The date button, for a form to focus the field when it is invalid. */
  ref?: Ref<HTMLButtonElement>;
}

/** A date (calendar popover) and a time side by side. */
export function DateTimeField({
  id,
  label,
  value,
  onChange,
  invalid,
  ref
}: DateTimeFieldProps) {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);
  const day = value.date ? dayjs(value.date).toDate() : undefined;

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          ref={ref}
          id={id}
          type="button"
          aria-invalid={invalid}
          className={cn(fieldTriggerClassName, 'flex-1 justify-start')}
        >
          <CalendarIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {day ? (
            dayjs(day).format('DD.MM.YYYY')
          ) : (
            <span className="text-muted-foreground">
              <Trans>Pick a date</Trans>
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent
          className="w-auto min-w-(--anchor-width) p-0"
          align="start"
        >
          <Calendar
            autoFocus
            mode="single"
            appearance="field"
            defaultMonth={day}
            selected={day}
            onSelect={(picked) => {
              if (!picked) return;
              onChange({ ...value, date: dayjs(picked).format('YYYY-MM-DD') });
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <div className="w-28 shrink-0">
        <TimeInput
          aria-label={t`${label} time`}
          aria-invalid={invalid}
          value={value.time}
          onValueChange={(time) => onChange({ ...value, time })}
        />
      </div>
    </div>
  );
}
