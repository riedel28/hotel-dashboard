import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { getRouteApi, type LinkProps } from '@tanstack/react-router';
import {
  BedDoubleIcon,
  BookAIcon,
  CreditCardIcon,
  DoorOpenIcon,
  HomeIcon,
  LayoutGridIcon,
  LockIcon,
  ShoppingBagIcon,
  SquareActivityIcon,
  UsersIcon
} from 'lucide-react';
import type * as React from 'react';
import type { NavItemId } from 'shared/types/properties';

export interface NavItem {
  /** Absent for items that cannot be switched off (Start). */
  id?: NavItemId;
  to: NonNullable<LinkProps['to']>;
  icon: React.ComponentType<{ className?: string }>;
  label: MessageDescriptor;
  exact?: boolean;
}

export interface NavGroup {
  key: string;
  label?: MessageDescriptor;
  items: NavItem[];
}

// The User View navigation: the single source for the desktop sidebar, the
// mobile menu, the Start page cards and the per-Property nav item settings.
// Labels are lazy `msg` descriptors, resolved with `t(label)` at render.
export const userNavGroups: NavGroup[] = [
  {
    key: 'main',
    items: [
      { to: '/', icon: HomeIcon, label: msg`Start`, exact: true },
      {
        id: 'monitoring',
        to: '/monitoring',
        icon: SquareActivityIcon,
        label: msg`Monitoring`
      }
    ]
  },
  {
    key: 'front-office',
    label: msg`Front Office`,
    items: [
      {
        id: 'reservations',
        to: '/reservations',
        icon: BedDoubleIcon,
        label: msg`Reservations`
      },
      { id: 'rooms', to: '/rooms', icon: DoorOpenIcon, label: msg`Rooms` },
      { id: 'users', to: '/users', icon: UsersIcon, label: msg`Users` }
    ]
  },
  {
    key: 'content-manager',
    label: msg`Content Manager`,
    items: [
      {
        id: 'guest-abc',
        to: '/guest-abc',
        icon: BookAIcon,
        label: msg`Guest ABC`
      },
      {
        id: 'products',
        to: '/products',
        icon: ShoppingBagIcon,
        label: msg`Products`
      }
    ]
  },
  {
    key: 'integrations',
    label: msg`Integrations`,
    items: [
      {
        id: 'pms-provider',
        to: '/pms-provider',
        icon: LayoutGridIcon,
        label: msg`PMS`
      },
      {
        id: 'door-locks',
        to: '/door-locks',
        icon: LockIcon,
        label: msg`Door Locks`
      },
      {
        id: 'payment-provider',
        to: '/payment-provider',
        icon: CreditCardIcon,
        label: msg`Payment Provider`
      }
    ]
  }
];

export type ToggleableNavItem = NavItem & { id: NavItemId };

function isToggleable(item: NavItem): item is ToggleableNavItem {
  return item.id !== undefined;
}

/** The catalog an Administrator chooses from: every group minus Start. */
export const toggleableNavGroups = userNavGroups
  .map((group) => ({ ...group, items: group.items.filter(isToggleable) }))
  .filter((group) => group.items.length > 0);

export const toggleableNavItems = toggleableNavGroups.flatMap(
  (group) => group.items
);

/** Groups with disabled items removed; a group left empty is dropped. */
export function visibleNavGroups(disabled: readonly NavItemId[]): NavGroup[] {
  return userNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !isToggleable(item) || !disabled.includes(item.id)
      )
    }))
    .filter((group) => group.items.length > 0);
}

/** True when `pathname` is a disabled nav item's page or anything beneath it. */
export function isNavPathDisabled(
  pathname: string,
  disabled: readonly NavItemId[]
): boolean {
  return toggleableNavItems.some(
    (item) =>
      disabled.includes(item.id) &&
      (pathname === item.to || pathname.startsWith(`${item.to}/`))
  );
}

const dashboardRoute = getRouteApi('/_dashboard-layout');

/** Nav items switched off for the selected Property. */
export function useDisabledNavItems(): NavItemId[] {
  return dashboardRoute.useRouteContext().disabledNavItems;
}

export function useVisibleNavGroups(): NavGroup[] {
  return visibleNavGroups(useDisabledNavItems());
}
