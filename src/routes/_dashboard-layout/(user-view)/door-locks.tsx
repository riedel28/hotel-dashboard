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

import { SaltoForm } from './door-locks/-components/salto-form';

const PROVIDERS: ProviderEntry<'door_lock'>[] = [
  {
    id: 'salto',
    name: 'SALTO',
    logo: { src: '/salto-logo.svg', darkSrc: '/salto-logo-inverse.svg' },
    // SALTO's interface documentation is for partners: its site stands in
    guideUrl: 'https://saltosystems.com',
    Form: SaltoForm
  },
  {
    id: 'assa_abloy',
    name: 'ASSA ABLOY',
    logo: { src: '/assa-abloy-logo.svg' }
  },
  { id: 'dormakaba', name: 'dormakaba', logo: { src: '/dormakaba-logo.svg' } },
  { id: 'haefele', name: 'Häfele', logo: { src: '/haefele-logo.svg' } }
];

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/door-locks'
)({
  component: RouteComponent
});

function RouteComponent() {
  const { t } = useLingui();
  useDocumentTitle(t`Door Locks`);

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
              <Trans>Door Locks</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-bold">
          <Trans>Door Locks</Trans>
        </h1>
        <p className="text-sm text-muted-foreground">
          <Trans>
            Manage this property's connection to its door lock system.
          </Trans>
        </p>
      </div>

      <ProviderScreens
        kind="door_lock"
        pickerTitle={<Trans>Choose a door lock system</Trans>}
        pickerDescription={
          <Trans>
            Select the system this property's doors are locked with. You enter
            its connection details in the next step.
          </Trans>
        }
        providers={PROVIDERS}
      />
    </div>
  );
}
