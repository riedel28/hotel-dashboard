'use client';

import * as React from 'react';

import { ViewProvider, useView } from '@/contexts/view-context';
import { AutoViewSwitcher } from '@/layouts/dashboard-layout/auto-view-switcher';
import Header from '@/layouts/dashboard-layout/header';
import { Link } from '@tanstack/react-router';
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
import { FormattedMessage } from 'react-intl';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar';

// Sample data for content manager items
const contentManagerItems = [
  {
    name: 'sidebar.contentManager.mobileCMS',
    url: '/mobile-cms',
    icon: SmartphoneIcon
  },
  {
    name: 'sidebar.contentManager.tv',
    url: '/tv',
    icon: TvIcon
  },
  {
    name: 'sidebar.contentManager.products',
    url: '/products',
    icon: ShoppingBagIcon
  },
  {
    name: 'sidebar.contentManager.events',
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
            <SidebarMenuButton asChild>
              <Link to="/">
                <HomeIcon />
                <span>
                  <FormattedMessage id="sidebar.start" defaultMessage="Start" />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/properties">
                <BuildingIcon />
                <span>
                  <FormattedMessage
                    id="sidebar.properties"
                    defaultMessage="Properties"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/customers">
                <UsersIcon />
                <span>
                  <FormattedMessage
                    id="sidebar.customers"
                    defaultMessage="Customers"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
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
      <SidebarMenu>
        <SidebarGroup>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <HomeIcon />
                <span>
                  <FormattedMessage id="sidebar.start" defaultMessage="Start" />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/monitoring">
                <SquareActivityIcon />
                <span>
                  <FormattedMessage
                    id="sidebar.monitoring"
                    defaultMessage="Monitoring"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>
      </SidebarMenu>

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
            <SidebarMenuButton asChild>
              <Link to="/reservations" search={{ page: 1, per_page: 10 }}>
                <BedDoubleIcon />
                <span>
                  <FormattedMessage
                    id="sidebar.reservations"
                    defaultMessage="Reservations"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/registration-forms">
                <ListTodoIcon />
                <span>
                  <FormattedMessage
                    id="sidebar.registrationForms"
                    defaultMessage="Registration forms"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/payments">
                <ReceiptTextIcon />
                <span>
                  <FormattedMessage
                    id="sidebar.payments"
                    defaultMessage="Payments"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/orders">
                <ShoppingCartIcon />
                <span>
                  <FormattedMessage
                    id="sidebar.orders"
                    defaultMessage="Orders"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
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
              <SidebarMenuButton asChild>
                <Link to={item.url}>
                  <item.icon />
                  <span>
                    <FormattedMessage
                      id={`sidebar.contentManager.${item.url.replace('/', '').replace('-', '').replace('cms', 'CMS')}`}
                      defaultMessage="Content Manager Item"
                    />
                  </span>
                </Link>
              </SidebarMenuButton>
              {item.url === '/tv' && (
                <SidebarMenuAction>
                  <ArrowUpRightIcon className="text-muted-foreground/80" />
                  <span className="sr-only">
                    <FormattedMessage
                      id="common.externalLink"
                      defaultMessage="External link"
                    />
                  </span>
                </SidebarMenuAction>
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
            <SidebarMenuButton asChild>
              <Link to="/access-provider">
                <LockIcon />
                <span>
                  <FormattedMessage
                    id="sidebar.accessProvider"
                    defaultMessage="Access Provider"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/pms-provider">
                <Grid2X2Icon />
                <span>
                  <FormattedMessage
                    id="sidebar.pmsProvider"
                    defaultMessage="PMS Provider"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/payment-provider">
                <CreditCardIcon />
                <span>
                  <FormattedMessage
                    id="sidebar.paymentProvider"
                    defaultMessage="Payment Provider"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
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
            <SidebarMenuButton asChild>
              <Link to="/company">
                <BuildingIcon />
                <span>
                  <FormattedMessage
                    id="sidebar.companyData"
                    defaultMessage="Company data"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/checkin-page">
                <FileSpreadsheetIcon />
                <span>
                  <FormattedMessage
                    id="sidebar.checkinPage"
                    defaultMessage="Checkin Page"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/users">
                <UsersIcon />
                <span>
                  <FormattedMessage id="sidebar.users" defaultMessage="Users" />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/rooms">
                <BedSingleIcon />
                <span>
                  <FormattedMessage id="sidebar.rooms" defaultMessage="Rooms" />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/devices">
                <TabletIcon />
                <span>
                  <FormattedMessage
                    id="sidebar.devices"
                    defaultMessage="Devices"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
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
      <SidebarRail />
    </Sidebar>
  );
}

// Main layout component
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewProvider>
      <SidebarProvider>
        <AutoViewSwitcher />
        <DashboardSidebar />
        <SidebarInset className="flex h-full flex-col">
          <Header />
          <main className="flex-1 overflow-auto">
            <section className="px-6 py-4 pb-8">{children}</section>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ViewProvider>
  );
}
