import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';
import type { PaymentProvider } from 'shared/types/payment-provider';

import { paymentProviderQueryOptions } from '@/api/payment-provider';
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

import { AdyenForm } from './payment-provider/-components/adyen-form/adyen-form';
import { ProviderPicker } from './payment-provider/-components/provider-picker';

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
  const propertyId = user?.selected_property_id ?? null;
  const { data, isPending, isError, refetch } = useQuery(
    paymentProviderQueryOptions(propertyId)
  );

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
  return <PaymentProviderScreens key={propertyId} saved={data} />;
}

function PaymentProviderScreens({ saved }: { saved: PaymentProvider | null }) {
  // Without a provider the page opens on the picker; with one, on its form.
  // ponytail: a boolean is enough while Adyen is the only provider that can be
  // picked; a second one needs the picked id here to choose the setup form.
  const [pickerOpen, setPickerOpen] = React.useState(saved === null);

  if (pickerOpen) {
    return (
      <ProviderPicker
        current={saved?.provider}
        onSelect={() => setPickerOpen(false)}
        onBack={saved ? () => setPickerOpen(false) : undefined}
      />
    );
  }

  return (
    <AdyenForm saved={saved} onChooseProvider={() => setPickerOpen(true)} />
  );
}
