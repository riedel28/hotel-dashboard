import { Trans, useLingui } from '@lingui/react/macro';
import { XIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { deviceConnectionStatusSchema } from 'shared/types/devices';

import { FoldedFilters } from '@/components/folded-filters';
import { Button } from '@/components/ui/button';
import { CountBadge } from '@/components/ui/count-badge';
import { DataGridRadioFilter } from '@/components/ui/data-grid-radio-filter';
import { DataGridSegmentedFilter } from '@/components/ui/data-grid-segmented-filter';
import { SearchInput } from '@/components/ui/search-input';

import type { DevicesSearch } from '../-hooks/use-devices-search';
import type { DeviceView } from '../-lib/devices';
import { ConnectionStatusLabel } from './connection-status';

const statusOptions = deviceConnectionStatusSchema.options.map((value) => ({
  value,
  label: <ConnectionStatusLabel status={value} />
}));

function TabLabel({
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

interface DevicesFiltersProps extends Pick<
  DevicesSearch,
  'filters' | 'hasActiveFilters' | 'setFilters' | 'clearFilters'
> {
  /** Every device of the property: the tabs count them, whatever is filtered.
   *  Undefined while they load, when the tabs show no counts yet. */
  devices: DeviceView[] | undefined;
}

export function DevicesFilters({
  devices,
  filters,
  hasActiveFilters,
  setFilters,
  clearFilters
}: DevicesFiltersProps) {
  const { t } = useLingui();
  const unassignedCount = devices?.filter((device) => !device.room).length;

  return (
    // Below `xl` the filters fold under a button beside the search
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        value={filters.q ?? ''}
        onChange={(q) => setFilters({ q: q || undefined })}
        placeholder={t`Search devices`}
        aria-label={t`Search name, serial number, room`}
        wrapperClassName="min-w-0 flex-1 xl:w-72 xl:flex-none"
        debounceMs={200}
      />
      <FoldedFilters
        breakpoint="xl"
        activeCount={[filters.tab, filters.status].filter(Boolean).length}
      >
        <DataGridSegmentedFilter
          label={t`Room assignment`}
          value={filters.tab}
          onValueChange={(tab) => setFilters({ tab })}
          allLabel={
            <TabLabel label={<Trans>All</Trans>} count={devices?.length} />
          }
          options={[
            {
              value: 'assigned',
              label: (
                <TabLabel
                  label={<Trans>Assigned</Trans>}
                  count={
                    devices && unassignedCount !== undefined
                      ? devices.length - unassignedCount
                      : undefined
                  }
                />
              )
            },
            {
              value: 'unassigned',
              label: (
                <TabLabel
                  label={<Trans>Unassigned</Trans>}
                  count={unassignedCount}
                />
              )
            }
          ]}
          className="w-full sm:w-fit"
        />
        <DataGridRadioFilter
          label={<Trans>Status</Trans>}
          placeholder={<Trans>All statuses</Trans>}
          value={filters.status}
          onValueChange={(status) => setFilters({ status })}
          options={statusOptions}
          showFooter
          className="sm:w-[190px]"
        />
        {hasActiveFilters && (
          <Button
            variant="secondary"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon aria-hidden="true" />
            <Trans>Clear filters</Trans>
          </Button>
        )}
      </FoldedFilters>
    </div>
  );
}
