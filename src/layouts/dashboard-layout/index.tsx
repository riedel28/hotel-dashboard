'use client';

import * as React from 'react';

import { useAuth } from '@/auth';
import { useIntlContext } from '@/i18n/intl-provider';
import { Link } from '@tanstack/react-router';
import {
  ArrowUpRightIcon,
  BedDoubleIcon,
  BedSingleIcon,
  BuildingIcon,
  CalendarIcon,
  ChevronsUpDown,
  ConciergeBell,
  CreditCardIcon,
  FileSpreadsheetIcon,
  Grid2X2Icon,
  HomeIcon,
  ListTodoIcon,
  LockIcon,
  LogOut,
  MessageCircleIcon,
  ReceiptTextIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SmartphoneIcon,
  SquareActivityIcon,
  TabletIcon,
  TvIcon,
  User,
  UsersIcon
} from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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

import LanguageSwitcher from './language-switcher';
import PropertySelector from './property-selector';

// This is sample data.
const data = {
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://github.com/shadcn.png'
  },
  // teams: [
  //   {
  //     id: '1',
  //     name: 'Development (2)',
  //     logo: GalleryVerticalEnd,
  //     plan: 'Enterprise',
  //     stage: 'demo'
  //   },
  //   {
  //     id: '2',
  //     name: 'Staging',
  //     logo: AudioWaveform,
  //     plan: 'Startup',
  //     stage: 'production'
  //   },
  //   {
  //     id: '3',
  //     name: 'Development 13, Adyen',
  //     logo: Command,
  //     plan: 'Free',
  //     stage: 'staging'
  //   }
  // ] as Team[],
  navMain: [
    {
      title: 'sidebar.frontOffice',
      url: '/front-office',
      icon: ConciergeBell
    }
  ],
  contentManager: [
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
  ]
};

export default function DashboardLayout({
  children,
  onLogout
}: {
  children: React.ReactNode;
  onLogout: () => void;
}) {
  const auth = useAuth();
  const { locale, setLocale } = useIntlContext();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
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
            <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
              <PropertySelector />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarGroup>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <HomeIcon />
                    <span>
                      <FormattedMessage
                        id="sidebar.start"
                        defaultMessage="Start"
                      />
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
                  <Link
                    to="/reservations"
                    search={{
                      page: 1,
                      per_page: 10
                    }}
                  >
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
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>
              <FormattedMessage
                id="sidebar.contentManager"
                defaultMessage="Content Manager"
              />
            </SidebarGroupLabel>
            <SidebarMenu>
              {data.contentManager.map((item) => (
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
                  {item.url === '/tv' ? (
                    <SidebarMenuAction>
                      <ArrowUpRightIcon className="text-muted-foreground/80" />
                      <span className="sr-only">
                        <FormattedMessage
                          id="common.externalLink"
                          defaultMessage="External link"
                        />
                      </span>
                    </SidebarMenuAction>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
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

          {/* Settings */}
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>
              <FormattedMessage
                id="sidebar.settings"
                defaultMessage="Settings"
              />
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
                      <FormattedMessage
                        id="sidebar.users"
                        defaultMessage="Users"
                      />
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/rooms">
                    <BedSingleIcon />
                    <span>
                      <FormattedMessage
                        id="sidebar.rooms"
                        defaultMessage="Rooms"
                      />
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
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={data.user.avatar}
                        alt={data.user.name}
                      />
                      <AvatarFallback className="rounded-lg">
                        <FormattedMessage
                          id="avatar.fallback"
                          defaultMessage="CN"
                        />
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {data.user.name}
                      </span>
                      <span className="truncate text-xs">
                        {auth.user?.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={data.user.avatar}
                          alt={data.user.name}
                        />
                        <AvatarFallback className="rounded-lg">
                          <FormattedMessage
                            id="avatar.fallback"
                            defaultMessage="CN"
                          />
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {data.user.name}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                          {auth.user?.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User />
                        <FormattedMessage
                          id="user.profile"
                          defaultMessage="Profile"
                        />
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut />
                    <FormattedMessage
                      id="user.logout"
                      defaultMessage="Log out"
                    />
                    <span className="text-muted-foreground ml-auto text-xs">
                      <FormattedMessage
                        id="app.version"
                        defaultMessage="v1.2.4"
                      />
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
            <LanguageSwitcher locale={locale} setLocale={setLocale} />
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b-[1px] transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="md:hidden" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    <FormattedMessage
                      id="breadcrumb.buildingApp"
                      defaultMessage="Building Your Application"
                    />
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    <FormattedMessage
                      id="breadcrumb.dataFetching"
                      defaultMessage="Data Fetching"
                    />
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <section className="px-6 py-4 pb-8">{children}</section>
      </SidebarInset>
    </SidebarProvider>
  );
}
