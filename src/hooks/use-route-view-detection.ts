import { useLocation } from '@tanstack/react-router';

import { findMatchingView } from '@/lib/route-matcher';

export function useRouteViewDetection() {
  const location = useLocation();
  const currentPath = location.pathname;

  const targetView = findMatchingView(currentPath);

  return {
    currentPath,
    targetView,
    shouldSwitchView: !!targetView
  };
}
