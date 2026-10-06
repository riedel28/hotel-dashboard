import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, Link, type LinkProps } from '@tanstack/react-router';
import type { NavItemId } from 'shared/types/properties';

import { useDocumentTitle } from '@/hooks/use-document-title';
import {
  toggleableNavItems,
  useDisabledNavItems
} from '@/routes/_dashboard-layout/-components/nav-items';

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
    .map((card) => {
      const item = toggleableNavItems.find((i) => i.id === card.id)!;
      return {
        title: t(item.label),
        description: card.description,
        icon: item.icon,
        href: item.to,
        search: card.search
      };
    });

  const userName = auth.user?.first_name;

  return (
    <div>
      <h1 className="text-xl font-semibold">
        <Trans>Welcome back, {userName}!</Trans>
      </h1>
      <p className="text-sm text-muted-foreground md:text-base">
        <Trans>Manage your hotel operations efficiently</Trans>
      </p>

      {/* Quick Actions Grid */}
      <div className="mt-5 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {quickActions.map((action) => {
          const IconComponent = action.icon;

          return (
            <div
              key={action.href}
              className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-none transition-all duration-200 hover:border-border hover:bg-accent/30 hover:shadow-xs dark:hover:bg-card/85"
            >
              <Link
                to={action.href}
                search={action.search}
                className="block space-y-1.5"
              >
                <div className="w-fit rounded-lg bg-accent p-2 md:p-2">
                  <IconComponent className="size-4 text-accent-foreground md:size-4" />
                </div>
                <h3 className="text-base font-semibold md:text-lg">
                  {action.title}
                </h3>
                <p className="text-xs text-balance text-muted-foreground md:text-sm">
                  {action.description}
                </p>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
