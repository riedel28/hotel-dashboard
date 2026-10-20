import { Trans } from '@lingui/react/macro';

import { AppLogo } from '@/components/app-logo';
import {
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger
} from '@/components/ui/sidebar';

// Logo, name and the collapse toggle, in the layout and in its loading skeleton
export function DashboardSidebarHeader() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarGroup>
          <SidebarMenuItem className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <AppLogo className="transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:scale-95 group-data-[collapsible=icon]:opacity-0" />
            <span className="text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:scale-95 group-data-[collapsible=icon]:opacity-0">
              <Trans>Hotel Dashboard</Trans>
            </span>
            <SidebarTrigger className="ml-auto transition-all duration-200 ease-in-out group-data-[collapsible=icon]:ml-0 in-data-[mobile=true]:pointer-coarse:-my-2 in-data-[mobile=true]:pointer-coarse:size-11" />
          </SidebarMenuItem>
        </SidebarGroup>
      </SidebarMenu>
    </SidebarHeader>
  );
}
