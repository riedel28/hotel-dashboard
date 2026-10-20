import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, Link, type LinkProps } from '@tanstack/react-router';
import { ChevronRightIcon } from 'lucide-react';
import type { NavItemId } from 'shared/types/properties';

import { PageHeader } from '@/components/page-header';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { navItems } from '@/routes/_dashboard-layout/-components/nav-items';
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
      href: navItems[id].to,
      search
    }));

  const userName = auth.user?.first_name;

  return (
    <div>
      <PageHeader
        title={<Trans>Welcome back, {userName}!</Trans>}
        description={<Trans>Manage your hotel operations efficiently</Trans>}
      />

      {/* Quick Actions Grid */}
      <div className="grid max-w-4xl grid-cols-1 gap-3 md:gap-6 lg:grid-cols-2">
        {quickActions.map((action) => {
          const IconComponent = action.icon;

          // The whole card is the link. On a phone it is a compact row with
          // a chevron, so all of them fit on the first screen; from md up the
          // icon sits above the title.
          return (
            <Link
              key={action.href}
              to={action.href}
              search={action.search}
              className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-none transition-all duration-200 outline-none hover:border-border hover:bg-accent/30 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-primary active:bg-accent/30 md:block md:space-y-1.5 md:p-5 dark:hover:bg-card/85"
            >
              <div className="w-fit shrink-0 rounded-lg bg-accent p-2 transition-colors group-hover:bg-primary-soft">
                <IconComponent className="size-4 text-accent-foreground transition-colors group-hover:text-primary-soft-foreground" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5 md:space-y-1.5">
                <h3 className="text-base font-semibold md:text-lg">
                  {action.title}
                </h3>
                <p className="text-sm text-pretty text-muted-foreground md:text-balance">
                  {action.description}
                </p>
              </div>
              <ChevronRightIcon
                className="size-4 shrink-0 self-center text-muted-foreground md:hidden"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
