'use client';

import { Trans, useLingui } from '@lingui/react/macro';
import {
  createFileRoute,
  Outlet,
  redirect,
  useMatches,
  useRouter
} from '@tanstack/react-router';

import {
  fetchSelectedProperty,
  selectablePropertiesQueryOptions
} from '@/api/properties';
import { FullScreenRouteError } from '@/components/route-state';
import {
  Sidebar,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { viewOf } from '@/hooks/use-current-view';
import Header from '@/routes/_dashboard-layout/-components/header';
import { isNavPathDisabled } from '@/routes/_dashboard-layout/-components/nav-items';
import { DashboardSidebarHeader } from '@/routes/_dashboard-layout/-components/sidebar-header';
import { DashboardNav } from '@/routes/_dashboard-layout/-components/sidebar-nav';
import { SidebarViewToggle } from '@/routes/_dashboard-layout/-components/sidebar-view-toggle';

// Main sidebar component
function DashboardSidebar() {
  const { t } = useLingui();

  return (
    <Sidebar collapsible="icon">
      <DashboardSidebarHeader />
      <SidebarViewToggle />
      {/* A flex child that may shrink, so the menu scrolls inside the
          sidebar instead of running past the bottom of a short screen */}
      <nav
        aria-label={t`Main navigation`}
        className="flex min-h-0 flex-1 flex-col"
      >
        <DashboardNav />
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
        {/* The scrollbar's room is kept on short pages too, so going from a
            long page to a short one doesn't shift everything sideways */}
        <main
          id="main-content"
          tabIndex={-1}
          className="relative min-h-0 flex-1 [scrollbar-gutter:stable] overflow-auto px-3 py-2 pb-4 focus:outline-none md:px-6 md:py-4 md:pb-8"
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

    const selectedProperty = await fetchSelectedProperty(
      context.queryClient,
      context.auth.user?.selected_property_id
    );
    const disabledNavItems = selectedProperty?.disabled_nav_items ?? [];

    if (isNavPathDisabled(location.pathname, disabledNavItems)) {
      throw redirect({ to: '/' });
    }

    return { disabledNavItems, selectedProperty };
  },
  // No auth check here: `beforeLoad` above always runs first, and its redirect
  // throws, so an unauthenticated request never reaches this loader.
  loader: async ({ context: { queryClient }, location }) => {
    // Warms the property selector's list so the header renders with it. The
    // admin area has no selector, so it does not wait for one.
    if (viewOf(location.pathname) === 'user') {
      await queryClient.ensureQueryData(selectablePropertiesQueryOptions());
    }
  },
  pendingComponent: DashboardPending,
  // The layout itself failed, so there is no sidebar to keep: the whole screen
  errorComponent: FullScreenRouteError,
  component: DashboardLayout
});

// The layout's own shape while its data loads (shown only after a second, so a
// fast load never flashes it): the real sidebar frame and header, with
// placeholders where the nav, the property selector and the page will be.
// Nothing moves when the page arrives, unlike a spinner swapped for a screen.
function DashboardPending() {
  const PagePending = usePagePendingComponent();

  return (
    <SidebarProvider className="h-svh overflow-hidden" aria-busy="true">
      <Sidebar collapsible="icon">
        <DashboardSidebarHeader />
        <SidebarGroup>
          <SidebarMenu>
            {Array.from({ length: 8 }, (_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </Sidebar>
      <SidebarInset className="flex h-full min-w-0 flex-col">
        <header className="border-b px-3 md:px-4 md:ps-3.5">
          <div className="flex h-12 items-center justify-between gap-4 pointer-coarse:h-14">
            <Skeleton className="h-8 w-44 pointer-coarse:h-11" />
            <Skeleton className="size-8 rounded-full pointer-coarse:size-11" />
          </div>
        </header>
        <main className="flex flex-col gap-4 px-3 py-2 md:px-6 md:py-4">
          <span className="sr-only">
            <Trans>Loading...</Trans>
          </span>
          {PagePending ? (
            <PagePending />
          ) : (
            <>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-96 w-full rounded-lg" />
            </>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * The pendingComponent of the deepest page under this layout that has one. On
 * a cold load it's this layout that waits, so a page's own skeleton would never
 * get a turn; showing it here gives the page its shape from the first frame.
 */
function usePagePendingComponent() {
  const router = useRouter();
  return useMatches({
    select: (matches) => {
      const own = matches.findIndex((match) => match.routeId === Route.id);
      return matches
        .slice(own + 1)
        .map(
          (match) => router.routesById[match.routeId].options.pendingComponent
        )
        .findLast(Boolean);
    }
  });
}
