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

interface WallClockFieldProps {
  /** Goes on the date button, so a `<label htmlFor>` reaches it. */
  id: string;
  /** What the field is for, e.g. "Start"; names the time input. */
  label: string;
  /** YYYY-MM-DD, '' while not picked. */
  date: string;
  /** HH:mm, '' while not entered. */
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  invalid?: boolean;
  /** The date button, for a form to focus the field when it is invalid. */
  ref?: Ref<HTMLButtonElement>;
}

/**
 * The reservation form's date and time pair, holding a wall-clock date and
 * time as text: the event form reads them in the hotel's timezone, which a
 * `Date` would put in the browser's.
 */
export function WallClockField({
  id,
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  invalid,
  ref
}: WallClockFieldProps) {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);
  const day = date ? dayjs(date).toDate() : undefined;

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
              onDateChange(dayjs(picked).format('YYYY-MM-DD'));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <div className="w-28 shrink-0">
        <TimeInput
          aria-label={t`${label} time`}
          aria-invalid={invalid}
          value={time}
          onValueChange={onTimeChange}
        />
      </div>
    </div>
  );
}
