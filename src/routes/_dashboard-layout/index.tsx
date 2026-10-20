import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, type LinkProps } from '@tanstack/react-router';
import type { NavItemId } from 'shared/types/properties';

import { PageHeader } from '@/components/page-header';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { navItems } from '@/routes/_dashboard-layout/-components/nav-items';
import { QuickActions } from '@/routes/_dashboard-layout/-components/quick-actions';
import { useDisabledNavItems } from '@/routes/_dashboard-layout/-components/sidebar-nav';

import { useAuth } from '../../auth';

export const Route = createFileRoute('/_dashboard-layout/')({
  component: StartPage
});

function StartPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Dashboard`);
  const auth = useAuth();
  const disabledNavItems = useDisabledNavItems();

  // Cards are nav items from the shared catalog, so a nav item switched off
  // for the selected Property loses its card too.
  const cards: {
    id: NavItemId;
    description: string;
    search?: LinkProps['search'];
  }[] = [
    {
      id: 'reservations',
      description: t`View and manage guest reservations, check-ins, and booking details`,
      search: { page: 1, per_page: 10 }
    },
    {
      id: 'rooms',
      description: t`Manage room inventory, availability, and room type configurations`
    },
    {
      id: 'users',
      description: t`Manage users, view user details, and assign roles`
    },
    {
      id: 'monitoring',
      description: t`Monitor daily operations, track occupancy, and oversee front-office activity`
    }
  ];

  const quickActions = cards
    .filter((card) => !disabledNavItems.includes(card.id))
    .map(({ id, description, search }) => ({
      title: t(navItems[id].label),
      description,
      icon: navItems[id].icon,
      to: navItems[id].to,
      search
    }));

  const userName = auth.user?.first_name;

  return (
    <div>
      <PageHeader
        title={<Trans>Welcome back, {userName}!</Trans>}
        description={<Trans>Manage your hotel operations efficiently</Trans>}
      />

      <QuickActions actions={quickActions} />
    </div>
  );
}
