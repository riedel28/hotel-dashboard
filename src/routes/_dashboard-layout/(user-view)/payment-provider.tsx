import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';
import type { PaymentProviderId } from 'shared/types/providers';

import type { ProviderOption } from '@/components/provider-setup/provider-picker';
import { ProviderScreens } from '@/components/provider-setup/provider-screens';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useDocumentTitle } from '@/hooks/use-document-title';

import { AdyenSettingsForm } from './payment-provider/-components/adyen-form/adyen-settings-form';
import { AdyenSetupCard } from './payment-provider/-components/adyen-form/adyen-setup-card';

const PROVIDERS: ProviderOption<PaymentProviderId>[] = [
  { id: 'adyen', name: 'Adyen', logo: '/adyen-logo.svg', available: true },
  { id: 'payone', name: 'PAYONE', logo: '/payone-logo.svg' },
  {
    id: 'concardis',
    name: 'Concardis',
    logo: '/concardis-logo.svg',
    ink: 'dark'
  },
  { id: 'six_saferpay', name: 'SIX Saferpay', logo: '/six-logo.svg' },
  { id: 'valitor', name: 'Valitor', logo: '/valitor-logo.png', ink: 'dark' }
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
        options={PROVIDERS}
        // Adyen is the only one the picker lets through
        renderForm={({ saved, replaces, onChooseProvider }) =>
          saved?.provider === 'adyen' ? (
            <AdyenSettingsForm
              saved={saved}
              onChangeProvider={onChooseProvider}
            />
          ) : (
            <AdyenSetupCard replaces={replaces} onBack={onChooseProvider} />
          )
        }
      />
    </div>
  );
}
