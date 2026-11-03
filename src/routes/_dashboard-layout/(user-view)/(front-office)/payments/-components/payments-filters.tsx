import { Trans, useLingui } from '@lingui/react/macro';
import { XIcon } from 'lucide-react';
import { paymentStageSchema } from 'shared/types/payments';

import { DateRangeFilter } from '@/components/date-range-filter';
import { FoldedFilters } from '@/components/folded-filters';
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
    // Below `xl`: the search and a button for the other filters on one row,
    // the filters folded under it. From `xl` up: one wrapping line.
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        value={filters.query ?? ''}
        onChange={setQuery}
        placeholder={t`Search payments`}
        aria-label={t`Search reservation number, reference, last four card digits`}
        wrapperClassName="min-w-0 flex-1 xl:w-72 xl:flex-none"
        debounceMs={300}
      />
      <FoldedFilters
        breakpoint="xl"
        activeCount={[filters.status, filters.from].filter(Boolean).length}
      >
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
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon />
            <Trans>Clear filters</Trans>
          </Button>
        )}
      </FoldedFilters>
    </div>
  );
}
