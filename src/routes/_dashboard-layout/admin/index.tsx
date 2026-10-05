import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, Link } from '@tanstack/react-router';
import { BuildingIcon, UsersIcon } from 'lucide-react';

import { useAuth } from '@/auth';
import { useDocumentTitle } from '@/hooks/use-document-title';

export const Route = createFileRoute('/_dashboard-layout/admin/')({
  component: AdminStartPage
});

function AdminStartPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Admin Dashboard`);
  const auth = useAuth();

  const quickActions = [
    {
      title: t`Properties`,
      description: t`Manage hotel properties, view details, and configure settings`,
      icon: BuildingIcon,
      href: '/admin/properties'
    },
    {
      title: t`Customers`,
      description: t`View and manage customer accounts, profiles, and history`,
      icon: UsersIcon,
      href: '/admin/customers'
    }
  ];

  const userName = auth.user?.first_name;

  return (
    <div>
      <h1 className="text-xl font-semibold">
        <Trans>Admin Dashboard</Trans>
      </h1>
      <p className="text-sm text-muted-foreground md:text-base">
        <Trans>Welcome back, {userName}!</Trans>
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
              <Link to={action.href} className="block space-y-1.5">
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
