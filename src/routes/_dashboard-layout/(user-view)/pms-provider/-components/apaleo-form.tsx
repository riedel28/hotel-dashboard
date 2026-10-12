import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Controller } from 'react-hook-form';
import type { ApaleoConfig, PmsProvider } from 'shared/types/providers';

import {
  SecretField,
  SwitchField,
  TextField
} from '@/components/provider-setup/fields';
import { ProviderFormCard } from '@/components/provider-setup/provider-form-card';
import { useProviderForm } from '@/components/provider-setup/use-provider-form';

import { PMS_TEST_STEPS } from './pms-test-steps';

type ApaleoFormData = ApaleoConfig & { secret: string };
type Required = Partial<Record<keyof ApaleoFormData, MessageDescriptor>>;

const EMPTY_VALUES: ApaleoFormData = {
  clientId: '',
  secret: '',
  propertyId: '',
  useApaleoPaymentPos: false,
  useApaleoPaymentEcom: false,
  groupFolioByRatePlan: false
};

const SETTINGS_REQUIRED: Required = {
  clientId: msg`Client ID is required`,
  propertyId: msg`Property ID is required`
};
// Once a secret code is stored, an empty field keeps it.
const SETUP_REQUIRED: Required = {
  ...SETTINGS_REQUIRED,
  secret: msg`Secret code is required`
};

interface ApaleoFormProps {
  /** The stored Apaleo configuration, or null while it is being set up. */
  saved: Extract<PmsProvider, { provider: 'apaleo' }> | null;
  /** The name of the provider that connecting Apaleo would replace. */
  replaces: string | null;
  onChooseProvider: () => void;
}

export function ApaleoForm({
  saved,
  replaces,
  onChooseProvider
}: ApaleoFormProps) {
  const { form, onSubmit, isSaving, replaceDialog } = useProviderForm({
    kind: 'pms',
    provider: 'apaleo',
    name: 'Apaleo',
    config: saved?.config,
    emptyValues: EMPTY_VALUES,
    required: saved ? SETTINGS_REQUIRED : SETUP_REQUIRED,
    replaces
  });
  const { control } = form;

  return (
    <ProviderFormCard
      form={form}
      onSubmit={onSubmit}
      isSaving={isSaving}
      name="Apaleo"
      logo={
        // The only logo file is the light one, for dark surfaces
        <img
          src="/apaleo-logo.png"
          alt=""
          className="max-h-8 max-w-full object-contain brightness-0 dark:brightness-100"
        />
      }
      guideUrl="https://apaleo.dev"
      saved={saved}
      onChooseProvider={onChooseProvider}
      testSteps={PMS_TEST_STEPS}
      dialogs={replaceDialog}
    >
      <Controller
        control={control}
        name="clientId"
        render={(props) => (
          <TextField {...props} label={<Trans>Client ID</Trans>} />
        )}
      />
      <Controller
        control={control}
        name="secret"
        render={(props) => (
          <SecretField
            {...props}
            label={<Trans>Secret code</Trans>}
            configured={saved !== null}
          />
        )}
      />
      <Controller
        control={control}
        name="propertyId"
        render={(props) => (
          <TextField
            {...props}
            label={<Trans>Property ID</Trans>}
            description={
              <Trans>The property's code in Apaleo, for example MUC.</Trans>
            }
          />
        )}
      />
      <Controller
        control={control}
        name="useApaleoPaymentPos"
        render={({ field }) => (
          <SwitchField
            field={field}
            label={<Trans>Use Apaleo Payment for POS payments</Trans>}
          />
        )}
      />
      <Controller
        control={control}
        name="useApaleoPaymentEcom"
        render={({ field }) => (
          <SwitchField
            field={field}
            label={<Trans>Use Apaleo Payment for eCom payments</Trans>}
          />
        )}
      />
      <Controller
        control={control}
        name="groupFolioByRatePlan"
        render={({ field }) => (
          <SwitchField
            field={field}
            label={<Trans>Group folio listing by rate plan</Trans>}
          />
        )}
      />
    </ProviderFormCard>
  );
}
