import { zodResolver } from '@hookform/resolvers/zod';
import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
  ADYEN_MAPPING_CODE_PATTERN,
  ADYEN_METHOD_IDS,
  EMPTY_ADYEN_MAPPINGS,
  type PaymentProvider
} from 'shared/types/payment-provider';
import { toast } from 'sonner';
import { z } from 'zod';

import { useSavePaymentProvider } from '../../-hooks/use-payment-provider';
import type { AdyenFormData } from './adyen-form-types';

const EMPTY_VALUES: AdyenFormData = {
  environment: 'test',
  merchantId: '',
  apiKey: '',
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

// The fields a form may insist on, with what it says when one is empty.
const REQUIRED_MESSAGES = {
  merchantId: msg`Merchant ID is required`,
  apiKey: msg`API Key is required`,
  clientKey: msg`Client Key is required`,
  addressLine1: msg`Address line is required`,
  zip: msg`ZIP / Postal code is required`,
  city: msg`City is required`,
  country: msg`Country is required`
} satisfies Partial<Record<keyof AdyenFormData, MessageDescriptor>>;

export type AdyenRequiredField = keyof typeof REQUIRED_MESSAGES;

interface UseAdyenFormOptions {
  /** The stored configuration the form starts from and resets to. */
  saved: PaymentProvider | null;
  /** Keep the list's identity stable: the validation is rebuilt from it. */
  required: AdyenRequiredField[];
  /** The toast for a successful save. */
  savedMessage: MessageDescriptor;
}

/**
 * The Adyen form behind both of its screens: the credentials-only setup and
 * the full settings. They differ in which fields must be filled in.
 */
export function useAdyenForm({
  saved,
  required,
  savedMessage
}: UseAdyenFormOptions) {
  const { t } = useLingui();
  const save = useSavePaymentProvider();

  // The server owns the shape (adyenConfigSchema); this only adds what a form
  // has to say before the request is sent.
  const schema = React.useMemo(
    () =>
      z.custom<AdyenFormData>().superRefine((data, ctx) => {
        for (const field of required) {
          if (!data[field].trim()) {
            ctx.addIssue({
              code: 'custom',
              path: [field],
              message: t(REQUIRED_MESSAGES[field])
            });
          }
        }

        for (const id of ADYEN_METHOD_IDS) {
          for (const kind of ['ecom', 'pos'] as const) {
            if (!ADYEN_MAPPING_CODE_PATTERN.test(data.mappings[id][kind])) {
              ctx.addIssue({
                code: 'custom',
                path: ['mappings', id, kind],
                message: t`Digits only (max 12)`
              });
            }
          }
        }
      }),
    [required, t]
  );

  // Follows the stored configuration: saving it resets the form to it, which
  // also empties the API key field again.
  const values = React.useMemo<AdyenFormData>(
    () => ({ ...EMPTY_VALUES, ...saved?.config }),
    [saved]
  );

  const form = useForm<AdyenFormData>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
    values
  });

  const onSubmit = async ({ apiKey, ...config }: AdyenFormData) => {
    try {
      await save.mutateAsync({ provider: 'adyen', apiKey, config });
      toast.success(t(savedMessage));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t`Failed to save configuration`
      );
    }
  };

  return { form, onSubmit, isSaving: save.isPending };
}
