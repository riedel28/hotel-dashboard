import { queryOptions } from '@tanstack/react-query';
import { client, handleApiError } from '@/api/client';
import { type Role, rolesSchema } from '../../shared/types/roles';

export function rolesQueryOptions() {
  return queryOptions({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    staleTime: Infinity
  });
}

async function fetchRoles(): Promise<Role[]> {
  try {
    const response = await client.get('/roles');
    return rolesSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchRoles');
    throw err;
  }
}
