import { getRouteApi } from '@tanstack/react-router';
import {
  functionalUpdate,
  type PaginationState,
  type SortingState,
  type Updater
} from '@tanstack/react-table';

import {
  type DeviceFilters,
  type DeviceSort,
  deviceSortColumnSchema
} from '../-lib/devices';

const routeApi = getRouteApi('/_dashboard-layout/(user-view)/devices/');

/**
 * Everything the devices page keeps in the URL: the filters, the sorting, the
 * page and the device whose details are open, with the navigations that write
 * them.
 */
export function useDevicesSearch() {
  const {
    device: openDeviceId,
    page,
    per_page,
    sort_by,
    sort_order,
    ...filters
  } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize: per_page
  };
  // No column picked means the default order: unassigned devices first
  const sort: DeviceSort | undefined = sort_by && {
    by: sort_by,
    order: sort_order
  };
  const sorting: SortingState = sort
    ? [{ id: sort.by, desc: sort.order === 'desc' }]
    : [];

  return {
    filters,
    hasActiveFilters: Object.values(filters).some(Boolean),
    // Filters replace the history entry — typing a search is not a trail of
    // pages to go back through — and return to the first page
    setFilters: (next: DeviceFilters) =>
      navigate({
        search: (prev) => ({ ...prev, ...next, page: undefined }),
        replace: true
      }),
    // Sorting and page size are not filters and stay
    clearFilters: () =>
      navigate({
        search: (prev) => ({
          sort_by: prev.sort_by,
          sort_order: prev.sort_order,
          per_page: prev.per_page
        }),
        replace: true
      }),

    sort,
    sorting,
    onSortingChange: (updater: Updater<SortingState>) => {
      const [first] = functionalUpdate(updater, sorting);
      navigate({
        search: (prev) => ({
          ...prev,
          // Clearing the sort goes back to the default order
          sort_by: deviceSortColumnSchema
            .optional()
            .catch(undefined)
            .parse(first?.id),
          sort_order: first?.desc ? 'desc' : 'asc',
          page: undefined
        }),
        replace: true
      });
    },

    pagination,
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const next = functionalUpdate(updater, pagination);
      navigate({
        search: (prev) => ({
          ...prev,
          page: next.pageIndex + 1,
          per_page: next.pageSize
        }),
        replace: true
      });
    },

    // Opening and closing push history entries, so Back closes the drawer
    openDeviceId,
    openDevice: (deviceId: number) =>
      navigate({ search: (prev) => ({ ...prev, device: deviceId }) }),
    closeDevice: () =>
      navigate({ search: (prev) => ({ ...prev, device: undefined }) })
  };
}
