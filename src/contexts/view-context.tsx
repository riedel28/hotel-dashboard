import React, { createContext, useContext, useEffect, useState } from 'react';

import { useIntl } from 'react-intl';
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
  const intl = useIntl();

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

  const showToastNotification = (newView: ViewType, previousView: ViewType) => {
    try {
      const viewName = getViewDisplayName(newView);
      toast.info(
        intl.formatMessage(
          {
            id: 'view.toast.switched',
            defaultMessage: 'Switched to {view} view'
          },
          { view: viewName }
        ),
        {
          action: {
            label: intl.formatMessage({
              id: 'actions.undo',
              defaultMessage: 'Undo'
            }),
            onClick: () => {
              setCurrentViewState(previousView);
              localStorage.setItem(STORAGE_KEY, previousView);
              showRevertToast(previousView);
            }
          }
        }
      );
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
      toast.info(
        intl.formatMessage(
          {
            id: 'view.toast.reverted',
            defaultMessage: 'Switched back to {view} view'
          },
          { view: viewName }
        )
      );
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
