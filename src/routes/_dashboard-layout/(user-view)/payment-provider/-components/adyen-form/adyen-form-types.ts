import type { AdyenConfig } from 'shared/types/payment-provider';

export type AdyenMethodId = 'mastercard' | 'visa' | 'amex' | 'paypal';

export interface AdyenMappingCode {
  ecom: string;
  pos: string;
}

// The stored configuration plus the API key, which only ever travels to the
// server: an empty one keeps the key already stored.
export type AdyenFormData = AdyenConfig & { apiKey: string };

export const ADYEN_PAYMENT_METHODS: Array<{ id: AdyenMethodId; name: string }> =
  [
    { id: 'mastercard', name: 'MasterCard' },
    { id: 'visa', name: 'Visa' },
    { id: 'amex', name: 'American Express' },
    { id: 'paypal', name: 'PayPal' }
  ];
