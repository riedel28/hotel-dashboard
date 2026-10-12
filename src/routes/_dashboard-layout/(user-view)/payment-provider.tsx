import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';

import { ProviderScreens } from '@/components/provider-setup/provider-screens';
import type { ProviderEntry } from '@/components/provider-setup/types';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useDocumentTitle } from '@/hooks/use-document-title';

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
  useDocumentTitle(t`Payment Provider`);

  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Trans>Integrations</Trans>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Trans>Payment Provider</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex max-w-2xl flex-col gap-1">
        <h1 className="text-xl font-semibold text-balance">
          <Trans>Payment Provider</Trans>
        </h1>
        <p className="text-sm text-pretty text-muted-foreground">
          <Trans>
            Manage this property's connection to its payment account.
          </Trans>
        </p>
      </div>

      <ProviderScreens
        kind="payment"
        pickerTitle={<Trans>Choose a payment provider</Trans>}
        pickerDescription={
          <Trans>
            Select the provider this property takes payments with. You enter its
            credentials in the next step.
          </Trans>
        }
        providers={PROVIDERS}
      />
    </div>
  );
}
