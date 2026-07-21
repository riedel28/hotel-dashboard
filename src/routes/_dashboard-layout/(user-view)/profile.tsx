import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import {
  CameraIcon,
  ChevronRightIcon,
  LockIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn, getUserInitials } from '@/lib/utils';
import { profileUserData } from './profile/-components/profile-data';

export const Route = createFileRoute('/_dashboard-layout/(user-view)/profile')({
  component: RouteComponent
});

const profileNavigation = [
  {
    id: 'personal',
    to: '/profile/personal',
    icon: UserIcon
  },
  {
    id: 'password',
    to: '/profile/password',
    icon: LockIcon
  },
  {
    id: 'roles',
    to: '/profile/roles',
    icon: UsersIcon
  },
  {
    id: 'avatar',
    to: '/profile/avatar',
    icon: CameraIcon
  },
  {
    id: 'twoFactor',
    to: '/profile/two-factor',
    icon: ShieldIcon
  }
] as const;

type ProfileNavigationId = (typeof profileNavigation)[number]['id'];

function RouteComponent() {
  const { t } = useLingui();
  useDocumentTitle(t`Profile`);

  const userInitials = getUserInitials(
    profileUserData.firstName,
    profileUserData.lastName
  );

  return (
    <div className="space-y-6">
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
        <h1 className="text-xl font-bold">
          <Trans>Profile</Trans>
        </h1>
      </div>

      <div className="rounded-lg border bg-gradient-to-br from-background via-background to-muted/50 p-4 shadow-xs md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-16 border border-border">
              <AvatarImage
                src={profileUserData.avatar || undefined}
                alt={t`Profile picture`}
              />
              <AvatarFallback className="text-base font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">
                {profileUserData.firstName} {profileUserData.lastName}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {profileUserData.email}
              </p>
            </div>
          </div>
          <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
            <Trans>Account settings</Trans>
          </div>
        </div>
      </div>

      <div className="grid w-full gap-4 md:gap-6 lg:grid-cols-[300px_1fr]">
        <nav
          aria-label={t`Profile sections`}
          className="grid gap-2 self-start sm:grid-cols-2 lg:grid-cols-1"
        >
          {profileNavigation.map((item) => (
            <ProfileNavigationLink key={item.id} item={item} />
          ))}
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function ProfileNavigationLink({
  item
}: {
  item: (typeof profileNavigation)[number];
}) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={cn(
        'group flex min-h-16 items-center gap-3 rounded-lg border bg-background p-3 text-left text-foreground shadow-xs outline-none transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        '[&.active]:border-primary/40 [&.active]:bg-primary/10 [&.active]:text-cyan-900 dark:[&.active]:bg-primary/20 dark:[&.active]:text-cyan-100'
      )}
      activeProps={{ className: 'active' }}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground transition-colors group-[.active]:border-primary/30 group-[.active]:bg-background group-[.active]:text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">
          <ProfileNavigationLabel id={item.id} />
        </span>
        <span className="block text-xs leading-5 text-muted-foreground">
          <ProfileNavigationDescription id={item.id} />
        </span>
      </span>
      <ChevronRightIcon
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

function ProfileNavigationLabel({ id }: { id: ProfileNavigationId }) {
  switch (id) {
    case 'personal':
      return <Trans>Personal</Trans>;
    case 'password':
      return <Trans>Password</Trans>;
    case 'roles':
      return <Trans>Roles</Trans>;
    case 'avatar':
      return <Trans>Avatar</Trans>;
    case 'twoFactor':
      return <Trans>Two Factor</Trans>;
  }
}

function ProfileNavigationDescription({ id }: { id: ProfileNavigationId }) {
  switch (id) {
    case 'personal':
      return <Trans>Name and contact details</Trans>;
    case 'password':
      return <Trans>Password and sign-in access</Trans>;
    case 'roles':
      return <Trans>Role assignments</Trans>;
    case 'avatar':
      return <Trans>Profile image</Trans>;
    case 'twoFactor':
      return <Trans>Extra account security</Trans>;
  }
}
