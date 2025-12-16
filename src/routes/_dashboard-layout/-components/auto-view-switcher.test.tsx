import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// All mocks must be defined before any imports that use them
const mockNavigate = vi.fn();
const mockUseRouteViewDetection = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('@/hooks/use-route-view-detection', () => ({
  useRouteViewDetection: () => mockUseRouteViewDetection()
}));

vi.mock('@/auth', () => ({
  useAuth: () => mockUseAuth()
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

import { ViewProvider } from '@/contexts/view-context';
import { render, waitFor } from '@/test-utils';
import { AutoViewSwitcher } from './auto-view-switcher';

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
    // Default mock: not authenticated
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null
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
      await waitFor(
        () => {
          expect(localStorage.getItem('dashboard-view')).toBe(initialView);
        },
        { timeout: 100 }
      );

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

      await waitFor(
        () => {
          expect(localStorage.getItem('dashboard-view')).toBe(initialView);
        },
        { timeout: 100 }
      );

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

      await waitFor(
        () => {
          expect(localStorage.getItem('dashboard-view')).toBe(initialView);
        },
        { timeout: 100 }
      );

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

  describe('Admin Auto-Switching', () => {
    test('automatically switches to admin view when admin user logs in', async () => {
      const adminUser = {
        id: 1,
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: true
      };

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: adminUser
      });

      renderWithProvider('user');

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('admin');
      });
    });

    test('does not switch to admin view if user is not admin', async () => {
      const regularUser = {
        id: 2,
        email: 'user@example.com',
        first_name: 'Regular',
        last_name: 'User',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: false
      };

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: regularUser
      });

      renderWithProvider('user');

      await waitFor(
        () => {
          expect(localStorage.getItem('dashboard-view')).toBe('user');
        },
        { timeout: 100 }
      );

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('does not switch if user is already in admin view', async () => {
      const adminUser = {
        id: 1,
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: true
      };

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: adminUser
      });

      renderWithProvider('admin');

      await waitFor(
        () => {
          expect(localStorage.getItem('dashboard-view')).toBe('admin');
        },
        { timeout: 100 }
      );

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('navigates to / when switching to admin view from non-root path', async () => {
      const adminUser = {
        id: 1,
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: true
      };

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: adminUser
      });

      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/reservations',
        targetView: null,
        shouldSwitchView: false
      });

      renderWithProvider('user');

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('admin');
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
      });
    });

    test('does not switch when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null
      });

      renderWithProvider('user');

      await waitFor(
        () => {
          expect(localStorage.getItem('dashboard-view')).toBe('user');
        },
        { timeout: 100 }
      );

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('resets admin check ref when user logs out and allows re-switch on re-login', async () => {
      const adminUser = {
        id: 1,
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: true
      };

      const { rerender } = renderWithProvider('user');

      // First render: authenticated admin
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: adminUser
      });

      rerender(
        <ViewProvider>
          <AutoViewSwitcher />
        </ViewProvider>
      );

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('admin');
      });

      // Second render: logged out
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null
      });

      rerender(
        <ViewProvider>
          <AutoViewSwitcher />
        </ViewProvider>
      );

      // View should remain admin (localStorage persists)
      await waitFor(
        () => {
          expect(localStorage.getItem('dashboard-view')).toBe('admin');
        },
        { timeout: 100 }
      );

      // Third render: re-login as admin (should not switch again since already admin)
      // But if we manually set to user view, it should switch back
      localStorage.setItem('dashboard-view', 'user');
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: adminUser
      });

      rerender(
        <ViewProvider>
          <AutoViewSwitcher />
        </ViewProvider>
      );

      // Should switch back to admin since ref was reset on logout
      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('admin');
      });
    });

    test('admin auto-switch takes precedence over route-based switching', async () => {
      const adminUser = {
        id: 1,
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: true
      };

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: adminUser
      });

      // Admin user on /properties (admin route) but currently in user view
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/properties',
        targetView: 'admin',
        shouldSwitchView: true
      });

      renderWithProvider('user');

      // Should switch to admin view via admin check (not route check)
      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('admin');
      });

      // Navigation should be called once (from admin auto-switch)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
    });

    test('handles user admin status change from false to true', async () => {
      const regularUser = {
        id: 2,
        email: 'user@example.com',
        first_name: 'Regular',
        last_name: 'User',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: false
      };

      const { rerender } = renderWithProvider('user');

      // First render: regular user
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: regularUser
      });

      rerender(
        <ViewProvider>
          <AutoViewSwitcher />
        </ViewProvider>
      );

      await waitFor(
        () => {
          expect(localStorage.getItem('dashboard-view')).toBe('user');
        },
        { timeout: 100 }
      );

      // Second render: user becomes admin
      const adminUser = {
        ...regularUser,
        is_admin: true
      };

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: adminUser
      });

      rerender(
        <ViewProvider>
          <AutoViewSwitcher />
        </ViewProvider>
      );

      // Should switch to admin view
      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('admin');
      });
    });

    test('forces non-admin user out of admin view', async () => {
      const regularUser = {
        id: 1,
        email: 'user@example.com',
        first_name: 'Regular',
        last_name: 'User',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: false
      };

      // Start with admin view in localStorage (e.g., from previous admin session)
      localStorage.setItem('dashboard-view', 'admin');

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: regularUser
      });

      renderWithProvider('admin');

      // Should force switch to user view
      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('user');
      });

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
    });

    test('handles user admin status change from true to false', async () => {
      const adminUser = {
        id: 1,
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: true
      };

      const { rerender } = renderWithProvider('user');

      // First render: admin user
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: adminUser
      });

      rerender(
        <ViewProvider>
          <AutoViewSwitcher />
        </ViewProvider>
      );

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('admin');
      });

      // Second render: user is no longer admin
      const regularUser = {
        ...adminUser,
        is_admin: false
      };

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: regularUser
      });

      rerender(
        <ViewProvider>
          <AutoViewSwitcher />
        </ViewProvider>
      );

      // Should force switch to user view when admin status changes to false
      await waitFor(
        () => {
          expect(localStorage.getItem('dashboard-view')).toBe('user');
        },
        { timeout: 100 }
      );

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
    });

    test('handles different user logging in', async () => {
      const adminUser1 = {
        id: 1,
        email: 'admin1@example.com',
        first_name: 'Admin',
        last_name: 'One',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: true
      };

      const { rerender } = renderWithProvider('user');

      // First render: first admin user
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: adminUser1
      });

      rerender(
        <ViewProvider>
          <AutoViewSwitcher />
        </ViewProvider>
      );

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('admin');
      });

      // Second render: different admin user logs in
      const adminUser2 = {
        id: 2,
        email: 'admin2@example.com',
        first_name: 'Admin',
        last_name: 'Two',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: true
      };

      localStorage.setItem('dashboard-view', 'user');
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: adminUser2
      });

      rerender(
        <ViewProvider>
          <AutoViewSwitcher />
        </ViewProvider>
      );

      // Should switch to admin view again (ref was reset for new user)
      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('admin');
      });
    });

    test('does not auto-switch to admin view when user is not admin', async () => {
      const regularUser = {
        id: 2,
        email: 'user@example.com',
        first_name: 'Regular',
        last_name: 'User',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: false
      };

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: regularUser
      });

      renderWithProvider('user');

      await waitFor(
        () => {
          expect(localStorage.getItem('dashboard-view')).toBe('user');
        },
        { timeout: 100 }
      );

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('prevents route-based switching to admin view for non-admin users', async () => {
      const regularUser = {
        id: 2,
        email: 'user@example.com',
        first_name: 'Regular',
        last_name: 'User',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: false
      };

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: regularUser
      });

      // User navigates to /properties (admin route)
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/properties',
        targetView: 'admin',
        shouldSwitchView: true
      });

      renderWithProvider('user');

      // Should NOT switch to admin view
      await waitFor(
        () => {
          expect(localStorage.getItem('dashboard-view')).toBe('user');
        },
        { timeout: 100 }
      );

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('allows route-based switching to user view for non-admin users', async () => {
      const regularUser = {
        id: 2,
        email: 'user@example.com',
        first_name: 'Regular',
        last_name: 'User',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_admin: false
      };

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: regularUser
      });

      // User navigates to /reservations (user route) from admin view
      mockUseRouteViewDetection.mockReturnValue({
        currentPath: '/reservations',
        targetView: 'user',
        shouldSwitchView: true
      });

      renderWithProvider('admin');

      // Should switch to user view
      await waitFor(() => {
        expect(localStorage.getItem('dashboard-view')).toBe('user');
      });
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
