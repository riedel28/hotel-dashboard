import type { PaymentEnvironment } from './payment-test-connection-dialog';

export type MethodId = 'mastercard' | 'visa' | 'amex' | 'paypal';

export interface MappingCode {
  ecom: string;
  pos: string;
}

export interface PaymentProviderFormData {
  environment: PaymentEnvironment;
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
  mappings: Record<MethodId, MappingCode>;
}

export const PAYMENT_METHODS: Array<{ id: MethodId; name: string }> = [
  { id: 'mastercard', name: 'MasterCard' },
  { id: 'visa', name: 'Visa' },
  { id: 'amex', name: 'American Express' },
  { id: 'paypal', name: 'PayPal' }
];
