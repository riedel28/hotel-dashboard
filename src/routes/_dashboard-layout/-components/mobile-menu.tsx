'use client';

import { Trans } from '@lingui/react/macro';
import { Link, type LinkProps } from '@tanstack/react-router';
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
  UsersIcon,
  XIcon
} from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { useView } from '@/contexts/view-context';

interface SidebarLinkProps extends LinkProps {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onNavigate?: () => void;
}

function SidebarLink({
  icon: Icon,
  children,
  onNavigate,
  ...linkProps
}: SidebarLinkProps) {
  return (
    <SidebarMenuButton
      render={
        <Link
          activeProps={{ className: '!bg-primary/5' }}
          onClick={onNavigate}
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

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const { currentView } = useView();

  const handleNavigate = () => {
    onOpenChange(false);
  };

  // Admin menu content
  const AdminMenuContent = () => (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLink to="/" icon={HomeIcon} onNavigate={handleNavigate}>
              <Trans>Start</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/properties"
              icon={BuildingIcon}
              onNavigate={handleNavigate}
            >
              <Trans>Properties</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/customers"
              icon={UsersIcon}
              onNavigate={handleNavigate}
            >
              <Trans>Customers</Trans>
            </SidebarLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );

  // User menu content
  const UserMenuContent = () => {
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
          return '';
      }
    };

    return (
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarLink to="/" icon={HomeIcon} onNavigate={handleNavigate}>
                <Trans>Start</Trans>
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink
                to="/monitoring"
                icon={SquareActivityIcon}
                onNavigate={handleNavigate}
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
                onNavigate={handleNavigate}
              >
                <Trans>Reservations</Trans>
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink
                to="/registration-forms"
                icon={ListTodoIcon}
                onNavigate={handleNavigate}
              >
                <Trans>Registration forms</Trans>
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink
                to="/payments"
                icon={ReceiptTextIcon}
                onNavigate={handleNavigate}
              >
                <Trans>Payments</Trans>
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink
                to="/orders"
                icon={ShoppingCartIcon}
                onNavigate={handleNavigate}
              >
                <Trans>Orders</Trans>
              </SidebarLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Content Manager Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <Trans>Content Manager</Trans>
          </SidebarGroupLabel>
          <SidebarMenu>
            {contentManagerItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarLink
                  to={item.url as LinkProps['to']}
                  icon={item.icon}
                  onNavigate={handleNavigate}
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
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Integrations Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <Trans>Integrations</Trans>
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarLink
                to="/access-provider"
                icon={LockIcon}
                onNavigate={handleNavigate}
              >
                <Trans>Access Provider</Trans>
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink
                to="/pms-provider"
                icon={Grid2X2Icon}
                onNavigate={handleNavigate}
              >
                <Trans>PMS Provider</Trans>
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink
                to="/payment-provider"
                icon={CreditCardIcon}
                onNavigate={handleNavigate}
              >
                <Trans>Payment Provider</Trans>
              </SidebarLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <Trans>Settings</Trans>
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarLink
                to="/company"
                icon={BuildingIcon}
                onNavigate={handleNavigate}
              >
                <Trans>Company data</Trans>
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink
                to="/checkin-page"
                icon={FileSpreadsheetIcon}
                onNavigate={handleNavigate}
              >
                <Trans>Checkin Page</Trans>
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink
                to="/users"
                icon={UsersIcon}
                onNavigate={handleNavigate}
              >
                <Trans>Users</Trans>
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink
                to="/rooms"
                icon={BedSingleIcon}
                onNavigate={handleNavigate}
              >
                <Trans>Rooms</Trans>
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink
                to="/devices"
                icon={TabletIcon}
                onNavigate={handleNavigate}
              >
                <Trans>Devices</Trans>
              </SidebarLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[18rem] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>
            <Trans>Sidebar</Trans>
          </SheetTitle>
          <SheetDescription>
            <Trans>Displays the mobile sidebar.</Trans>
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full w-full flex-col">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarGroup>
                <SidebarMenuItem className="flex items-center gap-2">
                  <div className="inline-block rounded-md bg-primary p-1 text-white">
                    <MessageCircleIcon className="size-4" />
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    <Trans>Backoffice Manager</Trans>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onOpenChange(false)}
                    aria-label="Close menu"
                    className="ml-auto"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </SidebarMenuItem>
              </SidebarGroup>
            </SidebarMenu>
          </SidebarHeader>
          {currentView === 'admin' ? <AdminMenuContent /> : <UserMenuContent />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
