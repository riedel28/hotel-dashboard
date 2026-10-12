import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  paymentProviderQueryOptions,
  savePaymentProvider
} from '@/api/payment-provider';
import { useAuth } from '@/auth';

function useQueryOptions() {
  const { user } = useAuth();
  return paymentProviderQueryOptions(user?.selected_property_id ?? null);
}

/** The selected property's payment provider: null when none is set up. */
export function usePaymentProvider() {
  return useQuery(useQueryOptions());
}

/** Saves the provider and puts what the server stored in place of the old one. */
export function useSavePaymentProvider() {
  const queryClient = useQueryClient();
  const { queryKey } = useQueryOptions();

  return useMutation({
    mutationFn: savePaymentProvider,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    }
  });
}
