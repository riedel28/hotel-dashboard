'use client';

import { Trans } from '@lingui/react/macro';
import { Link, type LinkProps } from '@tanstack/react-router';
import {
  BedDoubleIcon,
  BedSingleIcon,
  BuildingIcon,
  HomeIcon,
  MessageCircleIcon,
  SquareActivityIcon,
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
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { useCurrentView } from '@/hooks/use-current-view';
import { SidebarViewToggle } from '@/routes/_dashboard-layout/-components/sidebar-view-toggle';

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

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const currentView = useCurrentView();

  const handleNavigate = () => {
    onOpenChange(false);
  };

  // Admin menu content
  const AdminMenuContent = () => (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLink
              to="/admin"
              icon={HomeIcon}
              onNavigate={handleNavigate}
            >
              <Trans>Start</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/admin/properties"
              icon={BuildingIcon}
              onNavigate={handleNavigate}
            >
              <Trans>Properties</Trans>
            </SidebarLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/admin/customers"
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
  const UserMenuContent = () => (
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
              to="/rooms"
              icon={BedSingleIcon}
              onNavigate={handleNavigate}
            >
              <Trans>Rooms</Trans>
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
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );

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
                    <Trans>Hotel Dashboard</Trans>
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
          <SidebarViewToggle />
          {currentView === 'admin' ? <AdminMenuContent /> : <UserMenuContent />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
