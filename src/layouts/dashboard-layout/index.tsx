'use client';

import * as React from 'react';

import { useAuth } from '@/auth';
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
import { Separator } from '@/components/ui/separator';
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
      title: 'Front Office',
      url: '/front-office',
      icon: ConciergeBell
    }
  ],
  contentManager: [
    {
      name: 'Mobile App',
      url: '/mobile-cms',
      icon: SmartphoneIcon
    },
    {
      name: 'TV App',
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

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
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
                    <span>Start</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/monitoring">
                    <SquareActivityIcon />
                    <span>Monitoring</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroup>
          </SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel>Front Office</SidebarGroupLabel>
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
                    <span>Reservations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/registration-forms">
                    <ListTodoIcon />
                    <span>Registration forms</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/payments">
                    <ReceiptTextIcon />
                    <span>Payments</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/orders">
                    <ShoppingCartIcon />
                    <span>Orders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Content Manager</SidebarGroupLabel>
            <SidebarMenu>
              {data.contentManager.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.url === '/tv' ? (
                    <SidebarMenuAction>
                      <ArrowUpRightIcon className="text-muted-foreground/80" />
                      <span className="sr-only">External link</span>
                    </SidebarMenuAction>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Integrations</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/access-provider">
                    <LockIcon />
                    <span>Access Provider</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/pms-provider">
                    <Grid2X2Icon />
                    <span>PMS Provider</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/payment-provider">
                    <CreditCardIcon />
                    <span>Payment Provider</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Settings */}
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/company">
                    <BuildingIcon />
                    <span>Company data</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/checkin-page">
                    <FileSpreadsheetIcon />
                    <span>Checkin Page</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/users">
                    <UsersIcon />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/rooms">
                    <BedSingleIcon />
                    <span>Rooms</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/devices">
                    <TabletIcon />
                    <span>Devices</span>
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
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
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
                          CN
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {data.user.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
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
                        Profile
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut />
                    Log out
                    <span className="ml-auto text-xs text-muted-foreground">
                      v1.2.4
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b-[1px] transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
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
