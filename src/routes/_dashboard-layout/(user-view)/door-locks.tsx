import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';

import { ProviderPage } from '@/components/provider-setup/provider-page';
import type { ProviderEntry } from '@/components/provider-setup/types';

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

  return (
    <ProviderPage
      kind="door_lock"
      title={t`Door Locks`}
      description={
        <Trans>
          Manage this property's connection to its door lock system.
        </Trans>
      }
      pickerTitle={<Trans>Choose a door lock system</Trans>}
      pickerDescription={
        <Trans>
          Select the system this property's doors are locked with. You enter its
          connection details in the next step.
        </Trans>
      }
      providers={PROVIDERS}
    />
  );
}
