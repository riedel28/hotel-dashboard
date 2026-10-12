import { queryOptions } from '@tanstack/react-query';
import {
  type Provider,
  type ProviderKind,
  providerSchemas,
  type SaveProviderInput,
  saveProviderSchemas
} from 'shared/types/providers';

import { client, handleApiError } from './client';

// The server scopes this to the caller's selected property; the id is in the
// key so that switching property never shows the previous one's provider.
export function providerQueryOptions<K extends ProviderKind>(
  kind: K,
  propertyId: string | null
) {
  return queryOptions({
    queryKey: ['providers', kind, propertyId],
    queryFn: () => fetchProvider(kind)
  });
}

// The schema is picked by kind, which the compiler cannot follow through the
// lookup: hence the casts, here and in saveProvider, and nowhere else.
async function fetchProvider<K extends ProviderKind>(
  kind: K
): Promise<Provider<K> | null> {
  try {
    const response = await client.get(`/providers/${kind}`);
    return providerSchemas[kind]
      .nullable()
      .parse(response.data) as Provider<K> | null;
  } catch (err) {
    handleApiError(err, 'fetchProvider');
  }
}

async function saveProvider<K extends ProviderKind>(
  kind: K,
  data: SaveProviderInput<K>
): Promise<Provider<K>> {
  try {
    const validated = saveProviderSchemas[kind].parse(data);
    const response = await client.put(`/providers/${kind}`, validated);
    return providerSchemas[kind].parse(response.data) as Provider<K>;
  } catch (err) {
    handleApiError(err, 'saveProvider');
  }
}

export { fetchProvider, saveProvider };
