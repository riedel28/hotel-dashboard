import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import type { LinkProps } from '@tanstack/react-router';
import {
  BedDoubleIcon,
  BookAIcon,
  BuildingIcon,
  CreditCardIcon,
  DoorOpenIcon,
  HomeIcon,
  LayoutGridIcon,
  LockIcon,
  ShoppingBagIcon,
  SquareActivityIcon,
  TabletSmartphoneIcon,
  UsersIcon
} from 'lucide-react';
import type * as React from 'react';
import { type NavItemId, navItemIdSchema } from 'shared/types/properties';

// Labels are lazy `msg` descriptors, resolved with `t(label)` at render.
export interface NavLink {
  to: NonNullable<LinkProps['to']>;
  icon: React.ComponentType<{ className?: string }>;
  label: MessageDescriptor;
  exact?: boolean;
}

export interface NavSection {
  key: string;
  label?: MessageDescriptor;
  links: NavLink[];
}

type NavGroupKey =
  | 'main'
  | 'front-office'
  | 'content-manager'
  | 'integrations'
  | 'setup';

// Start is not a nav item: it cannot be switched off, so it is pinned to its
// group instead of living in the catalog.
const navGroups: {
  key: NavGroupKey;
  label?: MessageDescriptor;
  pinned?: NavLink[];
}[] = [
  {
    key: 'main',
    pinned: [{ to: '/', icon: HomeIcon, label: msg`Start`, exact: true }]
  },
  { key: 'front-office', label: msg`Front Office` },
  { key: 'content-manager', label: msg`Content Manager` },
  { key: 'integrations', label: msg`Integrations` },
  { key: 'setup', label: msg`Setup` }
];

// The nav item catalog: the single source for the sidebar, the mobile menu,
// the Start page cards and the per-Property settings. Keyed by the shared id
// enum, so an id without an entry here does not compile. Items appear in the
// enum's order.
export const navItems: Record<NavItemId, NavLink & { group: NavGroupKey }> = {
  monitoring: {
    group: 'main',
    to: '/monitoring',
    icon: SquareActivityIcon,
    label: msg`Monitoring`
  },
  reservations: {
    group: 'front-office',
    to: '/reservations',
    icon: BedDoubleIcon,
    label: msg`Reservations`
  },
  rooms: {
    group: 'front-office',
    to: '/rooms',
    icon: DoorOpenIcon,
    label: msg`Rooms`
  },
  'guest-abc': {
    group: 'content-manager',
    to: '/guest-abc',
    icon: BookAIcon,
    label: msg`Guest ABC`
  },
  products: {
    group: 'content-manager',
    to: '/products',
    icon: ShoppingBagIcon,
    label: msg`Products`
  },
  'pms-provider': {
    group: 'integrations',
    to: '/pms-provider',
    icon: LayoutGridIcon,
    label: msg`PMS`
  },
  'door-locks': {
    group: 'integrations',
    to: '/door-locks',
    icon: LockIcon,
    label: msg`Door Locks`
  },
  'payment-provider': {
    group: 'integrations',
    to: '/payment-provider',
    icon: CreditCardIcon,
    label: msg`Payment Provider`
  },
  devices: {
    group: 'setup',
    to: '/devices',
    icon: TabletSmartphoneIcon,
    label: msg`Devices`
  },
  users: {
    group: 'setup',
    to: '/users',
    icon: UsersIcon,
    label: msg`Users`
  }
};

const navItemIdsIn = (group: NavGroupKey) =>
  navItemIdSchema.options.filter((id) => navItems[id].group === group);

/** The catalog by group, for the per-Property settings. */
export const navItemGroups = navGroups.map(({ key, label }) => ({
  key,
  label,
  ids: navItemIdsIn(key)
}));

/** The User View navigation with the disabled nav items left out. */
export function userNavSections(disabled: readonly NavItemId[]): NavSection[] {
  return navGroups
    .map(({ key, label, pinned = [] }) => ({
      key,
      label,
      links: [
        ...pinned,
        ...navItemIdsIn(key)
          .filter((id) => !disabled.includes(id))
          .map((id) => navItems[id])
      ]
    }))
    .filter((section) => section.links.length > 0);
}

export const adminNavSections: NavSection[] = [
  {
    key: 'main',
    links: [
      { to: '/admin', icon: HomeIcon, label: msg`Start`, exact: true },
      { to: '/admin/properties', icon: BuildingIcon, label: msg`Properties` },
      { to: '/admin/customers', icon: UsersIcon, label: msg`Customers` }
    ]
  }
];

/** True when `pathname` is a disabled nav item's page or anything beneath it. */
export function isNavPathDisabled(
  pathname: string,
  disabled: readonly NavItemId[]
): boolean {
  return disabled.some((id) => {
    const { to } = navItems[id];
    return pathname === to || pathname.startsWith(`${to}/`);
  });
}
