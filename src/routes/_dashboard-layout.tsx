'use client';

// import DashboardLayout from '@/layouts/dashboard-layout';
import * as React from 'react';

import { ViewProvider, useView } from '@/contexts/view-context';
import { AutoViewSwitcher } from '@/routes/_dashboard-layout/-components/auto-view-switcher';
import Header from '@/routes/_dashboard-layout/-components/header';
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { Link, LinkProps } from '@tanstack/react-router';
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
import { FormattedMessage, useIntl } from 'react-intl';

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

// Sidebar link component that extends TanStack Router Link props
interface SidebarLinkProps extends LinkProps {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  tooltipKey?: string;
}

function SidebarLink({
  icon: Icon,
  children,
  tooltipKey,
  ...linkProps
}: SidebarLinkProps) {
  const intl = useIntl();
  const tooltipText = tooltipKey
    ? intl.formatMessage({ id: tooltipKey, defaultMessage: 'Menu Item' })
    : undefined;

  return (
    <SidebarMenuButton asChild tooltip={tooltipText}>
      <Link
        activeProps={{ className: '!bg-primary/5' }}
        {...(linkProps as LinkProps)}
      >
        <Icon />
        <span>{children}</span>
      </Link>
    </SidebarMenuButton>
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
            <div className="bg-primary inline-block rounded-md p-1 text-white transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:scale-95 group-data-[collapsible=icon]:opacity-0">
              <MessageCircleIcon className="size-4" />
            </div>
            <span className="text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:scale-95 group-data-[collapsible=icon]:opacity-0">
              <FormattedMessage
                id="app.title"
                defaultMessage="Backoffice Manager"
              />
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
  return (
    <SidebarContent>
      <SidebarMenu>
        <SidebarGroup>
          <SidebarMenuItem>
            <SidebarLink to="/" icon={HomeIcon} tooltipKey="sidebar.start">
              <FormattedMessage id="sidebar.start" defaultMessage="Start" />
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/properties"
              icon={BuildingIcon}
              tooltipKey="sidebar.properties"
            >
              <FormattedMessage
                id="sidebar.properties"
                defaultMessage="Properties"
              />
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/customers"
              icon={UsersIcon}
              tooltipKey="sidebar.customers"
            >
              <FormattedMessage
                id="sidebar.customers"
                defaultMessage="Customers"
              />
            </SidebarLink>
          </SidebarMenuItem>
        </SidebarGroup>
      </SidebarMenu>
    </SidebarContent>
  );
}

// User sidebar content
function UserSidebarContent() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLink to="/" icon={HomeIcon} tooltipKey="sidebar.start">
              <FormattedMessage id="sidebar.start" defaultMessage="Start" />
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/monitoring"
              icon={SquareActivityIcon}
              tooltipKey="sidebar.monitoring"
            >
              <FormattedMessage
                id="sidebar.monitoring"
                defaultMessage="Monitoring"
              />
            </SidebarLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Front Office Section */}
      <SidebarGroup>
        <SidebarGroupLabel>
          <FormattedMessage
            id="sidebar.frontOffice"
            defaultMessage="Front Office"
          />
        </SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLink
              to="/reservations"
              icon={BedDoubleIcon}
              tooltipKey="sidebar.reservations"
            >
              <FormattedMessage
                id="sidebar.reservations"
                defaultMessage="Reservations"
              />
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/registration-forms"
              icon={ListTodoIcon}
              tooltipKey="sidebar.registrationForms"
            >
              <FormattedMessage
                id="sidebar.registrationForms"
                defaultMessage="Registration forms"
              />
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/payments"
              icon={ReceiptTextIcon}
              tooltipKey="sidebar.payments"
            >
              <FormattedMessage
                id="sidebar.payments"
                defaultMessage="Payments"
              />
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/orders"
              icon={ShoppingCartIcon}
              tooltipKey="sidebar.orders"
            >
              <FormattedMessage id="sidebar.orders" defaultMessage="Orders" />
            </SidebarLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Content Manager Section */}
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          <FormattedMessage
            id="sidebar.contentManager"
            defaultMessage="Content Manager"
          />
        </SidebarGroupLabel>
        <SidebarMenu>
          {contentManagerItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarLink
                to={item.url as LinkProps['to']}
                icon={item.icon}
                tooltipKey={`sidebar.contentManager.${item.url.replace('/', '').replace('-', '').replace('cms', 'CMS')}`}
              >
                <FormattedMessage
                  id={`sidebar.contentManager.${item.url.replace('/', '').replace('-', '').replace('cms', 'CMS')}`}
                  defaultMessage="Content Manager Item"
                />
              </SidebarLink>
              {item.url === '/tv' && (
                <SidebarMenuBadge>
                  <ArrowUpRightIcon
                    className="text-muted-foreground/80 size-4"
                    aria-hidden="true"
                  />
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Integrations Section */}
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          <FormattedMessage
            id="sidebar.integrations"
            defaultMessage="Integrations"
          />
        </SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLink
              to="/access-provider"
              icon={LockIcon}
              tooltipKey="sidebar.accessProvider"
            >
              <FormattedMessage
                id="sidebar.accessProvider"
                defaultMessage="Access Provider"
              />
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/pms-provider"
              icon={Grid2X2Icon}
              tooltipKey="sidebar.pmsProvider"
            >
              <FormattedMessage
                id="sidebar.pmsProvider"
                defaultMessage="PMS Provider"
              />
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/payment-provider"
              icon={CreditCardIcon}
              tooltipKey="sidebar.paymentProvider"
            >
              <FormattedMessage
                id="sidebar.paymentProvider"
                defaultMessage="Payment Provider"
              />
            </SidebarLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Settings Section */}
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          <FormattedMessage id="sidebar.settings" defaultMessage="Settings" />
        </SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLink
              to="/company"
              icon={BuildingIcon}
              tooltipKey="sidebar.companyData"
            >
              <FormattedMessage
                id="sidebar.companyData"
                defaultMessage="Company data"
              />
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/checkin-page"
              icon={FileSpreadsheetIcon}
              tooltipKey="sidebar.checkinPage"
            >
              <FormattedMessage
                id="sidebar.checkinPage"
                defaultMessage="Checkin Page"
              />
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/users"
              icon={UsersIcon}
              tooltipKey="sidebar.users"
            >
              <FormattedMessage id="sidebar.users" defaultMessage="Users" />
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/rooms"
              icon={BedSingleIcon}
              tooltipKey="sidebar.rooms"
            >
              <FormattedMessage id="sidebar.rooms" defaultMessage="Rooms" />
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/devices"
              icon={TabletIcon}
              tooltipKey="sidebar.devices"
            >
              <FormattedMessage id="sidebar.devices" defaultMessage="Devices" />
            </SidebarLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}

// Main sidebar component
function DashboardSidebar() {
  const { currentView } = useView();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeaderComponent />
      {currentView === 'admin' ? (
        <AdminSidebarContent />
      ) : (
        <UserSidebarContent />
      )}
    </Sidebar>
  );
}

// Main layout component
export default function DashboardLayout() {
  return (
    <ViewProvider>
      <SidebarProvider>
        <AutoViewSwitcher />
        <DashboardSidebar />
        <SidebarInset className="flex h-full flex-col">
          <Header />
          <main className="flex-1 overflow-auto">
            <section className="px-6 py-4 pb-8">
              <Outlet />
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ViewProvider>
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
  component: DashboardLayout
});
