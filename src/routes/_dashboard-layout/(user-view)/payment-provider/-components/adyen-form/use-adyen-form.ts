import { msg } from '@lingui/core/macro';
import {
  EMPTY_ADYEN_MAPPINGS,
  type PaymentProvider
} from 'shared/types/providers';

import { useProviderForm } from '@/components/provider-setup/use-provider-form';

import type { AdyenFormData } from './adyen-form-types';

const EMPTY_VALUES: AdyenFormData = {
  environment: 'test',
  merchantId: '',
  secret: '',
  clientKey: '',
  publicKey: '',
  additionalConfig: '',
  addressLine1: '',
  addressLine2: '',
  zip: '',
  city: '',
  country: '',
  mappings: EMPTY_ADYEN_MAPPINGS
};

// What the form says about the fields Adyen's schema checks.
const MESSAGES = {
  merchantId: msg`Merchant ID is required`,
  clientKey: msg`Client Key is required`,
  mappings: msg`Digits only (max 12)`
};

// Adyen is connected with its credentials alone; its settings also insist on
// the recipient the receipts are issued by, which the schema leaves optional.
export const ADYEN_RECIPIENT_REQUIRED = {
  addressLine1: msg`Address line is required`,
  zip: msg`ZIP / Postal code is required`,
  city: msg`City is required`,
  country: msg`Country is required`
};

interface UseAdyenFormOptions {
  /** The stored configuration the form starts from and resets to. */
  saved: PaymentProvider | null;
  required?: typeof ADYEN_RECIPIENT_REQUIRED;
  /** The name of the provider that connecting Adyen would replace. */
  replaces?: string | null;
}

/** The Adyen form behind both of its screens: setup and settings. */
export function useAdyenForm({
  saved,
  required,
  replaces
}: UseAdyenFormOptions) {
  return useProviderForm({
    kind: 'payment',
    provider: 'adyen',
    name: 'Adyen',
    saved,
    emptyValues: EMPTY_VALUES,
    messages: MESSAGES,
    required,
    secretRequired: msg`API Key is required`,
    replaces
  });
}
