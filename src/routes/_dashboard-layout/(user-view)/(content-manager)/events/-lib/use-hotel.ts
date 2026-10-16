import { type QueryClient, useQuery } from '@tanstack/react-query';

import { propertyByIdQueryOptions } from '@/api/properties';
import { useAuth } from '@/auth';

/**
 * The selected property, for its timezone and address: undefined while it
 * loads, null when none is selected.
 */
export function useHotel() {
  const propertyId = useAuth().user?.selected_property_id ?? null;
  const query = useQuery({
    ...propertyByIdQueryOptions(propertyId ?? ''),
    enabled: propertyId !== null
  });
  return propertyId === null ? null : query.data;
}

/** For a loader: the selected property, so the form opens with it. */
export function ensureHotel(
  queryClient: QueryClient,
  propertyId?: string | null
) {
  return propertyId
    ? queryClient.ensureQueryData(propertyByIdQueryOptions(propertyId))
    : null;
}
