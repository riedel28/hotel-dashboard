import { Trans, useLingui } from '@lingui/react/macro';
import { XIcon } from 'lucide-react';
import { paymentStageSchema } from 'shared/types/payments';

import { DateRangeFilter } from '@/components/date-range-filter';
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
        className="sm:w-56"
      />
      {hasActiveFilters && (
        <Button
          variant="secondary"
          onClick={clearFilters}
          className="col-span-2 text-muted-foreground hover:text-foreground"
        >
          <XIcon />
          <Trans>Clear filters</Trans>
        </Button>
      )}
    </div>
  );
}
