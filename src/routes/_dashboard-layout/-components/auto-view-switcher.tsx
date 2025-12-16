import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/auth';
import { useView } from '@/contexts/view-context';
import { useRouteViewDetection } from '@/hooks/use-route-view-detection';

export function AutoViewSwitcher() {
  const { currentView, setCurrentView } = useView();
  const { targetView, shouldSwitchView, currentPath } = useRouteViewDetection();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Track which user ID we've already processed for auto-switch on login
  const processedUserIdRef = useRef<number | null>(null);

  // Enforce view restrictions based on user admin status
  useEffect(() => {
    if (!isAuthenticated || !user) {
      processedUserIdRef.current = null;
      return;
    }

    // Force non-admin users out of admin view (always enforce)
    if (!user.is_admin && currentView === 'admin') {
      setCurrentView('user');
      if (currentPath !== '/') {
        navigate({ to: '/' });
      }
      return;
    }

    // Auto-switch admin users to admin view (only once per login)
    if (user.is_admin && processedUserIdRef.current !== user.id) {
      processedUserIdRef.current = user.id;
      if (currentView !== 'admin') {
        setCurrentView('admin');
        if (currentPath !== '/') {
          navigate({ to: '/' });
        }
      }
    }
  }, [
    isAuthenticated,
    user?.id,
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
