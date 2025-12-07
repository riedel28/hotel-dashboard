import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useView } from '@/contexts/view-context';
import { useRouteViewDetection } from '@/hooks/use-route-view-detection';

export function AutoViewSwitcher() {
  const { currentView, setCurrentView } = useView();
  const { targetView, shouldSwitchView, currentPath } = useRouteViewDetection();

  const navigate = useNavigate();

  useEffect(() => {
    if (shouldSwitchView && targetView && targetView !== currentView) {
      // Only switch if we're not already in the correct view
      setCurrentView(targetView);

      // Redirect to start page since current page might not be accessible in new view
      if (currentPath !== '/') {
        navigate({ to: '/' });
      }
    }
  }, [
    targetView,
    shouldSwitchView,
    currentView,
    setCurrentView,
    navigate,
    currentPath
  ]);

  return null; // This component doesn't render anything
}
