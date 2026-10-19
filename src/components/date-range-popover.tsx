import dayjs from 'dayjs';
import { CalendarIcon, ChevronDownIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { type DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface DateRangePopoverProps {
  /** What the trigger shows: the active preset, the range or a placeholder. */
  label: ReactNode;
  /** The applied range, selected when the calendar opens. */
  value: DateRange | undefined;
  onApply: (range: { from: Date; to: Date }) => void;
  applyLabel: ReactNode;
  /** Quick picks beside the calendar; they call `close` once picked. */
  presets?: (close: () => void) => ReactNode;
  /** More footer buttons, left of Apply; they call `close` once done. */
  actions?: (close: () => void) => ReactNode;
  /** Days after today can be picked too, e.g. for what is planned. */
  allowFuture?: boolean;
  /** A complete range applies as soon as it is picked, without Apply. */
  applyOnSelect?: boolean;
  className?: string;
}

/**
 * A filter button opening a two-month calendar to pick a range of days, past
 * ones unless `allowFuture`. The range is committed on Apply, or as soon as
 * both ends are picked with `applyOnSelect`.
 */
export function DateRangePopover({
  label,
  value,
  onApply,
  applyLabel,
  presets,
  actions,
  allowFuture = false,
  applyOnSelect = false,
  className
}: DateRangePopoverProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();
  const selected = draft ?? value;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    setDraft(undefined);
  };
  const close = () => handleOpenChange(false);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className={cn(
          'inline-flex h-9 min-w-fit items-center justify-start gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal whitespace-nowrap dark:border-input dark:bg-input/30',
          className
        )}
      >
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        {label}
        <ChevronDownIcon className="ms-auto size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex max-sm:flex-col">
          {presets && (
            <div className="flex flex-col gap-0.5 border-border p-1 max-sm:order-1 max-sm:border-t sm:w-36 sm:border-e">
              {presets(close)}
            </div>
          )}
          <Calendar
            mode="range"
            // Without future days, the view ends on today
            defaultMonth={
              selected?.from ??
              (allowFuture ? new Date() : dayjs().subtract(1, 'month').toDate())
            }
            showOutsideDays={false}
            selected={selected}
            onSelect={(range) => {
              setDraft(range);
              if (applyOnSelect && range?.from && range.to) {
                onApply({ from: range.from, to: range.to });
              }
            }}
            disabled={allowFuture ? undefined : { after: new Date() }}
            numberOfMonths={isMobile ? 1 : 2}
          />
        </div>
        <div className="flex items-center justify-end gap-1.5 border-t border-border p-1.5">
          {actions?.(close)}
          <Button
            size="sm"
            disabled={!draft?.from || !draft.to}
            onClick={() => {
              if (draft?.from && draft.to) {
                onApply({ from: draft.from, to: draft.to });
              }
              close();
            }}
          >
            {applyLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** A range as the trigger shows it: "01.10.2026 - 12.10.2026". */
export function formatDateRange(range: DateRange) {
  return [range.from, range.to]
    .filter((date) => date !== undefined)
    .map((date) => dayjs(date).format('DD.MM.YYYY'))
    .join(' - ');
}
