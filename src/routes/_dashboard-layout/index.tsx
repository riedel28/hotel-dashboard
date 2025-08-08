import { Trans, useLingui } from '@lingui/react/macro';
import { Link, createFileRoute } from '@tanstack/react-router';
import {
  BedDoubleIcon,
  ListTodoIcon,
  ReceiptTextIcon,
  ShoppingCartIcon
} from 'lucide-react';

import { useAuth } from '../../auth';
import { Card, CardDescription, CardTitle } from '../../components/ui/card';
import ViewAwareContent from './-components/view-aware-content';

export const Route = createFileRoute('/_dashboard-layout/')({
  component: StartPage
});

function StartPage() {
  const { t } = useLingui();
  const auth = useAuth();

  const quickActions = [
    {
      title: t`Reservations`,
      description: t`Create and manage registration forms, track submissions, and customize check-in processes`,
      icon: BedDoubleIcon,
      href: '/reservations',
      search: { page: 1, per_page: 10 }
    },
    {
      title: t`Registration Forms`,
      description: t`Create and manage registration forms, track submissions, and customize check-in processes`,
      icon: ListTodoIcon,
      href: '/registration-forms'
    },
    {
      title: t`Payments`,
      description: t`Process payments, view transaction history, manage billing, and handle refunds`,
      icon: ReceiptTextIcon,
      href: '/payments'
    },
    {
      title: t`Orders`,
      description: t`Manage orders, track shipments, view order history, and process returns efficiently`,
      icon: ShoppingCartIcon,
      href: '/orders'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          <Trans>Welcome back, {auth.user?.firstName}!</Trans>
        </h1>
        <p className="text-muted-foreground text-lg">
          <Trans>Manage your hotel operations efficiently</Trans>
        </p>
      </div>

      {/* View Switching Demo */}
      <ViewAwareContent />

      {/* Quick Actions Grid */}
      <div className="grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {quickActions.map((action) => {
          const IconComponent = action.icon;

          return (
            <Card
              key={action.href}
              className="border-border hover:border-border group cursor-pointer p-0 shadow-none transition-all duration-200 hover:shadow-sm"
            >
              <Link
                to={action.href}
                search={action.search}
                className="block p-6"
              >
                <div className="mb-2">
                  <div className="bg-muted mb-3 w-fit rounded-lg p-3">
                    <IconComponent className="text-muted-foreground size-5" />
                  </div>
                  <CardTitle className="mb-1 text-lg font-semibold">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mb-2text-sm leading-relaxed">
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
