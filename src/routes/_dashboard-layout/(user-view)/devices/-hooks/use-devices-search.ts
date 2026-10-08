import { getRouteApi } from '@tanstack/react-router';

import type { DeviceFilters } from '../-lib/devices';

const routeApi = getRouteApi('/_dashboard-layout/(user-view)/devices/');

/**
 * Everything the devices page keeps in the URL: the filters and the device
 * whose details are open, with the navigations that write them.
 */
export function useDevicesSearch() {
  const { device: openDeviceId, ...filters } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  return {
    filters,
    hasActiveFilters: Object.values(filters).some(Boolean),
    // Filters replace the history entry: typing a search is not a trail of
    // pages to go back through
    setFilters: (next: DeviceFilters) =>
      navigate({ search: (prev) => ({ ...prev, ...next }), replace: true }),
    clearFilters: () => navigate({ search: {}, replace: true }),

    // Opening and closing push history entries, so Back closes the drawer
    openDeviceId,
    openDevice: (deviceId: number) =>
      navigate({ search: (prev) => ({ ...prev, device: deviceId }) }),
    closeDevice: () =>
      navigate({ search: (prev) => ({ ...prev, device: undefined }) })
  };
}
