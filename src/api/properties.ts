import { queryOptions } from '@tanstack/react-query';
import { fetchPropertiesResponseSchema } from 'shared/types/properties';
import { client, handleApiError } from './client';

export function propertiesQueryOptions() {
  return queryOptions({
    queryKey: ['properties'],
    queryFn: fetchProperties,
    staleTime: 1000 * 60 * 5 // 5 minutes (matches default QueryClient config)
  });
}

async function fetchProperties() {
  try {
    const response = await client.get('/properties');
    return fetchPropertiesResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchProperties');
  }
}

export { fetchProperties };
