import { Trans } from '@lingui/react/macro';
import { InfoIcon } from 'lucide-react';
import type { PaymentProvider } from 'shared/types/providers';

import { LastUpdated } from '@/components/provider-setup/last-updated';
import { ProviderCardHeader } from '@/components/provider-setup/provider-card-header';
import type { ProviderFormProps } from '@/components/provider-setup/types';
import { SectionedFormShell } from '@/components/sectioned-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import { AdyenCredentialsSection } from './adyen-credentials-section';
import { AdyenEnvironmentBadge } from './adyen-environment-badge';
import { ADYEN_FORM_SECTIONS } from './adyen-form-toc';
import { AdyenMappingCodesSection } from './adyen-mapping-codes-section';
import { AdyenRecipientSection } from './adyen-recipient-section';
import { ADYEN_RECIPIENT_REQUIRED, useAdyenForm } from './use-adyen-form';

/** The full configuration of a property's connected Adyen account. */
export function AdyenSettingsForm({
  entry,
  saved,
  onChooseProvider
}: Omit<ProviderFormProps<'payment'>, 'saved' | 'replaces'> & {
  saved: PaymentProvider;
}) {
  const { form, onSubmit, isSaving } = useAdyenForm({
    saved,
    required: ADYEN_RECIPIENT_REQUIRED
  });
  const { isDirty } = form.formState;

  return (
    <SectionedFormShell
      form={form}
      sections={ADYEN_FORM_SECTIONS}
      onSubmit={onSubmit}
      isSaving={isSaving}
      submitLabel={<Trans>Save changes</Trans>}
      header={
        <ProviderCardHeader
          entry={entry}
          badges={<AdyenEnvironmentBadge control={form.control} />}
          onChangeProvider={onChooseProvider}
          // Leaving for the picker would drop unsaved changes
          changeDisabled={isDirty || isSaving}
        >
          {!saved.config.addressLine1 && (
            <Alert variant="info" role="status" className="mt-2">
              <InfoIcon aria-hidden="true" />
              <AlertDescription>
                <Trans>Add the payment recipient to finish the setup.</Trans>
              </AlertDescription>
            </Alert>
          )}
        </ProviderCardHeader>
      }
      status={
        isSaving ? (
          <Trans>Saving changes…</Trans>
        ) : isDirty ? null : (
          <LastUpdated saved={saved} />
        )
      }
    >
      <AdyenCredentialsSection
        form={form}
        apiKeyConfigured
        disabled={isSaving}
      />

      <Separator />

      <AdyenRecipientSection control={form.control} disabled={isSaving} />

      <Separator />

      <AdyenMappingCodesSection control={form.control} />
    </SectionedFormShell>
  );
}
