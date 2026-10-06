'use client';

import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import {
  BuildingIcon,
  HomeIcon,
  LoaderCircleIcon,
  MessageCircleIcon
} from 'lucide-react';
import type { NavItemId } from 'shared/types/properties';

import { ApiError } from '@/api/client';
import {
  propertiesQueryOptions,
  propertyByIdQueryOptions
} from '@/api/properties';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { useCurrentView } from '@/hooks/use-current-view';
import Header from '@/routes/_dashboard-layout/-components/header';
import { isNavPathDisabled } from '@/routes/_dashboard-layout/-components/nav-items';
import {
  SidebarLink,
  UserNavContent
} from '@/routes/_dashboard-layout/-components/sidebar-nav';
import { SidebarViewToggle } from '@/routes/_dashboard-layout/-components/sidebar-view-toggle';

// Sidebar header component
function SidebarHeaderComponent() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarGroup>
          <SidebarMenuItem className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <div className="flex size-6.5 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:scale-95 group-data-[collapsible=icon]:opacity-0 dark:bg-cyan-950 dark:text-cyan-200/90">
              <MessageCircleIcon className="size-4" />
            </div>
            <span className="text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:scale-95 group-data-[collapsible=icon]:opacity-0">
              <Trans>Hotel Dashboard</Trans>
            </span>
            <SidebarTrigger className="ml-auto transition-all duration-200 ease-in-out group-data-[collapsible=icon]:ml-0" />
          </SidebarMenuItem>
        </SidebarGroup>
      </SidebarMenu>
    </SidebarHeader>
  );
}

// Admin sidebar content
function AdminSidebarContent() {
  const { t } = useLingui();

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLink
              to="/admin"
              icon={HomeIcon}
              tooltip={t`Start`}
              activeOptions={{ exact: true }}
            >
              <Trans>Start</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/admin/properties"
              icon={BuildingIcon}
              tooltip={t`Properties`}
            >
              <Trans>Properties</Trans>
            </SidebarLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}

// Main sidebar component
function DashboardSidebar() {
  const currentView = useCurrentView();
  const { t } = useLingui();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeaderComponent />
      <SidebarViewToggle />
      <nav aria-label={t`Main navigation`}>
        {currentView === 'admin' ? (
          <AdminSidebarContent />
        ) : (
          <UserNavContent tooltips />
        )}
      </nav>
    </Sidebar>
  );
}

// Main layout component
function DashboardLayout() {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-primary"
      >
        <Trans>Skip to main content</Trans>
      </a>
      <DashboardSidebar />
      <SidebarInset className="flex h-full min-w-0 flex-col">
        <Header />
        {/* `relative` is load-bearing: without it, absolutely positioned
            descendants (every `sr-only` span, for one) resolve against the
            inset instead of this scroll container, so their offsets inflate
            the shell's scroll height rather than this one's. That gives the
            `overflow-hidden` wrapper a few hundred pixels it can be scrolled
            to — which `scrollIntoView` promptly does, sliding the page under
            the sticky header and clipping its bottom edge. */}
        <main
          id="main-content"
          tabIndex={-1}
          className="relative min-h-0 flex-1 overflow-auto px-3 py-2 pb-4 focus:outline-none md:px-6 md:py-4 md:pb-8"
        >
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Route = createFileRoute('/_dashboard-layout')({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href
        }
      });
    }

    // No selected Property, or one that has since been deleted (404): show
    // every nav item. Any other failure propagates — treating it as "nothing
    // disabled" would open switched-off pages on a transient error.
    const propertyId = context.auth.user?.selected_property_id;
    const disabledNavItems: NavItemId[] = propertyId
      ? await context.queryClient
          .fetchQuery(propertyByIdQueryOptions(propertyId))
          .then((property) => property.disabled_nav_items)
          .catch((error: unknown) => {
            if (error instanceof ApiError && error.status === 404) return [];
            throw error;
          })
      : [];

    if (isNavPathDisabled(location.pathname, disabledNavItems)) {
      throw redirect({ to: '/' });
    }

    return { disabledNavItems };
  },
  // No auth check here: `beforeLoad` above always runs first, and its redirect
  // throws, so an unauthenticated request never reaches this loader.
  loader: async ({ context: { queryClient } }) => {
    const properties = await queryClient.ensureQueryData(
      propertiesQueryOptions()
    );
    return { properties };
  },
  pendingComponent: DashboardPending,
  component: DashboardLayout
});

function DashboardPending() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <MessageCircleIcon className="size-4" />
        </div>
        <span className="text-lg font-semibold">
          <Trans>Hotel Dashboard</Trans>
        </span>
      </div>
      <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
