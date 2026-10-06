'use client';

import { Trans } from '@lingui/react/macro';
import {
  BuildingIcon,
  HomeIcon,
  MessageCircleIcon,
  UsersIcon,
  XIcon
} from 'lucide-react';

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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { useCurrentView } from '@/hooks/use-current-view';
import {
  SidebarLink,
  UserNavContent
} from '@/routes/_dashboard-layout/-components/sidebar-nav';
import { SidebarViewToggle } from '@/routes/_dashboard-layout/-components/sidebar-view-toggle';

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
          {currentView === 'admin' ? (
            <AdminMenuContent />
          ) : (
            <UserNavContent onNavigate={handleNavigate} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
