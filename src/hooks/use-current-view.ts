import { useLocation } from '@tanstack/react-router';

export type ViewType = 'user' | 'admin';

/** The view a path belongs to — for code outside React, such as loaders. */
export function viewOf(pathname: string): ViewType {
  return pathname.startsWith('/admin') ? 'admin' : 'user';
}

export function useCurrentView(): ViewType {
  return viewOf(useLocation().pathname);
}
