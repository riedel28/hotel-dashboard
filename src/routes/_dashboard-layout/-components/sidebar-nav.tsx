import { useLingui } from '@lingui/react/macro';
import { Link, type LinkProps } from '@tanstack/react-router';
import * as React from 'react';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { useVisibleNavGroups } from '@/routes/_dashboard-layout/-components/nav-items';

interface SidebarLinkProps extends LinkProps {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  tooltip?: string;
  onNavigate?: () => void;
}

export function SidebarLink({
  icon: Icon,
  children,
  tooltip,
  onNavigate,
  ...linkProps
}: SidebarLinkProps) {
  return (
    <SidebarMenuButton
      tooltip={tooltip}
      render={
        <Link
          activeProps={{
            className:
              'bg-primary/10 text-cyan-800 hover:bg-primary/10! hover:text-cyan-800! dark:bg-primary/20! dark:text-cyan-200/90!'
          }}
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

interface UserNavContentProps {
  /** Icon-only tooltips; the mobile menu is never collapsed, so it omits them. */
  tooltips?: boolean;
  onNavigate?: () => void;
}

/** The User View nav items of the selected Property, for sidebar and mobile menu. */
export function UserNavContent({ tooltips, onNavigate }: UserNavContentProps) {
  const { t } = useLingui();
  const groups = useVisibleNavGroups();

  return (
    <SidebarContent>
      {groups.map((group) => (
        <SidebarGroup key={group.key}>
          {group.label && (
            <SidebarGroupLabel>{t(group.label)}</SidebarGroupLabel>
          )}
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.to}>
                <SidebarLink
                  to={item.to}
                  icon={item.icon}
                  tooltip={tooltips ? t(item.label) : undefined}
                  activeOptions={item.exact ? { exact: true } : undefined}
                  onNavigate={onNavigate}
                >
                  {t(item.label)}
                </SidebarLink>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
