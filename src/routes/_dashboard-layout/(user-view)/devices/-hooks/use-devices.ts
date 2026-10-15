import { type QueryClient, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { devicesQueryOptions } from '@/api/devices';

import { type DeviceView, withConnection } from '../-lib/devices';

/**
 * The property's devices, each with its connection status, and the query
 * they come from (for its loading and error states). Statuses are computed for
 * the moment the list was fetched, which the query's refetch interval keeps
 * within a minute of now.
 */
export function useDevices() {
  const query = useQuery(devicesQueryOptions());
  const { data, dataUpdatedAt } = query;

  const devices = useMemo(
    () => (data ?? []).map((device) => withConnection(device, dataUpdatedAt)),
    [data, dataUpdatedAt]
  );
  return { devices, query };
}

/**
 * The same list read from the cache once, for an event handler that needs it
 * as it is right now rather than as of the last render.
 */
export function getDevices(queryClient: QueryClient): DeviceView[] {
  const state = queryClient.getQueryState(devicesQueryOptions().queryKey);
  return (state?.data ?? []).map((device) =>
    withConnection(device, state?.dataUpdatedAt ?? Date.now())
  );
}
