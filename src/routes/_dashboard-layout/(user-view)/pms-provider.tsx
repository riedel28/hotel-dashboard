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

import { ApaleoForm } from './pms-provider/-components/apaleo-form';
import { CasablancaForm } from './pms-provider/-components/casablanca-form';

const PROVIDERS: ProviderEntry<'pms'>[] = [
  {
    id: 'casablanca',
    name: 'Casablanca',
    logo: {
      src: '/casablanca-logo.png',
      darkSrc: '/casablanca-logo-inverse.png'
    },
    Form: CasablancaForm
  },
  {
    id: 'apaleo',
    name: 'Apaleo',
    logo: { src: '/apaleo-logo.png', lightInk: true },
    guideUrl: 'https://apaleo.dev',
    Form: ApaleoForm
  },
  // protel has no logo of its own any more: it is sold under Planet's
  { id: 'protel', name: 'protel' },
  { id: 'sihot', name: 'SIHOT', logo: { src: '/sihot-logo.svg' } },
  {
    id: 'oracle_opera',
    name: 'Oracle OPERA',
    logo: { src: '/oracle-logo.svg' }
  }
];

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/pms-provider'
)({
  component: RouteComponent
});

function RouteComponent() {
  const { t } = useLingui();
  useDocumentTitle(t`PMS`);

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
              <Trans>PMS</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-bold">
          <Trans>PMS</Trans>
        </h1>
        <p className="text-sm text-muted-foreground">
          <Trans>
            Manage this property's connection to its property management system.
          </Trans>
        </p>
      </div>

      <ProviderScreens
        kind="pms"
        pickerTitle={<Trans>Choose a property management system</Trans>}
        pickerDescription={
          <Trans>
            Select the system this property is run with. You enter its
            credentials in the next step.
          </Trans>
        }
        providers={PROVIDERS}
      />
    </div>
  );
}
