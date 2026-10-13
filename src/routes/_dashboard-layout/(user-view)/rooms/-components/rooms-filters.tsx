import { Trans, useLingui } from '@lingui/react/macro';
import { roomStatusSchema } from 'shared/types/rooms';

import { ClearFiltersButton } from '@/components/clear-filters-button';
import {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter
} from '@/components/ui/data-grid-checkbox-filter';
import { DataGridRadioFilter } from '@/components/ui/data-grid-radio-filter';
import { DataGridRefreshButton } from '@/components/ui/data-grid-refresh-button';
import { SearchInput } from '@/components/ui/search-input';

import type { RoomsSearch } from '../-hooks/use-rooms-search';
import { RoomStatusCell } from './rooms-table/-components/cells/room-status-cell';

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
    // The same row as on the reservations page: stacked on small screens,
    // one line with the refresh button at the far end on large ones
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:flex lg:items-center">
      <SearchInput
        value={filters.q ?? ''}
        onChange={(q) => setFilters({ q: q || undefined })}
        placeholder={t`Search rooms`}
        aria-label={t`Search number or name`}
        className="text-sm"
        wrapperClassName="w-full lg:w-[250px]"
        debounceMs={300}
      />
      <DataGridCheckboxFilter
        label={<Trans>Type</Trans>}
        placeholder={<Trans>All types</Trans>}
        className="w-full lg:w-[180px]"
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
          className="w-full lg:w-[180px]"
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
        className="w-full lg:w-[180px]"
      />
      <ClearFiltersButton
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />
      <DataGridRefreshButton
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        className="sm:ml-0 sm:w-full lg:ml-auto lg:w-auto"
      />
    </div>
  );
}
