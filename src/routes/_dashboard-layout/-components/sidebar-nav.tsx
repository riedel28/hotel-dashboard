import { useLingui } from '@lingui/react/macro';
import { getRouteApi, Link } from '@tanstack/react-router';
import type { NavItemId } from 'shared/types/properties';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { useCurrentView } from '@/hooks/use-current-view';
import {
  adminNavSections,
  userNavSections
} from '@/routes/_dashboard-layout/-components/nav-items';

const dashboardRoute = getRouteApi('/_dashboard-layout');

/** Nav items switched off for the selected Property. */
export function useDisabledNavItems(): NavItemId[] {
  return dashboardRoute.useRouteContext().disabledNavItems;
}

/** The navigation of the current view. */
export function DashboardNav() {
  const { t } = useLingui();
  // On a phone the sidebar is a sheet over the page; following a link closes it
  const { setOpenMobile } = useSidebar();
  const disabledNavItems = useDisabledNavItems();
  const sections =
    useCurrentView() === 'admin'
      ? adminNavSections
      : userNavSections(disabledNavItems);

  return (
    <SidebarContent>
      {sections.map((section) => (
        <SidebarGroup key={section.key}>
          {section.label && (
            <SidebarGroupLabel>{t(section.label)}</SidebarGroupLabel>
          )}
          <SidebarMenu>
            {section.links.map(({ to, icon: Icon, label, exact }) => (
              <SidebarMenuItem key={to}>
                <SidebarMenuButton
                  tooltip={t(label)}
                  render={
                    <Link
                      to={to}
                      activeOptions={exact ? { exact: true } : undefined}
                      activeProps={{
                        className:
                          'bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft! hover:text-primary-soft-foreground!'
                      }}
                      onClick={() => setOpenMobile(false)}
                    >
                      <Icon />
                      <span>{t(label)}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
