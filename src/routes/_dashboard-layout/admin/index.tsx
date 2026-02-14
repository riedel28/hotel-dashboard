import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, Link } from '@tanstack/react-router';
import { BuildingIcon, UsersIcon } from 'lucide-react';

import { useAuth } from '@/auth';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-bold">
          <Trans>Admin Dashboard</Trans>
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground">
          <Trans>Welcome back, {userName}!</Trans>
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {quickActions.map((action) => {
          const IconComponent = action.icon;

          return (
            <Card
              key={action.href}
              className="group cursor-pointer border-border p-0 shadow-none transition-all duration-200 hover:border-border hover:shadow-sm"
            >
              <Link to={action.href} className="block md:p-6 p-4">
                <div className="mb-2 space-y-2">
                  <div className="w-fit rounded-lg bg-muted md:p-3 p-2">
                    <IconComponent className="md:size-5 size-4 text-primary" />
                  </div>
                  <CardTitle className="md:text-lg text-base font-semibold">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="md:text-sm text-xs leading-relaxed text-muted-foreground text-balance">
                    {action.description}
                  </CardDescription>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
