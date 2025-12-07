import { useLingui } from '@lingui/react/macro';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

type ViewType = 'user' | 'admin';

interface ViewContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

const STORAGE_KEY = 'dashboard-view';

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentViewState] = useState<ViewType>('user');
  const { t } = useLingui();

  // Load view from localStorage on mount
  useEffect(() => {
    const storedView = localStorage.getItem(STORAGE_KEY) as ViewType;

    if (storedView && (storedView === 'user' || storedView === 'admin')) {
      setCurrentViewState(storedView);
    }
  }, []);

  const getViewDisplayName = (view: ViewType) => {
    try {
      if (view === 'user') {
        return t`User`;
      } else {
        return t`Admin`;
      }
    } catch {
      return view === 'user' ? t`User` : t`Admin`;
    }
  };

  const showToastNotification = (newView: ViewType, previousView: ViewType) => {
    try {
      const viewName = getViewDisplayName(newView);

      toast.info(t`Switched to ${viewName} view`, {
        action: {
          label: t`Undo`,
          onClick: () => {
            setCurrentViewState(previousView);
            localStorage.setItem(STORAGE_KEY, previousView);
            showRevertToast(previousView);
          }
        }
      });
    } catch {
      // Fallback if intl is not available
      const viewName = getViewDisplayName(newView);
      toast.info(`Switched to ${viewName} view`, {
        action: {
          label: 'Undo',
          onClick: () => {
            setCurrentViewState(previousView);
            localStorage.setItem(STORAGE_KEY, previousView);
            const prevViewName = getViewDisplayName(previousView);
            toast.info(`Switched back to ${prevViewName} view`);
          }
        }
      });
    }
  };

  const showRevertToast = (revertedView: ViewType) => {
    try {
      const viewName = getViewDisplayName(revertedView);
      toast.info(t`Switched back to ${viewName} view`);
    } catch {
      // Fallback if intl is not available
      const viewName = getViewDisplayName(revertedView);
      toast.info(`Switched back to ${viewName} view`);
    }
  };

  const setCurrentView = (view: ViewType) => {
    const previousView = currentView;
    setCurrentViewState(view);
    localStorage.setItem(STORAGE_KEY, view);

    // Show toast notification
    showToastNotification(view, previousView);
  };

  return (
    <ViewContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
}
