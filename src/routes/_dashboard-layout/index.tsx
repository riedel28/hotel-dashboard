import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  BedDoubleIcon,
  ListTodoIcon,
  ReceiptTextIcon,
  UsersIcon
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useAuth } from '../../auth';
import { Card, CardDescription, CardTitle } from '../../components/ui/card';

export const Route = createFileRoute('/_dashboard-layout/')({
  component: StartPage
});

function StartPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Dashboard`);
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
      title: t`Users`,
      description: t`Manage users, view user details, and manage user roles`,
      icon: UsersIcon,
      href: '/users'
    }
  ];

  const userName = auth.user?.first_name;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-bold">
          <Trans>Welcome back, {userName}!</Trans>
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground">
          <Trans>Manage your hotel operations efficiently</Trans>
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
              <Link
                to={action.href}
                search={action.search}
                className="block md:p-6 p-4"
              >
                <div className="mb-2 space-y-2">
                  <div className="w-fit rounded-lg bg-muted dark:bg-primary/30 md:p-3 p-2">
                    <IconComponent className="md:size-5 size-4 text-primary dark:text-blue-300" />
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
