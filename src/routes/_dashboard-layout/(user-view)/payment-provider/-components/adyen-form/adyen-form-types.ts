import type { AdyenMethodId } from 'shared/types/providers';

import type { ProviderFormValues } from '@/components/provider-setup/use-provider-form';

// The stored configuration plus the API key, which only ever travels to the
// server: an empty one keeps the key already stored.
export type AdyenFormData = ProviderFormValues<'payment', 'adyen'>;

export const ADYEN_METHOD_NAMES: Record<AdyenMethodId, string> = {
  mastercard: 'MasterCard',
  visa: 'Visa',
  amex: 'American Express',
  paypal: 'PayPal'
};
