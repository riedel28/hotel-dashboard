import { Link, createFileRoute } from '@tanstack/react-router';
import {
  BedDoubleIcon,
  ListTodoIcon,
  ReceiptTextIcon,
  ShoppingCartIcon
} from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import { useAuth } from '../../auth';
import { Card, CardDescription, CardTitle } from '../../components/ui/card';
import ViewAwareContent from '../../layouts/dashboard-layout/view-aware-content';

export const Route = createFileRoute('/_dashboard-layout/')({
  component: StartPage
});

function StartPage() {
  const auth = useAuth();

  const quickActions = [
    {
      title: 'dashboard.quickActions.reservations.title',
      description: 'dashboard.quickActions.reservations.description',
      icon: BedDoubleIcon,
      href: '/reservations',
      search: { page: 1, per_page: 10 }
    },
    {
      title: 'dashboard.quickActions.registrationForms.title',
      description: 'dashboard.quickActions.registrationForms.description',
      icon: ListTodoIcon,
      href: '/registration-forms'
    },
    {
      title: 'dashboard.quickActions.payments.title',
      description: 'dashboard.quickActions.payments.description',
      icon: ReceiptTextIcon,
      href: '/payments'
    },
    {
      title: 'dashboard.quickActions.orders.title',
      description: 'dashboard.quickActions.orders.description',
      icon: ShoppingCartIcon,
      href: '/orders'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          <FormattedMessage
            id="dashboard.welcomeTitle"
            defaultMessage="Welcome back, {email}!"
            values={{ email: auth.user?.firstName ?? 'Guest' }}
          />
        </h1>
        <p className="text-muted-foreground text-lg">
          <FormattedMessage
            id="dashboard.welcomeSubtitle"
            defaultMessage="Manage your hotel operations efficiently"
          />
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
                    <FormattedMessage
                      id={action.title}
                      defaultMessage="Quick Action"
                    />
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mb-2text-sm leading-relaxed">
                    <FormattedMessage
                      id={action.description}
                      defaultMessage="Manage this section"
                    />
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
