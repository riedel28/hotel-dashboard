import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import {
  SecretField,
  SwitchField,
  TextField
} from '@/components/provider-setup/fields';
import { ProviderFormCard } from '@/components/provider-setup/provider-form-card';
import type { ProviderFormProps } from '@/components/provider-setup/types';
import {
  type ProviderFormValues,
  useProviderForm
} from '@/components/provider-setup/use-provider-form';

import { PMS_TEST_STEPS } from './pms-test-steps';

const EMPTY_VALUES: ProviderFormValues<'pms', 'casablanca'> = {
  hotelId: '',
  secret: '',
  sendInvoiceViaPms: false,
  mockCode: ''
};

const MESSAGES = { hotelId: msg`Hotel ID is required` };

export function CasablancaForm({
  entry,
  saved,
  replaces,
  onChooseProvider
}: ProviderFormProps<'pms'>) {
  const providerForm = useProviderForm({
    kind: 'pms',
    provider: 'casablanca',
    name: entry.name,
    saved,
    emptyValues: EMPTY_VALUES,
    messages: MESSAGES,
    secretRequired: msg`Token is required`,
    replaces
  });
  const { form } = providerForm;
  const { errors } = form.formState;

  return (
    <ProviderFormCard
      providerForm={providerForm}
      entry={entry}
      onChooseProvider={onChooseProvider}
      testSteps={PMS_TEST_STEPS}
    >
      <TextField
        label={<Trans>Hotel ID</Trans>}
        error={errors.hotelId}
        {...form.register('hotelId')}
      />
      <SecretField
        label={<Trans>Token</Trans>}
        error={errors.secret}
        stored={providerForm.secretStored}
        {...form.register('secret')}
      />
      <SwitchField
        control={form.control}
        name="sendInvoiceViaPms"
        label={<Trans>Send invoice via PMS</Trans>}
      />
      <TextField
        label={<Trans>Mock code</Trans>}
        description={
          <Trans>
            This is the service code that will be used to skip payment at
            check-in.
          </Trans>
        }
        error={errors.mockCode}
        {...form.register('mockCode')}
      />
    </ProviderFormCard>
  );
}
