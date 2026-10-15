import { Trans, useLingui } from '@lingui/react/macro';
import dayjs from 'dayjs';
import { XIcon } from 'lucide-react';
import { paymentStageSchema } from 'shared/types/payments';

import {
  DateRangePopover,
  formatDateRange
} from '@/components/date-range-popover';
import { Button } from '@/components/ui/button';
import { DataGridSegmentedFilter } from '@/components/ui/data-grid-segmented-filter';
import { SearchInput } from '@/components/ui/search-input';

import type { PaymentsSearch } from '../-hooks/use-payments-search';
import { stageTones } from '../-lib/tones';
import { stageLabels } from './payment-fields';

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
          color: stageTones[stage].badge,
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
  const applied =
    from && to
      ? { from: dayjs(from).toDate(), to: dayjs(to).toDate() }
      : undefined;

  return (
    <DateRangePopover
      className="sm:w-56"
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
      actions={(close) =>
        applied && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onRangeChange(undefined);
              close();
            }}
          >
            <Trans>All dates</Trans>
          </Button>
        )
      }
    />
  );
}
