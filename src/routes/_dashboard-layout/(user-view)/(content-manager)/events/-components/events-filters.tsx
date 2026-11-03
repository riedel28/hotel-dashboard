import { Trans, useLingui } from '@lingui/react/macro';
import { eventCategorySchema, type EventPeriod } from 'shared/types/events';

import { ClearFiltersButton } from '@/components/clear-filters-button';
import { DateRangeFilter } from '@/components/date-range-filter';
import { FoldedFilters } from '@/components/folded-filters';
import {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter
} from '@/components/ui/data-grid-checkbox-filter';
import { DataGridRefreshButton } from '@/components/ui/data-grid-refresh-button';
import { SearchInput } from '@/components/ui/search-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { cn } from '@/lib/utils';

import type { EventsSearch } from '../-hooks/use-events-search';
import { eventCategoryLabels } from '../-lib/event-categories';

interface EventsFiltersProps extends Pick<
  EventsSearch,
  | 'filters'
  | 'hasActiveFilters'
  | 'setFilters'
  | 'clearFilters'
  | 'setDateRange'
> {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function EventsFilters({
  filters,
  hasActiveFilters,
  setFilters,
  clearFilters,
  setDateRange,
  isRefreshing,
  onRefresh
}: EventsFiltersProps) {
  const { t } = useLingui();

  return (
    // The same bar as on the rooms page: below `xl` the filters fold under a
    // button beside the search, from `xl` up they are one line
    <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
      <SearchInput
        value={filters.q ?? ''}
        onChange={(q) => setFilters({ q: q || undefined })}
        placeholder={t`Search events`}
        aria-label={t`Search by title`}
        wrapperClassName="min-w-0 flex-1 xl:w-[250px] xl:flex-none"
        debounceMs={300}
      />
      <FoldedFilters
        breakpoint="xl"
        activeCount={
          [
            filters.period !== 'upcoming',
            filters.category?.length,
            filters.from
          ].filter(Boolean).length
        }
      >
        <SegmentedControl<EventPeriod>
          label={t`Period`}
          value={filters.period}
          onValueChange={(period) => setFilters({ period })}
          className="w-full sm:w-fit"
          options={[
            { value: 'upcoming', label: <Trans>Upcoming</Trans> },
            { value: 'past', label: <Trans>Past</Trans> },
            { value: 'all', label: <Trans>All</Trans> }
          ]}
        />
        <DataGridCheckboxFilter
          label={<Trans>Category</Trans>}
          placeholder={<Trans>All categories</Trans>}
          className="sm:w-[180px]"
          value={filters.category ?? []}
          onValueChange={(category) =>
            setFilters({ category: category.length ? category : undefined })
          }
          options={eventCategorySchema.options.map((category) => ({
            value: category,
            label: t(eventCategoryLabels[category])
          }))}
        >
          <DataGridCheckboxFilterFooter>
            <DataGridCheckboxFilterClear />
          </DataGridCheckboxFilterFooter>
        </DataGridCheckboxFilter>
        <DateRangeFilter
          from={filters.from}
          to={filters.to}
          onRangeChange={setDateRange}
          allowFuture
          className="sm:w-[208px]"
        />
        {/* Its kept place only matters on the one-line bar */}
        <div className={cn('shrink-0', !hasActiveFilters && 'max-xl:hidden')}>
          <ClearFiltersButton
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        </div>
      </FoldedFilters>
      <DataGridRefreshButton
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />
    </div>
  );
}
