import { useLocation } from '@tanstack/react-router';

export type ViewType = 'user' | 'admin';

export function useCurrentView(): ViewType {
  const location = useLocation();
  return location.pathname.startsWith('/admin') ? 'admin' : 'user';
}
