import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ActivityIcon,
  BedDoubleIcon,
  DoorOpenIcon,
  UsersIcon
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useAuth } from '../../auth';

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
      description: t`View and manage guest reservations, check-ins, and booking details`,
      icon: BedDoubleIcon,
      href: '/reservations',
      search: { page: 1, per_page: 10 }
    },
    {
      title: t`Rooms`,
      description: t`Manage room inventory, availability, and room type configurations`,
      icon: DoorOpenIcon,
      href: '/rooms'
    },
    {
      title: t`Users`,
      description: t`Manage users, view user details, and assign roles`,
      icon: UsersIcon,
      href: '/users'
    },
    {
      title: t`Monitoring`,
      description: t`Monitor daily operations, track occupancy, and oversee front-office activity`,
      icon: ActivityIcon,
      href: '/monitoring'
    }
  ];

  const userName = auth.user?.first_name;

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-semibold">
        <Trans>Welcome back, {userName}!</Trans>
      </h1>
      <p className="text-sm md:text-lg text-muted-foreground">
        <Trans>Manage your hotel operations efficiently</Trans>
      </p>

      {/* Quick Actions Grid */}
      <div className="mt-5 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {quickActions.map(action => {
          const IconComponent = action.icon;

          return (
            <div
              key={action.href}
              className="group hover:bg-accent/30 dark:hover:bg-card/85 bg-card p-5 rounded-xl cursor-pointer border border-border shadow-none transition-all duration-200 hover:border-border hover:shadow-xs"
            >
              <Link
                to={action.href}
                search={action.search}
                className="block space-y-1.5"
              >
                <div className="w-fit rounded-lg bg-accent md:p-2 p-2">
                  <IconComponent className="md:size-4 size-4 text-accent-foreground" />
                </div>
                <h3 className="md:text-lg text-base font-semibold">
                  {action.title}
                </h3>
                <p className="md:text-sm text-xs text-muted-foreground text-balance">
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
