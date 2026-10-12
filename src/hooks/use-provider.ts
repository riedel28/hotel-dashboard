import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProviderKind, SaveProviderInput } from 'shared/types/providers';

import { providerQueryOptions, saveProvider } from '@/api/providers';
import { useAuth } from '@/auth';

function useQueryOptions<K extends ProviderKind>(kind: K) {
  const { user } = useAuth();
  return providerQueryOptions(kind, user?.selected_property_id ?? null);
}

/** The selected property's provider of that kind: null when none is set up. */
export function useProvider<K extends ProviderKind>(kind: K) {
  return useQuery(useQueryOptions(kind));
}

/** Saves the provider and puts what the server stored in place of the old one. */
export function useSaveProvider<K extends ProviderKind>(kind: K) {
  const queryClient = useQueryClient();
  const { queryKey } = useQueryOptions(kind);

  return useMutation({
    mutationFn: (data: SaveProviderInput<K>) => saveProvider(kind, data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    }
  });
}
