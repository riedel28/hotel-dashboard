import { Trans, useLingui } from '@lingui/react/macro';
import { ListFilterIcon } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import {
  type FetchMonitoringLogsResponse,
  monitoringTypeSchema
} from 'shared/types/monitoring';

import { ClearFiltersButton } from '@/components/clear-filters-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CountBadge } from '@/components/ui/count-badge';
import {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter
} from '@/components/ui/data-grid-checkbox-filter';
import { DataGridSegmentedFilter } from '@/components/ui/data-grid-segmented-filter';
import { SearchInput } from '@/components/ui/search-input';
import { cn } from '@/lib/utils';

import {
  DEFAULT_PERIOD,
  type MonitoringSearch
} from '../-hooks/use-monitoring-search';
import { TypeCell } from './cells/type-cell';
import { MonitoringPeriodFilter } from './monitoring-period-filter';

const typeOptions = monitoringTypeSchema.options.map((value) => ({
  value,
  label: <TypeCell type={value} />
}));

/** A status segment: its name and how many logs it would show. */
function StatusLabel({
  label,
  count
}: {
  label: ReactNode;
  count: number | undefined;
}) {
  return (
    <span className="flex items-center gap-1.5">
      {label}
      {count !== undefined && <CountBadge count={count} />}
    </span>
  );
}

interface MonitoringFiltersProps extends Pick<
  MonitoringSearch,
  | 'filters'
  | 'hasActiveFilters'
  | 'setQuery'
  | 'setStatus'
  | 'setTypes'
  | 'setPeriod'
  | 'setRange'
  | 'clearFilters'
> {
  /** Per-status totals under every filter but status; absent while loading. */
  counts: FetchMonitoringLogsResponse['counts'] | undefined;
}

export function MonitoringFilters({
  filters,
  counts,
  hasActiveFilters,
  setQuery,
  setStatus,
  setTypes,
  setPeriod,
  setRange,
  clearFilters
}: MonitoringFiltersProps) {
  const { t } = useLingui();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersId = useId();
  // What the folded filters hold; the search shows for itself. A custom
  // range leaves no period, so it counts too.
  const activeFilterCount = [
    filters.status,
    filters.types.length,
    filters.period !== DEFAULT_PERIOD
  ].filter(Boolean).length;

  return (
    // Narrow screens: the search and a button for the other filters on one
    // row, the filters folded under it. From `xl` up: one row that never
    // wraps, the search and type filter narrowing to fit.
    <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
      <SearchInput
        value={filters.query ?? ''}
        onChange={setQuery}
        placeholder={t`Search logs`}
        aria-label={t`Search event, message, reservation number`}
        className="text-sm"
        wrapperClassName="min-w-0 flex-1 xl:max-w-72 xl:min-w-36"
        debounceMs={300}
      />
      <Button
        variant="outline"
        // Greyed while any of the folded filters is set
        className={cn(
          'xl:hidden',
          activeFilterCount > 0 && 'bg-muted dark:bg-input/50'
        )}
        aria-expanded={filtersOpen}
        aria-controls={filtersId}
        onClick={() => setFiltersOpen((open) => !open)}
      >
        <ListFilterIcon />
        <Trans>Filters</Trans>
        {/* The same count badge the filters show their picks with */}
        {activeFilterCount > 0 && (
          <Badge
            variant="secondary"
            color="gray"
            size="xs"
            className="tabular-nums"
          >
            {activeFilterCount}
          </Badge>
        )}
      </Button>
      <div
        id={filtersId}
        className={cn(
          'w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center xl:flex xl:w-auto xl:min-w-0 xl:flex-[3] xl:flex-nowrap',
          filtersOpen ? 'flex' : 'hidden'
        )}
      >
        <DataGridSegmentedFilter
          label={t`Status`}
          value={filters.status}
          onValueChange={setStatus}
          // The status shows as a dot; the selected segment is not tinted
          tintSelected={false}
          className="w-full sm:w-fit"
          allLabel={
            <StatusLabel label={<Trans>All</Trans>} count={counts?.all} />
          }
          options={[
            {
              value: 'success',
              color: 'emerald',
              label: (
                <StatusLabel
                  label={<Trans>OK</Trans>}
                  count={counts?.success}
                />
              )
            },
            {
              value: 'error',
              color: 'rose',
              label: (
                <StatusLabel
                  label={<Trans>Error</Trans>}
                  count={counts?.error}
                />
              )
            }
          ]}
        />
        <DataGridCheckboxFilter
          label={<Trans>Type</Trans>}
          placeholder={<Trans>All types</Trans>}
          options={typeOptions}
          value={filters.types}
          onValueChange={setTypes}
          className="min-w-0 sm:w-[200px] xl:w-auto xl:max-w-[200px] xl:min-w-32 xl:flex-1"
        >
          <DataGridCheckboxFilterFooter>
            <DataGridCheckboxFilterClear>
              <Trans>Reset</Trans>
            </DataGridCheckboxFilterClear>
          </DataGridCheckboxFilterFooter>
        </DataGridCheckboxFilter>
        <MonitoringPeriodFilter
          period={filters.period}
          from={filters.from}
          to={filters.to}
          onPeriodChange={setPeriod}
          onRangeChange={setRange}
        />
        {/* Its kept place only matters on the one-row bar */}
        <div className={cn('shrink-0', !hasActiveFilters && 'max-xl:hidden')}>
          <ClearFiltersButton
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        </div>
      </div>
    </div>
  );
}
