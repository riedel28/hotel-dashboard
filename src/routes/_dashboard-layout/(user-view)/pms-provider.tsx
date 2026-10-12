import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';

import { ProviderPage } from '@/components/provider-setup/provider-page';
import type { ProviderEntry } from '@/components/provider-setup/types';

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
    // Casablanca publishes no API documentation: its site stands in for it
    guideUrl: 'https://www.casablanca.at',
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

  return (
    <ProviderPage
      kind="pms"
      title={t`PMS`}
      description={
        <Trans>
          Manage this property's connection to its property management system.
        </Trans>
      }
      pickerTitle={<Trans>Choose a property management system</Trans>}
      pickerDescription={
        <Trans>
          Select the system this property is run with. You enter its credentials
          in the next step.
        </Trans>
      }
      providers={PROVIDERS}
    />
  );
}
