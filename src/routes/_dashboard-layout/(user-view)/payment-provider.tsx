import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';

import { ProviderPage } from '@/components/provider-setup/provider-page';
import type { ProviderEntry } from '@/components/provider-setup/types';

import { AdyenForm } from './payment-provider/-components/adyen-form/adyen-form';

const PROVIDERS: ProviderEntry<'payment'>[] = [
  {
    id: 'adyen',
    name: 'Adyen',
    logo: { src: '/adyen-logo.svg' },
    guideUrl: 'https://docs.adyen.com/development-resources/api-credentials/',
    Form: AdyenForm
  },
  { id: 'payone', name: 'PAYONE', logo: { src: '/payone-logo.svg' } },
  { id: 'concardis', name: 'Concardis', logo: { src: '/concardis-logo.svg' } },
  { id: 'six_saferpay', name: 'SIX Saferpay', logo: { src: '/six-logo.svg' } },
  { id: 'valitor', name: 'Valitor', logo: { src: '/valitor-logo.png' } }
];

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/payment-provider'
)({
  component: RouteComponent
});

function RouteComponent() {
  const { t } = useLingui();

  return (
    <ProviderPage
      kind="payment"
      title={t`Payment Gateway`}
      description={
        <Trans>Manage this property's connection to its payment account.</Trans>
      }
      pickerTitle={<Trans>Choose a payment provider</Trans>}
      pickerDescription={
        <Trans>
          Select the provider this property takes payments with. You enter its
          credentials in the next step.
        </Trans>
      }
      providers={PROVIDERS}
    />
  );
}
