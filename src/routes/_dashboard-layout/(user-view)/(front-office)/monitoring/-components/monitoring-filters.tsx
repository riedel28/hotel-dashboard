import { Trans, useLingui } from '@lingui/react/macro';
import { XIcon } from 'lucide-react';
import {
  type FetchMonitoringLogsResponse,
  monitoringStatusSchema,
  monitoringTypeSchema
} from 'shared/types/monitoring';

import { Button } from '@/components/ui/button';
import { CountBadge } from '@/components/ui/count-badge';
import {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter
} from '@/components/ui/data-grid-checkbox-filter';
import { DataGridRadioFilter } from '@/components/ui/data-grid-radio-filter';
import { SearchInput } from '@/components/ui/search-input';

import type { MonitoringSearch } from '../-hooks/use-monitoring-search';
import { StatusCell } from './cells/status-cell';
import { TypeCell } from './cells/type-cell';
import { MonitoringPeriodFilter } from './monitoring-period-filter';

const typeOptions = monitoringTypeSchema.options.map((value) => ({
  value,
  label: <TypeCell type={value} />
}));

/** How many logs an option of the status filter would show. */
function LogCount({ count }: { count: number | undefined }) {
  return count === undefined ? null : <CountBadge count={count} />;
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

  const statusOptions = monitoringStatusSchema.options.map((value) => ({
    value,
    label: <StatusCell status={value} />,
    suffix: <LogCount count={counts?.[value]} />
  }));

  return (
    // Phones: a two-column grid — the wide column for search and type, the
    // narrow one sized by status and period — with Clear filters underneath.
    // From `sm` up: one wrapping line.
    <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:flex-wrap sm:items-center">
      <SearchInput
        value={filters.query ?? ''}
        onChange={setQuery}
        placeholder={t`Search logs`}
        aria-label={t`Search event, message, reservation number`}
        className="text-sm"
        wrapperClassName="min-w-0 sm:w-auto sm:min-w-56 sm:flex-1 xl:w-72 xl:flex-none"
        debounceMs={300}
      />
      <DataGridRadioFilter
        label={<Trans>Status</Trans>}
        placeholder={
          <span className="flex items-center gap-1.5">
            <Trans>All logs</Trans>
            <LogCount count={counts?.all} />
          </span>
        }
        value={filters.status}
        onValueChange={setStatus}
        options={statusOptions}
        showFooter
        className="sm:w-[170px]"
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
