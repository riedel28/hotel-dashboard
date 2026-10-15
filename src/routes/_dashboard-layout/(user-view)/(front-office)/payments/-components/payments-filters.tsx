import { Trans, useLingui } from '@lingui/react/macro';
import dayjs from 'dayjs';
import { CalendarIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { type DateRange } from 'react-day-picker';
import { paymentStageSchema } from 'shared/types/payments';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DataGridSegmentedFilter } from '@/components/ui/data-grid-segmented-filter';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { SearchInput } from '@/components/ui/search-input';

import type { usePaymentsSearch } from '../-hooks/use-payments-search';
import { stageColors, stageLabels } from './payment-parts';

type PaymentsSearch = ReturnType<typeof usePaymentsSearch>;

type PaymentsFiltersProps = Pick<
  PaymentsSearch,
  | 'filters'
  | 'hasActiveFilters'
  | 'setQuery'
  | 'setStatus'
  | 'setRange'
  | 'clearFilters'
>;

export function PaymentsFilters({
  filters,
  hasActiveFilters,
  setQuery,
  setStatus,
  setRange,
  clearFilters
}: PaymentsFiltersProps) {
  const { t } = useLingui();

  return (
    // Phones: search and status each take a full row, the dates the next one.
    // From `sm` up: one wrapping line.
    <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:flex-wrap sm:items-center">
      <SearchInput
        value={filters.query ?? ''}
        onChange={setQuery}
        placeholder={t`Search payments`}
        aria-label={t`Search reservation number, reference, last four card digits`}
        className="text-sm"
        wrapperClassName="col-span-2 min-w-0 sm:w-auto sm:min-w-56 sm:flex-1 xl:w-72 xl:flex-none"
        debounceMs={300}
      />
      <DataGridSegmentedFilter
        label={t`Status`}
        value={filters.status}
        onValueChange={setStatus}
        tintSelected={false}
        className="col-span-2 w-full sm:w-fit"
        options={paymentStageSchema.options.map((stage) => ({
          value: stage,
          color: stageColors[stage],
          label: t(stageLabels[stage])
        }))}
      />
      <DateRangeFilter
        from={filters.from}
        to={filters.to}
        onRangeChange={setRange}
      />
      {hasActiveFilters && (
        <Button
          variant="secondary"
          onClick={clearFilters}
          className="col-span-2 text-muted-foreground hover:text-foreground"
        >
          <XIcon className="mr-2 h-4 w-4" />
          <Trans>Clear filters</Trans>
        </Button>
      )}
    </div>
  );
}

/** Days of the payments' latest stage; any range up to today. */
function DateRangeFilter({
  from,
  to,
  onRangeChange
}: {
  from?: string;
  to?: string;
  onRangeChange: (range: { from: Date; to: Date } | undefined) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // The range being picked; committed to the URL only on Apply
  const [draft, setDraft] = useState<DateRange | undefined>();

  const applied: DateRange | undefined =
    from && to
      ? { from: dayjs(from).toDate(), to: dayjs(to).toDate() }
      : undefined;
  const selected = draft ?? applied;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    setDraft(undefined);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger className="inline-flex h-9 min-w-fit items-center justify-start gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal whitespace-nowrap sm:w-56 dark:border-input dark:bg-input/30">
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        {applied ? (
          `${dayjs(applied.from).format('DD.MM.YYYY')} - ${dayjs(applied.to).format('DD.MM.YYYY')}`
        ) : (
          <span className="text-muted-foreground">
            <Trans>All dates</Trans>
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          // Future days are disabled, so end the two-month view on today
          defaultMonth={selected?.from ?? dayjs().subtract(1, 'month').toDate()}
          showOutsideDays={false}
          selected={selected}
          onSelect={setDraft}
          disabled={{ after: new Date() }}
          numberOfMonths={2}
        />
        <div className="flex items-center justify-end gap-1.5 border-t border-border p-1.5">
          {applied && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onRangeChange(undefined);
                handleOpenChange(false);
              }}
            >
              <Trans>All dates</Trans>
            </Button>
          )}
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
            <Trans>Apply</Trans>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
