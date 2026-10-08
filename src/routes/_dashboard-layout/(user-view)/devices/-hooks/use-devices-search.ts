import { getRouteApi } from '@tanstack/react-router';
import { useMemo } from 'react';

import type { DeviceFilters, DeviceSort } from '../-lib/devices';

const routeApi = getRouteApi('/_dashboard-layout/(user-view)/devices/');

/**
 * Everything the devices page keeps in the URL: the filters, the sorting, the
 * page and the device whose details are open, with the navigations that write
 * them. Filters, sorting and paging replace the history entry — typing a
 * search is not a trail of pages to go back through.
 */
export function useDevicesSearch() {
  const { tab, q, status, sort_by, sort_order, page, per_page, device } =
    routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const filters = useMemo<DeviceFilters>(
    () => ({ tab, q, status }),
    [tab, q, status]
  );
  // No column picked means the default order: unassigned devices first
  const sort = useMemo<DeviceSort | undefined>(
    () => sort_by && { by: sort_by, order: sort_order },
    [sort_by, sort_order]
  );

  // Filters gone, first page; the sorting and the page size are not filters
  // and stay. `pageIndex` picks another page of that unfiltered list.
  const showUnfiltered = (pageIndex = 0) =>
    navigate({
      search: (prev) => ({
        sort_by: prev.sort_by,
        sort_order: prev.sort_order,
        per_page: prev.per_page,
        page: pageIndex + 1
      }),
      replace: true
    });

  return {
    filters,
    hasActiveFilters: Boolean(tab || q || status),
    setFilters: (next: DeviceFilters) =>
      navigate({
        search: (prev) => ({ ...prev, ...next, page: undefined }),
        replace: true
      }),
    clearFilters: () => showUnfiltered(),
    showUnfiltered,

    sort,
    setSort: (next: DeviceSort | undefined) =>
      navigate({
        search: (prev) => ({
          ...prev,
          sort_by: next?.by,
          sort_order: next?.order,
          page: undefined
        }),
        replace: true
      }),

    pageIndex: page - 1,
    pageSize: per_page,
    setPage: (pageIndex: number, pageSize: number) =>
      navigate({
        search: (prev) => ({
          ...prev,
          page: pageIndex + 1,
          per_page: pageSize
        }),
        replace: true
      }),

    // Opening and closing push history entries, so Back closes the drawer
    openDeviceId: device,
    openDevice: (deviceId: number) =>
      navigate({ search: (prev) => ({ ...prev, device: deviceId }) }),
    closeDevice: () =>
      navigate({ search: (prev) => ({ ...prev, device: undefined }) })
  };
}

export type DevicesSearch = ReturnType<typeof useDevicesSearch>;
