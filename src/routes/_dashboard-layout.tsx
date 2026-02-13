'use client';

import { Trans, useLingui } from '@lingui/react/macro';
import {
  createFileRoute,
  Link,
  type LinkProps,
  Outlet,
  redirect
} from '@tanstack/react-router';
import {
  ArrowUpRightIcon,
  BedDoubleIcon,
  BedSingleIcon,
  BuildingIcon,
  CalendarIcon,
  CreditCardIcon,
  FileSpreadsheetIcon,
  Grid2X2Icon,
  HomeIcon,
  ListTodoIcon,
  LockIcon,
  MessageCircleIcon,
  ReceiptTextIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SmartphoneIcon,
  SquareActivityIcon,
  TabletIcon,
  TvIcon,
  UsersIcon
} from 'lucide-react';
import * as React from 'react';
import { propertiesQueryOptions } from '@/api/properties';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { useCurrentView } from '@/hooks/use-current-view';
import Header from '@/routes/_dashboard-layout/-components/header';
import { SidebarViewToggle } from '@/routes/_dashboard-layout/-components/sidebar-view-toggle';

interface SidebarLinkProps extends LinkProps {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  tooltip?: string;
}

function SidebarLink({
  icon: Icon,
  children,
  tooltip,
  ...linkProps
}: SidebarLinkProps) {
  return (
    <SidebarMenuButton
      tooltip={tooltip}
      render={
        <Link
          activeProps={{ className: '!bg-primary/5' }}
          {...(linkProps as LinkProps)}
        >
          <Icon />
          <span>{children}</span>
        </Link>
      }
    />
  );
}

// Sample data for content manager items
const contentManagerItems = [
  {
    name: 'Mobile CMS',
    url: '/mobile-cms',
    icon: SmartphoneIcon
  },
  {
    name: 'TV',
    url: '/tv',
    icon: TvIcon
  },
  {
    name: 'Products',
    url: '/products',
    icon: ShoppingBagIcon
  },
  {
    name: 'Events',
    url: '/events',
    icon: CalendarIcon
  }
];

// Sidebar header component
function SidebarHeaderComponent() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarGroup>
          <SidebarMenuItem className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <div className="inline-block rounded-md bg-primary p-1 text-white transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:scale-95 group-data-[collapsible=icon]:opacity-0">
              <MessageCircleIcon className="size-4" />
            </div>
            <span className="text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:scale-95 group-data-[collapsible=icon]:opacity-0">
              <Trans>Backoffice Manager</Trans>
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

// User sidebar content
function UserSidebarContent() {
  const { t } = useLingui();

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLink
              to="/"
              icon={HomeIcon}
              tooltip={t`Start`}
              activeOptions={{ exact: true }}
            >
              <Trans>Start</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/monitoring"
              icon={SquareActivityIcon}
              tooltip={t`Monitoring`}
            >
              <Trans>Monitoring</Trans>
            </SidebarLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Front Office Section */}
      <SidebarGroup>
        <SidebarGroupLabel>
          <Trans>Front Office</Trans>
        </SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLink
              to="/reservations"
              icon={BedDoubleIcon}
              tooltip={t`Reservations`}
            >
              <Trans>Reservations</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink to="/users" icon={UsersIcon} tooltip={t`Users`}>
              <Trans>Users</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          {/* <SidebarMenuItem>
            <SidebarLink
              to="/registration-forms"
              icon={ListTodoIcon}
              tooltip={t`Registration forms`}
            >
              <Trans>Registration forms</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/payments"
              icon={ReceiptTextIcon}
              tooltip={t`Payments`}
            >
              <Trans>Payments</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/orders"
              icon={ShoppingCartIcon}
              tooltip={t`Orders`}
            >
              <Trans>Orders</Trans>
            </SidebarLink>
          </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarGroup>

      {/* Content Manager Section */}
      {/* <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          <Trans>Content Manager</Trans>
        </SidebarGroupLabel>
        <SidebarMenu>
          {contentManagerItems.map((item) => {
            const getItemLabel = (url: string) => {
              switch (url) {
                case '/mobile-cms':
                  return <Trans>Mobile App</Trans>;
                case '/tv':
                  return <Trans>TV App</Trans>;
                case '/products':
                  return <Trans>Products</Trans>;
                case '/events':
                  return <Trans>Events</Trans>;
                default:
                  return item.name;
              }
            };
            const getItemTooltip = (url: string) => {
              switch (url) {
                case '/mobile-cms':
                  return t`Mobile App`;
                case '/tv':
                  return t`TV App`;
                case '/products':
                  return t`Products`;
                case '/events':
                  return t`Events`;
                default:
                  return item.name;
              }
            };

            return (
              <SidebarMenuItem key={item.name}>
                <SidebarLink
                  to={item.url as LinkProps['to']}
                  icon={item.icon}
                  tooltip={getItemTooltip(item.url)}
                >
                  {getItemLabel(item.url)}
                </SidebarLink>
                {item.url === '/tv' && (
                  <SidebarMenuBadge>
                    <ArrowUpRightIcon
                      className="size-4 text-muted-foreground/80"
                      aria-hidden="true"
                    />
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup> */}

      {/* Integrations Section */}
      {/* <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          <Trans>Integrations</Trans>
        </SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLink
              to="/access-provider"
              icon={LockIcon}
              tooltip={t`Access Provider`}
            >
              <Trans>Access Provider</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/pms-provider"
              icon={Grid2X2Icon}
              tooltip={t`PMS Provider`}
            >
              <Trans>PMS Provider</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/payment-provider"
              icon={CreditCardIcon}
              tooltip={t`Payment Provider`}
            >
              <Trans>Payment Provider</Trans>
            </SidebarLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup> */}

      {/* Settings Section */}
      {/* <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          <Trans>Settings</Trans>
        </SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLink
              to="/company"
              icon={BuildingIcon}
              tooltip={t`Company data`}
            >
              <Trans>Company data</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/checkin-page"
              icon={FileSpreadsheetIcon}
              tooltip={t`Checkin Page`}
            >
              <Trans>Checkin Page</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink to="/users" icon={UsersIcon} tooltip={t`Users`}>
              <Trans>Users</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink to="/rooms" icon={BedSingleIcon} tooltip={t`Rooms`}>
              <Trans>Rooms</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink to="/devices" icon={TabletIcon} tooltip={t`Devices`}>
              <Trans>Devices</Trans>
            </SidebarLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup> */}
    </SidebarContent>
  );
}

// Main sidebar component
function DashboardSidebar() {
  const currentView = useCurrentView();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeaderComponent />
      <SidebarViewToggle />
      {currentView === 'admin' ? (
        <AdminSidebarContent />
      ) : (
        <UserSidebarContent />
      )}
    </Sidebar>
  );
}

// Main layout component
function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="flex h-full min-w-0 flex-col">
        <Header />
        <main className="flex-1 overflow-auto px-4 py-2 pb-4 md:px-6 md:py-4 md:pb-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Route = createFileRoute('/_dashboard-layout')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href
        }
      });
    }
  },
  loader: async ({ context: { auth, queryClient }, location }) => {
    // Double-check authentication before making API call
    // This prevents the loader from running if auth check in beforeLoad somehow fails
    if (!auth.isAuthenticated) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href
        }
      });
    }
    const properties = await queryClient.ensureQueryData(
      propertiesQueryOptions()
    );
    return { properties };
  },
  component: DashboardLayout
});
