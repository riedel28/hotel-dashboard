'use client';

import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import { Trans, useLingui } from '@lingui/react/macro';
import { XIcon } from 'lucide-react';

import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { DashboardNav } from '@/routes/_dashboard-layout/-components/sidebar-nav';
import { SidebarViewToggle } from '@/routes/_dashboard-layout/-components/sidebar-view-toggle';

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// A Base UI drawer rather than a dialog, so it follows the finger and closes
// with a swipe to the left. No swipe-to-open from the edge: iOS Safari keeps
// that edge for its own back gesture.
export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const { t } = useLingui();

  return (
    <DrawerPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection="left"
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Backdrop className="fixed inset-0 z-50 bg-black opacity-[calc(0.5*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:opacity-0 data-swiping:duration-0" />
        <DrawerPrimitive.Viewport className="fixed inset-0 z-50 flex justify-start">
          <DrawerPrimitive.Popup
            className={cn(
              'flex h-full w-72 max-w-[calc(100vw-3rem)] flex-col border-r bg-sidebar text-sidebar-foreground outline-none',
              // Follows the finger while swiped, slides in and out otherwise
              '[transform:translateX(var(--drawer-swipe-movement-x))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-swiping:select-none',
              'data-ending-style:[transform:translateX(-100%)] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:[transform:translateX(-100%)]',
              // 44px targets on touch screens (Apple HIG); the desktop sidebar
              // shares these components and stays compact
              'pointer-coarse:**:data-[slot=sidebar-menu-button]:h-11 pointer-coarse:**:data-[slot=tabs-list]:h-10 pointer-coarse:**:data-[slot=tabs-trigger]:h-full'
            )}
          >
            {/* Without it a mouse press starts a swipe and captures the
                pointer, so the click lands on the panel instead of the link.
                Touch still swipes from anywhere. */}
            <DrawerPrimitive.Content className="flex min-h-0 flex-1 flex-col">
              <DrawerPrimitive.Title className="sr-only">
                <Trans>Main navigation</Trans>
              </DrawerPrimitive.Title>
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarGroup>
                    <SidebarMenuItem className="flex items-center gap-2">
                      <AppLogo />
                      <span className="text-sm font-semibold whitespace-nowrap">
                        <Trans>Hotel Dashboard</Trans>
                      </span>
                      <DrawerPrimitive.Close
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t`Close menu`}
                            className="ml-auto pointer-coarse:-my-2 pointer-coarse:size-11"
                          />
                        }
                      >
                        <XIcon className="size-4" />
                      </DrawerPrimitive.Close>
                    </SidebarMenuItem>
                  </SidebarGroup>
                </SidebarMenu>
              </SidebarHeader>
              <SidebarViewToggle />
              <DashboardNav onNavigate={() => onOpenChange(false)} />
            </DrawerPrimitive.Content>
          </DrawerPrimitive.Popup>
        </DrawerPrimitive.Viewport>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
