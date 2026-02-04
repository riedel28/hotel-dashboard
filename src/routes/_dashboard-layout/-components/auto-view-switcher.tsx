import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth } from '@/auth';
import { useView } from '@/contexts/view-context';
import { useRouteViewDetection } from '@/hooks/use-route-view-detection';

export function AutoViewSwitcher() {
  const { currentView, setCurrentView } = useView();
  const { targetView, shouldSwitchView, currentPath } = useRouteViewDetection();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Enforce view restrictions based on user admin status
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Force non-admin users out of admin view (always enforce)
    if (!user.is_admin && currentView === 'admin') {
      setCurrentView('user');
      if (currentPath !== '/') {
        navigate({ to: '/' });
      }
    }
  }, [
    isAuthenticated,
    user?.is_admin,
    currentView,
    setCurrentView,
    currentPath,
    navigate
  ]);

  // Route-based view switching (blocks admin view for non-admin users)
  useEffect(() => {
    if (!shouldSwitchView || !targetView || targetView === currentView) {
      return;
    }

    // Block switching to admin view for non-admin users
    if (targetView === 'admin' && !user?.is_admin) {
      return;
    }

    setCurrentView(targetView);
    if (currentPath !== '/') {
      navigate({ to: '/' });
    }
  }, [
    targetView,
    shouldSwitchView,
    currentView,
    setCurrentView,
    navigate,
    currentPath,
    user?.is_admin
  ]);

  return null;
}
