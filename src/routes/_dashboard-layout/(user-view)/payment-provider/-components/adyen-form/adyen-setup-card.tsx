import { ProviderFormCard } from '@/components/provider-setup/provider-form-card';
import type { ProviderFormProps } from '@/components/provider-setup/types';

import { AdyenCredentialsSection } from './adyen-credentials-section';
import { AdyenEnvironmentBadge } from './adyen-environment-badge';
import { useAdyenForm } from './use-adyen-form';

/**
 * Connects Adyen to a property: the credentials alone. The recipient and
 * mapping codes follow in the settings once it is connected.
 */
export function AdyenSetupCard({
  entry,
  replaces,
  onChooseProvider
}: Omit<ProviderFormProps<'payment'>, 'saved'>) {
  const providerForm = useAdyenForm({
    saved: null,
    replaces
  });
  const { form, isSaving } = providerForm;

  return (
    <ProviderFormCard
      providerForm={providerForm}
      className="max-w-4xl"
      entry={entry}
      badges={<AdyenEnvironmentBadge control={form.control} />}
      onChooseProvider={onChooseProvider}
    >
      <AdyenCredentialsSection form={form} disabled={isSaving} />
    </ProviderFormCard>
  );
}
