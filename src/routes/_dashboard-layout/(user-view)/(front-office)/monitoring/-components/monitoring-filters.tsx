import { Trans, useLingui } from '@lingui/react/macro';
import { XIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  type FetchMonitoringLogsResponse,
  monitoringTypeSchema
} from 'shared/types/monitoring';

import { Button } from '@/components/ui/button';
import { CountBadge } from '@/components/ui/count-badge';
import {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter
} from '@/components/ui/data-grid-checkbox-filter';
import { DataGridSegmentedFilter } from '@/components/ui/data-grid-segmented-filter';
import { SearchInput } from '@/components/ui/search-input';

import type { MonitoringSearch } from '../-hooks/use-monitoring-search';
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

  return (
    // Phones: search and status each take a full row, type and period share
    // the next one, Clear filters goes underneath. From `sm` up: one wrapping
    // line.
    <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:flex-wrap sm:items-center">
      <SearchInput
        value={filters.query ?? ''}
        onChange={setQuery}
        placeholder={t`Search logs`}
        aria-label={t`Search event, message, reservation number`}
        className="text-sm"
        wrapperClassName="col-span-2 min-w-0 sm:w-auto sm:min-w-56 sm:flex-1 xl:w-72 xl:flex-none"
        debounceMs={300}
      />
      <DataGridSegmentedFilter
        label={t`Status`}
        value={filters.status}
        onValueChange={setStatus}
        // The status shows as a dot; the selected segment is not tinted
        tintSelected={false}
        className="col-span-2 w-full sm:w-fit"
        allLabel={
          <StatusLabel label={<Trans>All</Trans>} count={counts?.all} />
        }
        options={[
          {
            value: 'success',
            color: 'emerald',
            label: (
              <StatusLabel label={<Trans>OK</Trans>} count={counts?.success} />
            )
          },
          {
            value: 'error',
            color: 'rose',
            label: (
              <StatusLabel label={<Trans>Error</Trans>} count={counts?.error} />
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
        className="min-w-0 sm:w-[200px]"
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
