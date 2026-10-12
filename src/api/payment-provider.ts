import { queryOptions } from '@tanstack/react-query';
import {
  fetchPaymentProviderResponseSchema,
  type PaymentProvider,
  paymentProviderSchema,
  type SavePaymentProviderData,
  savePaymentProviderSchema
} from 'shared/types/payment-provider';

import { client, handleApiError } from './client';

// The server scopes this to the caller's selected property; the id is in the
// key so that switching property never shows the previous one's provider.
export function paymentProviderQueryOptions(propertyId: string | null) {
  return queryOptions({
    queryKey: ['payment-provider', propertyId],
    queryFn: fetchPaymentProvider
  });
}

async function fetchPaymentProvider(): Promise<PaymentProvider | null> {
  try {
    const response = await client.get('/payment-provider');
    return fetchPaymentProviderResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchPaymentProvider');
  }
}

async function savePaymentProvider(
  data: SavePaymentProviderData
): Promise<PaymentProvider> {
  try {
    const validated = savePaymentProviderSchema.parse(data);
    const response = await client.put('/payment-provider', validated);
    return paymentProviderSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'savePaymentProvider');
  }
}

export { fetchPaymentProvider, type PaymentProvider, savePaymentProvider };
