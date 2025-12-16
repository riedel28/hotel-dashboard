import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// All mocks must be defined before any imports that use them
const mockNavigate = vi.fn();
const mockUseRouteViewDetection = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('@/hooks/use-route-view-detection', () => ({
  useRouteViewDetection: () => mockUseRouteViewDetection()
}));

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn()
  }
}));

// Mock ViewProvider to avoid lingui macro issues
vi.mock('@/contexts/view-context', async () => {
  const React = await import('react');
  const { createContext, useContext, useState, useEffect } = React;
  
  type ViewType = 'user' | 'admin';
  interface ViewContextType {
    currentView: ViewType;
    setCurrentView: (view: ViewType) => void;
  }
  
  const ViewContext = createContext<ViewContextType | undefined>(undefined);
  const STORAGE_KEY = 'dashboard-view';
  
  function ViewProvider({ children }: { children: React.ReactNode }) {
    const [currentView, setCurrentViewState] = useState<ViewType>('user');
    
    useEffect(() => {
      const storedView = localStorage.getItem(STORAGE_KEY) as ViewType;
      if (storedView && (storedView === 'user' || storedView === 'admin')) {
        setCurrentViewState(storedView);
      }
    }, []);
    
    const setCurrentView = (view: ViewType) => {
      setCurrentViewState(view);
      localStorage.setItem(STORAGE_KEY, view);
    };
    
    return (
      <ViewContext.Provider value={{ currentView, setCurrentView }}>
        {children}
      </ViewContext.Provider>
    );
  }
  
  function useView() {
    const context = useContext(ViewContext);
    if (context === undefined) {
      throw new Error('useView must be used within a ViewProvider');
    }
    return context;
  }
  
  return {
    ViewProvider,
    useView
  };
});

import { render, waitFor } from '@/test-utils';
import { AutoViewSwitcher } from './auto-view-switcher';
import { ViewProvider } from '@/contexts/view-context';

describe('AutoViewSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
    // Default mock: no view switching needed
    mockUseRouteViewDetection.mockReturnValue({
      currentPath: '/',
      targetView: null,
      shouldSwitchView: false
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderWithProvider = (initialView: 'user' | 'admin' = 'user') => {
    // Set initial view in localStorage
    localStorage.setItem('dashboard-view', initialView);

    return render(
      <ViewProvider>
        <AutoViewSwitcher />
      </ViewProvider>
    );
  };

  describe('View Switching', () => {
    test('switches to admin view when navigating to /properties', async () => {
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/properties',
        targetView: 'admin',
        shouldSwitchView: true
      });

      renderWithProvider('user');

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('admin');
      });
    });

    test('switches to user view when navigating to /reservations', async () => {
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/reservations',
        targetView: 'user',
        shouldSwitchView: true
      });

      renderWithProvider('admin');

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('user');
      });
    });

    test('switches to admin view when navigating to /customers', async () => {
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/customers',
        targetView: 'admin',
        shouldSwitchView: true
      });

      renderWithProvider('user');

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('admin');
      });
    });

    test('switches to user view when navigating to /orders', async () => {
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/orders',
        targetView: 'user',
        shouldSwitchView: true
      });

      renderWithProvider('admin');

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('user');
      });
    });
  });

  describe('Navigation Behavior', () => {
    test('navigates to / when switching views from non-root path', async () => {
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/reservations/123',
        targetView: 'user',
        shouldSwitchView: true
      });

      renderWithProvider('admin');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
      });
    });

    test('navigates to / when switching views from /properties', async () => {
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/properties',
        targetView: 'admin',
        shouldSwitchView: true
      });

      renderWithProvider('user');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
      });
    });

    test('does not navigate when already on root path', async () => {
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/',
        targetView: 'user',
        shouldSwitchView: true
      });

      renderWithProvider('admin');

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('user');
      });

      // Should not navigate since we're already on '/'
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('No Switching Scenarios', () => {
    test('does not switch when already in correct view', async () => {
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/reservations',
        targetView: 'user',
        shouldSwitchView: true
      });

      const initialView = 'user';
      renderWithProvider(initialView);

      // Wait a bit to ensure no switching occurs
      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe(initialView);
      }, { timeout: 100 });

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('does not switch when targetView is null', async () => {
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/',
        targetView: null,
        shouldSwitchView: false
      });

      const initialView = 'user';
      renderWithProvider(initialView);

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe(initialView);
      }, { timeout: 100 });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('does not switch when shouldSwitchView is false', async () => {
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/unknown',
        targetView: null,
        shouldSwitchView: false
      });

      const initialView = 'user';
      renderWithProvider(initialView);

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe(initialView);
      }, { timeout: 100 });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Nested Routes', () => {
    test('switches view and navigates for nested reservation route', async () => {
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/reservations/123/edit',
        targetView: 'user',
        shouldSwitchView: true
      });

      renderWithProvider('admin');

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('user');
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
      });
    });

    test('switches view and navigates for nested property route', async () => {
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/properties/456/details',
        targetView: 'admin',
        shouldSwitchView: true
      });

      renderWithProvider('user');

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('admin');
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
      });
    });
  });

  describe('Component Rendering', () => {
    test('component does not render any visible content', () => {
      const { container } = renderWithProvider();
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Multiple Route Changes', () => {
    test('handles multiple route changes correctly', async () => {
      const { rerender } = renderWithProvider('user');

      // First change: switch to admin
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/properties',
        targetView: 'admin',
        shouldSwitchView: true
      });

      rerender(
        <ViewProvider>
          <AutoViewSwitcher />
        </ViewProvider>
      );

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('admin');
      });

      // Second change: switch back to user
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/reservations',
        targetView: 'user',
        shouldSwitchView: true
      });

      rerender(
        <ViewProvider>
          <AutoViewSwitcher />
        </ViewProvider>
      );

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('user');
      });
    });
  });
});
