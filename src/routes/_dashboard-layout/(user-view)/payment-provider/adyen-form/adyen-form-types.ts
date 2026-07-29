import type { AdyenEnvironment } from './adyen-test-connection-dialog';

export type AdyenMethodId = 'mastercard' | 'visa' | 'amex' | 'paypal';

export interface AdyenMappingCode {
  ecom: string;
  pos: string;
}

export interface AdyenFormData {
  environment: AdyenEnvironment;
  merchantId: string;
  apiKey: string;
  clientKey: string;
  publicKey: string;
  additionalConfig: string;
  addressLine1: string;
  addressLine2: string;
  zip: string;
  city: string;
  country: string;
  mappings: Record<AdyenMethodId, AdyenMappingCode>;
}

export const ADYEN_PAYMENT_METHODS: Array<{ id: AdyenMethodId; name: string }> =
  [
    { id: 'mastercard', name: 'MasterCard' },
    { id: 'visa', name: 'Visa' },
    { id: 'amex', name: 'American Express' },
    { id: 'paypal', name: 'PayPal' }
  ];
