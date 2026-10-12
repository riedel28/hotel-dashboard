import type { AdyenConfig, AdyenMethodId } from 'shared/types/payment-provider';

// The stored configuration plus the API key, which only ever travels to the
// server: an empty one keeps the key already stored.
export type AdyenFormData = AdyenConfig & { apiKey: string };

export const ADYEN_METHOD_NAMES: Record<AdyenMethodId, string> = {
  mastercard: 'MasterCard',
  visa: 'Visa',
  amex: 'American Express',
  paypal: 'PayPal'
};
