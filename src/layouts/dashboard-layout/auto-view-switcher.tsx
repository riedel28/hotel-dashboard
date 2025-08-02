import { useEffect } from 'react';

import { useView } from '@/contexts/view-context';
import { useRouteViewDetection } from '@/hooks/use-route-view-detection';
import { useNavigate } from '@tanstack/react-router';
import { useIntl } from 'react-intl';
import { toast } from 'sonner';

export function AutoViewSwitcher() {
  const { currentView, setCurrentView } = useView();
  const { targetView, shouldSwitchView, currentPath } = useRouteViewDetection();
  const intl = useIntl();
  const navigate = useNavigate();

  useEffect(() => {
    if (shouldSwitchView && targetView && targetView !== currentView) {
      // Only switch if we're not already in the correct view
      setCurrentView(targetView);

      // Redirect to start page since current page might not be accessible in new view
      if (currentPath !== '/') {
        navigate({ to: '/' });
      }

      // Show a subtle toast notification about the auto-switch
      const getViewDisplayName = (view: 'user' | 'admin') => {
        try {
          if (view === 'user') {
            return intl.formatMessage({
              id: 'header.userView.user',
              defaultMessage: 'User'
            });
          } else {
            return intl.formatMessage({
              id: 'header.userView.admin',
              defaultMessage: 'Admin'
            });
          }
        } catch {
          return view === 'user' ? 'User' : 'Admin';
        }
      };

      const viewDisplayName = getViewDisplayName(targetView);

      toast.info(
        intl.formatMessage(
          {
            id: 'view.toast.autoSwitched',
            defaultMessage:
              'Switched to {view} view and redirected to dashboard'
          },
          {
            view: viewDisplayName
          }
        ),
        {
          duration: 3000,
          position: 'bottom-right'
        }
      );
    }
  }, [
    targetView,
    shouldSwitchView,
    currentView,
    setCurrentView,
    intl,
    navigate,
    currentPath
  ]);

  return null; // This component doesn't render anything
}
