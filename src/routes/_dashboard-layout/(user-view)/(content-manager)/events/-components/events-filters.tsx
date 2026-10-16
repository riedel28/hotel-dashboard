import { Trans, useLingui } from '@lingui/react/macro';
import { eventCategorySchema, type EventPeriod } from 'shared/types/events';

import { ClearFiltersButton } from '@/components/clear-filters-button';
import { DateRangeFilter } from '@/components/date-range-filter';
import {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter
} from '@/components/ui/data-grid-checkbox-filter';
import { DataGridRefreshButton } from '@/components/ui/data-grid-refresh-button';
import { SearchInput } from '@/components/ui/search-input';
import { SegmentedControl } from '@/components/ui/segmented-control';

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
    // The same row as on the rooms page: stacked on small screens, one line
    // with the refresh button at the far end on large ones
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:flex xl:items-center">
      <SearchInput
        value={filters.q ?? ''}
        onChange={(q) => setFilters({ q: q || undefined })}
        placeholder={t`Search events`}
        aria-label={t`Search by title`}
        className="text-sm"
        wrapperClassName="w-full xl:w-[250px]"
        debounceMs={300}
      />
      <SegmentedControl<EventPeriod>
        label={t`Period`}
        value={filters.period}
        onValueChange={(period) => setFilters({ period })}
        className="w-full md:w-fit"
        options={[
          { value: 'upcoming', label: <Trans>Upcoming</Trans> },
          { value: 'past', label: <Trans>Past</Trans> },
          { value: 'all', label: <Trans>All</Trans> }
        ]}
      />
      <DataGridCheckboxFilter
        label={<Trans>Category</Trans>}
        placeholder={<Trans>All categories</Trans>}
        className="w-full xl:w-[180px]"
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
        variant="quick"
        className="w-full xl:w-[208px]"
      />
      {/* Below xl the two share the grid's last row; from xl they are
          items of the one line like the filters */}
      <div className="flex items-center gap-2 md:col-span-2 xl:contents">
        <ClearFiltersButton
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
        />
        <DataGridRefreshButton
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
}
