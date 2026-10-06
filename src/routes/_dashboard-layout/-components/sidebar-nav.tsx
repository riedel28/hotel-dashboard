import { useLingui } from '@lingui/react/macro';
import { getRouteApi, Link } from '@tanstack/react-router';
import type { NavItemId } from 'shared/types/properties';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
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

/** The navigation of the current view, shared by the sidebar and the mobile menu. */
export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLingui();
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
                          'bg-primary/10 text-cyan-800 hover:bg-primary/10! hover:text-cyan-800! dark:bg-primary/20! dark:text-cyan-200/90!'
                      }}
                      onClick={onNavigate}
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
