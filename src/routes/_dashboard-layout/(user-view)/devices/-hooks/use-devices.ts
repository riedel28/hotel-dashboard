import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { devicesQueryOptions } from '@/api/devices';

import { withConnection } from '../-lib/devices';

/**
 * The property's devices, each with its connection status. Statuses are
 * computed for the moment the list was fetched, which the query's refetch
 * interval keeps within a minute of now.
 */
export function useDevices() {
  const { data, dataUpdatedAt } = useSuspenseQuery(devicesQueryOptions());

  return useMemo(
    () => data.map((device) => withConnection(device, dataUpdatedAt)),
    [data, dataUpdatedAt]
  );
}
