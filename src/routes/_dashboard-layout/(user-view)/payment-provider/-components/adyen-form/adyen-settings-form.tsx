import { Trans } from '@lingui/react/macro';
import { InfoIcon } from 'lucide-react';
import type { PaymentProvider } from 'shared/types/providers';

import { LastUpdated } from '@/components/provider-setup/last-updated';
import { SectionedFormShell } from '@/components/sectioned-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { AdyenCredentialsSection } from './adyen-credentials-section';
import { AdyenFormHeader } from './adyen-form-header';
import { ADYEN_FORM_SECTIONS } from './adyen-form-toc';
import { AdyenMappingCodesSection } from './adyen-mapping-codes-section';
import { AdyenRecipientSection } from './adyen-recipient-section';
import { ADYEN_SETTINGS_REQUIRED, useAdyenForm } from './use-adyen-form';

interface AdyenSettingsFormProps {
  saved: PaymentProvider;
  /** Opens the provider picker. */
  onChangeProvider: () => void;
}

/** The full configuration of a property's connected Adyen account. */
export function AdyenSettingsForm({
  saved,
  onChangeProvider
}: AdyenSettingsFormProps) {
  const { form, onSubmit, isSaving } = useAdyenForm({
    saved,
    required: ADYEN_SETTINGS_REQUIRED
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
        <AdyenFormHeader
          control={form.control}
          actions={
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={onChangeProvider}
              // Leaving for the picker would drop unsaved changes
              disabled={isDirty || isSaving}
            >
              <Trans>Change provider</Trans>
            </Button>
          }
        >
          {!saved.config.addressLine1 && (
            <Alert variant="info" role="status" className="mt-2">
              <InfoIcon aria-hidden="true" />
              <AlertDescription>
                <Trans>Add the payment recipient to finish the setup.</Trans>
              </AlertDescription>
            </Alert>
          )}
        </AdyenFormHeader>
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
