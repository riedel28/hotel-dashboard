import { Trans, useLingui } from '@lingui/react/macro';
import { roomStatusSchema } from 'shared/types/rooms';

import { ClearFiltersButton } from '@/components/clear-filters-button';
import { FoldedFilters } from '@/components/folded-filters';
import {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter
} from '@/components/ui/data-grid-checkbox-filter';
import { DataGridRadioFilter } from '@/components/ui/data-grid-radio-filter';
import { DataGridRefreshButton } from '@/components/ui/data-grid-refresh-button';
import { SearchInput } from '@/components/ui/search-input';
import { cn } from '@/lib/utils';

import type { RoomsSearch } from '../-hooks/use-rooms-search';
import { RoomStatusCell } from './room-status';

const statusOptions = roomStatusSchema.options.map((status) => ({
  value: status,
  label: <RoomStatusCell status={status} />
}));

interface RoomsFiltersProps extends Pick<
  RoomsSearch,
  'filters' | 'hasActiveFilters' | 'setFilters' | 'clearFilters'
> {
  /** The types and floors the property's rooms use */
  roomTypes: string[];
  floors: number[];
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function RoomsFilters({
  filters,
  hasActiveFilters,
  setFilters,
  clearFilters,
  roomTypes,
  floors,
  isRefreshing,
  onRefresh
}: RoomsFiltersProps) {
  const { t } = useLingui();

  return (
    // Below `xl`: the search, a button for the other filters and the refresh
    // button on one row, the filters folded under it. From `xl` up: one line
    // with the refresh button at the far end.
    <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
      <SearchInput
        value={filters.q ?? ''}
        onChange={(q) => setFilters({ q: q || undefined })}
        placeholder={t`Search rooms`}
        aria-label={t`Search number or name`}
        wrapperClassName="min-w-0 flex-1 xl:w-72 xl:flex-none"
        debounceMs={300}
      />
      <FoldedFilters
        breakpoint="xl"
        activeCount={
          [
            filters.room_type?.length,
            filters.floor?.length,
            filters.status
          ].filter(Boolean).length
        }
      >
        <DataGridCheckboxFilter
          label={<Trans>Type</Trans>}
          placeholder={<Trans>All types</Trans>}
          className="sm:w-[180px]"
          value={filters.room_type ?? []}
          onValueChange={(room_type) =>
            setFilters({ room_type: room_type.length ? room_type : undefined })
          }
          options={[
            ...roomTypes.map((type) => ({ value: type, label: type })),
            // '' is how the API spells "rooms without a type"
            { value: '', label: <Trans>No type</Trans> }
          ]}
        >
          <DataGridCheckboxFilterFooter>
            <DataGridCheckboxFilterClear />
          </DataGridCheckboxFilterFooter>
        </DataGridCheckboxFilter>
        {floors.length > 0 && (
          <DataGridCheckboxFilter
            label={<Trans>Floor</Trans>}
            placeholder={<Trans>All floors</Trans>}
            className="sm:w-[180px]"
            value={(filters.floor ?? []).map(String)}
            onValueChange={(floor) =>
              setFilters({
                floor: floor.length ? floor.map(Number) : undefined
              })
            }
            options={floors.map((floor) => ({
              value: String(floor),
              label: String(floor)
            }))}
          >
            <DataGridCheckboxFilterFooter>
              <DataGridCheckboxFilterClear />
            </DataGridCheckboxFilterFooter>
          </DataGridCheckboxFilter>
        )}
        <DataGridRadioFilter
          label={<Trans>Status</Trans>}
          placeholder={<Trans>All statuses</Trans>}
          value={filters.status}
          onValueChange={(status) => setFilters({ status })}
          options={statusOptions}
          showFooter
          className="sm:w-[180px]"
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
