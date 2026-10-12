import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  ADYEN_MAPPING_CODE_PATTERN,
  ADYEN_METHOD_IDS,
  EMPTY_ADYEN_MAPPINGS,
  type PaymentProvider
} from 'shared/types/providers';
import type { z } from 'zod';

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

// The API key is not among these: it is required only until one is stored.
export const ADYEN_CREDENTIALS_REQUIRED = {
  merchantId: msg`Merchant ID is required`,
  clientKey: msg`Client Key is required`
};

// Connecting Adyen takes the credentials alone; its settings also need the
// recipient the receipts are issued by.
export const ADYEN_SETTINGS_REQUIRED = {
  ...ADYEN_CREDENTIALS_REQUIRED,
  addressLine1: msg`Address line is required`,
  zip: msg`ZIP / Postal code is required`,
  city: msg`City is required`,
  country: msg`Country is required`
};

function refineMappingCodes(
  data: AdyenFormData,
  ctx: z.RefinementCtx,
  t: (message: MessageDescriptor) => string
) {
  for (const id of ADYEN_METHOD_IDS) {
    for (const kind of ['ecom', 'pos'] as const) {
      if (!ADYEN_MAPPING_CODE_PATTERN.test(data.mappings[id][kind])) {
        ctx.addIssue({
          code: 'custom',
          path: ['mappings', id, kind],
          message: t(msg`Digits only (max 12)`)
        });
      }
    }
  }
}

interface UseAdyenFormOptions {
  /** The stored configuration the form starts from and resets to. */
  saved: PaymentProvider | null;
  required: Partial<
    Record<Exclude<keyof AdyenFormData, 'secret'>, MessageDescriptor>
  >;
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
    required,
    secretRequired: msg`API Key is required`,
    refine: refineMappingCodes,
    replaces
  });
}
