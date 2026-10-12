import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Controller } from 'react-hook-form';
import type { CasablancaConfig, PmsProvider } from 'shared/types/providers';

import {
  SecretField,
  SwitchField,
  TextField
} from '@/components/provider-setup/fields';
import { ProviderFormCard } from '@/components/provider-setup/provider-form-card';
import { useProviderForm } from '@/components/provider-setup/use-provider-form';

import { PMS_TEST_STEPS } from './pms-test-steps';

type CasablancaFormData = CasablancaConfig & { secret: string };
type Required = Partial<Record<keyof CasablancaFormData, MessageDescriptor>>;

const EMPTY_VALUES: CasablancaFormData = {
  hotelId: '',
  secret: '',
  sendInvoiceViaPms: false,
  mockCode: ''
};

const SETTINGS_REQUIRED: Required = { hotelId: msg`Hotel ID is required` };
// Once a token is stored, an empty field keeps it.
const SETUP_REQUIRED: Required = {
  ...SETTINGS_REQUIRED,
  secret: msg`Token is required`
};

interface CasablancaFormProps {
  /** The stored Casablanca configuration, or null while it is being set up. */
  saved: Extract<PmsProvider, { provider: 'casablanca' }> | null;
  /** The name of the provider that connecting Casablanca would replace. */
  replaces: string | null;
  onChooseProvider: () => void;
}

export function CasablancaForm({
  saved,
  replaces,
  onChooseProvider
}: CasablancaFormProps) {
  const { form, onSubmit, isSaving, replaceDialog } = useProviderForm({
    kind: 'pms',
    provider: 'casablanca',
    name: 'Casablanca',
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
      name="Casablanca"
      logo={
        <>
          <img
            src="/casablanca-logo.png"
            alt=""
            className="max-h-8 max-w-full object-contain dark:hidden"
          />
          <img
            src="/casablanca-logo-inverse.png"
            alt=""
            className="hidden max-h-8 max-w-full object-contain dark:block"
          />
        </>
      }
      saved={saved}
      onChooseProvider={onChooseProvider}
      testSteps={PMS_TEST_STEPS}
      dialogs={replaceDialog}
    >
      <Controller
        control={control}
        name="hotelId"
        render={(props) => (
          <TextField {...props} label={<Trans>Hotel ID</Trans>} />
        )}
      />
      <Controller
        control={control}
        name="secret"
        render={(props) => (
          <SecretField
            {...props}
            label={<Trans>Token</Trans>}
            configured={saved !== null}
          />
        )}
      />
      <Controller
        control={control}
        name="sendInvoiceViaPms"
        render={({ field }) => (
          <SwitchField
            field={field}
            label={<Trans>Send invoice via PMS</Trans>}
            description={
              <Trans>The invoice will be sent directly to the PMS</Trans>
            }
          />
        )}
      />
      <Controller
        control={control}
        name="mockCode"
        render={(props) => (
          <TextField
            {...props}
            label={<Trans>Mock code</Trans>}
            description={
              <Trans>
                This is the service code that will be used to skip payment at
                check-in.
              </Trans>
            }
          />
        )}
      />
    </ProviderFormCard>
  );
}
