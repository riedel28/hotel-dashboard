import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';
import type {
  PaymentProvider,
  PaymentProviderId
} from 'shared/types/payment-provider';

import { useAuth } from '@/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDocumentTitle } from '@/hooks/use-document-title';

import { AdyenSettingsForm } from './payment-provider/-components/adyen-form/adyen-settings-form';
import { AdyenSetupCard } from './payment-provider/-components/adyen-form/adyen-setup-card';
import { ProviderPicker } from './payment-provider/-components/provider-picker';
import { usePaymentProvider } from './payment-provider/-hooks/use-payment-provider';

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

      <PaymentProviderContent />
    </div>
  );
}

function PaymentProviderContent() {
  const { user } = useAuth();
  const { data, isPending, isError, refetch } = usePaymentProvider();

  if (isPending) {
    return <Skeleton className="h-96 max-w-4xl rounded-xl" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground" role="alert">
          <Trans>Failed to load the payment provider.</Trans>
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <Trans>Try again</Trans>
        </Button>
      </div>
    );
  }

  // Keyed by property: switching it starts over from that property's state.
  return (
    <PaymentProviderScreens key={user?.selected_property_id} saved={data} />
  );
}

function PaymentProviderScreens({ saved }: { saved: PaymentProvider | null }) {
  // The provider whose screen is open, or null for the picker. A property
  // without a provider starts on the picker, one with a provider on its form.
  const [open, setOpen] = React.useState<PaymentProviderId | null>(
    saved?.provider ?? null
  );

  if (open === null) {
    return (
      <ProviderPicker
        current={saved?.provider}
        onSelect={setOpen}
        onBack={saved ? () => setOpen(saved.provider) : undefined}
      />
    );
  }

  // The stored provider opens on its settings, any other on its setup. Adyen
  // is the only one the picker lets through; the next one branches here.
  return saved?.provider === open ? (
    <AdyenSettingsForm saved={saved} onChangeProvider={() => setOpen(null)} />
  ) : (
    <AdyenSetupCard onBack={() => setOpen(null)} />
  );
}
