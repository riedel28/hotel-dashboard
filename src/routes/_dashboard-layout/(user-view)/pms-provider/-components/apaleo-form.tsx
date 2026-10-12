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

const EMPTY_VALUES: ProviderFormValues<'pms', 'apaleo'> = {
  clientId: '',
  secret: '',
  propertyId: '',
  useApaleoPaymentPos: false,
  useApaleoPaymentEcom: false,
  groupFolioByRatePlan: false
};

const MESSAGES = {
  clientId: msg`Client ID is required`,
  propertyId: msg`Property ID is required`
};

export function ApaleoForm({
  entry,
  saved,
  replaces,
  onChooseProvider
}: ProviderFormProps<'pms'>) {
  const providerForm = useProviderForm({
    kind: 'pms',
    provider: 'apaleo',
    name: entry.name,
    saved,
    emptyValues: EMPTY_VALUES,
    messages: MESSAGES,
    secretRequired: msg`Secret code is required`,
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
        label={<Trans>Client ID</Trans>}
        error={errors.clientId}
        {...form.register('clientId')}
      />
      <SecretField
        label={<Trans>Secret code</Trans>}
        error={errors.secret}
        stored={providerForm.secretStored}
        {...form.register('secret')}
      />
      <TextField
        label={<Trans>Property ID</Trans>}
        description={
          <Trans>The property's code in Apaleo, for example MUC.</Trans>
        }
        error={errors.propertyId}
        {...form.register('propertyId')}
      />
      <SwitchField
        control={form.control}
        name="useApaleoPaymentPos"
        label={<Trans>Use Apaleo Payment for POS payments</Trans>}
      />
      <SwitchField
        control={form.control}
        name="useApaleoPaymentEcom"
        label={<Trans>Use Apaleo Payment for eCom payments</Trans>}
      />
      <SwitchField
        control={form.control}
        name="groupFolioByRatePlan"
        label={<Trans>Group folio listing by rate plan</Trans>}
      />
    </ProviderFormCard>
  );
}
