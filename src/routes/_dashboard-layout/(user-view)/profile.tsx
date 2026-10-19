import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  Link,
  type LinkProps,
  Outlet
} from '@tanstack/react-router';
import { WifiOffIcon } from 'lucide-react';

import { meQueryOptions, twoFactorStatusQueryOptions } from '@/api/profile';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { useDocumentTitle, useOnlineStatus } from '@/hooks';

export const Route = createFileRoute('/_dashboard-layout/(user-view)/profile')({
  component: RouteComponent,
  loader: ({ context }) => {
    // Not awaited: only the nav's two-factor dot and that one tab need it, but
    // started here so it isn't queued behind /users/me.
    void context.queryClient.prefetchQuery(twoFactorStatusQueryOptions());
    return context.queryClient.ensureQueryData(meQueryOptions());
  }
});

/**
 * One card per tab, each its own route. The four blocks are separate
 * transactions — editing a name, re-authenticating to change a password,
 * pairing a device, reading roles — so they don't share a scroll the way the
 * fields of a single form do.
 */
function RouteComponent() {
  const { t } = useLingui();
  useDocumentTitle(t`My profile`);
  const isOnline = useOnlineStatus();

  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Trans>Profile</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-6">
        <PageHeader
          title={<Trans>Profile</Trans>}
          description={
            <Trans>
              Manage your personal details, security and access rights.
            </Trans>
          }
        />

        {!isOnline && (
          <Alert variant="warning" role="status">
            <WifiOffIcon aria-hidden="true" />
            <AlertDescription>
              <Trans>
                You're offline. Your changes are kept here and can be saved once
                you're back online.
              </Trans>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <ProfileNav />
          {/* Capped rather than full-bleed: a form line longer than about
              720px is measurably harder to read. */}
          <div className="min-w-0 flex-1 lg:max-w-2xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

// Important, because the item's own grey text and bare hover are classes on
// the same element.
const activeProps = {
  className: 'bg-muted! text-foreground! hover:bg-muted!'
};

/**
 * The tabs: bare sidebar menu items, with no panel behind them. A row that
 * scrolls sideways below `lg`, a column beside the card from `lg` up.
 */
function ProfileNav() {
  const { t } = useLingui();
  // Not suspended: the dot is a nudge, and the nav shouldn't wait for it.
  const { data: twoFactor } = useQuery(twoFactorStatusQueryOptions());

  const items: {
    to: NonNullable<LinkProps['to']>;
    label: string;
    exact?: boolean;
    warn?: boolean;
  }[] = [
    { to: '/profile', label: t`Personal details`, exact: true },
    { to: '/profile/password', label: t`Password` },
    {
      to: '/profile/two-factor',
      label: t`Two-factor auth`,
      // Behind a tab, 2FA is easy never to see, and people don't enable what
      // they never see — so the tab itself says when it's off.
      warn: twoFactor?.enabled === false
    },
    { to: '/profile/roles', label: t`Roles & access` }
  ];

  return (
    <nav aria-label={t`Profile`} className="shrink-0 lg:w-50">
      <SidebarMenu className="scrollbar-none flex-row overflow-x-auto lg:flex-col [&::-webkit-scrollbar]:hidden">
        {items.map(({ to, label, exact, warn }) => (
          <SidebarMenuItem key={to} className="shrink-0">
            <SidebarMenuButton
              // Grey until hovered, then only the text lights up; the grey
              // backdrop is the active tab's alone.
              className="px-3 text-muted-foreground hover:bg-transparent hover:text-foreground active:bg-transparent"
              render={
                <Link
                  to={to}
                  activeOptions={exact ? { exact: true } : undefined}
                  activeProps={activeProps}
                >
                  <span>{label}</span>
                  {warn && (
                    <span className="ms-auto size-1.5 shrink-0 rounded-full bg-warning">
                      <span className="sr-only">
                        <Trans>Off</Trans>
                      </span>
                    </span>
                  )}
                </Link>
              }
            />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
