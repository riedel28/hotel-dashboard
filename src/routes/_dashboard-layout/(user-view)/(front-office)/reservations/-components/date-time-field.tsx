import { useLingui } from '@lingui/react/macro';
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

interface DateTimeFieldProps {
  /** Goes on the date button, so a `<label htmlFor>` reaches it. */
  id: string;
  /** What the field is for, e.g. "Arrival"; names the time input. */
  label: string;
  value: Date;
  onChange: (value: Date) => void;
  invalid?: boolean;
  /** The date button, for a form to focus the field when it is invalid. */
  ref?: Ref<HTMLButtonElement>;
}

/** A date (calendar popover) and a time side by side, editing one `Date`. */
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
          {dayjs(value).format('DD.MM.YYYY')}
        </PopoverTrigger>
        <PopoverContent
          className="w-auto min-w-(--anchor-width) p-0"
          align="start"
        >
          <Calendar
            autoFocus
            mode="single"
            appearance="field"
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
