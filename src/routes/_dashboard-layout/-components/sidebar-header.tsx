import { Trans, useLingui } from '@lingui/react/macro';
import { XIcon } from 'lucide-react';

import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';

// Logo, name and the collapse toggle, in the layout and in its loading skeleton
export function DashboardSidebarHeader() {
  const { t } = useLingui();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarGroup>
          <SidebarMenuItem className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <AppLogo className="transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:scale-95 group-data-[collapsible=icon]:opacity-0" />
            <span className="text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:scale-95 group-data-[collapsible=icon]:opacity-0">
              <Trans>Hotel Dashboard</Trans>
            </span>
            {/* On a phone the sidebar is a sheet: it closes, it doesn't
                collapse, so a cross says what the button does */}
            {isMobile ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t`Close menu`}
                onClick={() => setOpenMobile(false)}
                className="ml-auto pointer-coarse:-my-2 pointer-coarse:size-11"
              >
                <XIcon />
              </Button>
            ) : (
              <SidebarTrigger className="ml-auto transition-all duration-200 ease-in-out group-data-[collapsible=icon]:ml-0" />
            )}
          </SidebarMenuItem>
        </SidebarGroup>
      </SidebarMenu>
    </SidebarHeader>
  );
}
