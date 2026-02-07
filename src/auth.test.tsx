import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthProvider, useAuth } from './auth';

// Mock the API functions
const mockedLogin = vi.fn();
const mockedRegister = vi.fn();
const mockedUpdateSelectedProperty = vi.fn();

vi.mock('./api/auth', () => ({
  login: (...args: unknown[]) => mockedLogin(...args),
  logout: () => Promise.resolve(),
  register: (...args: unknown[]) => mockedRegister(...args),
  updateSelectedProperty: (...args: unknown[]) =>
    mockedUpdateSelectedProperty(...args)
}));

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('updateSelectedProperty', () => {
    test('should update selected property and persist to localStorage', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        selected_property_id: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        is_admin: false
      };

      const mockUpdatedUser = {
        ...mockUser,
        selected_property_id: 'property-123',
        updated_at: '2024-01-02T00:00:00.000Z'
      };

      // Set initial user in localStorage
      localStorage.setItem('tanstack.auth.user', JSON.stringify(mockUser));

      mockedUpdateSelectedProperty.mockResolvedValueOnce(mockUpdatedUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Wait for initial state to load
      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      // Call updateSelectedProperty
      await act(async () => {
        await result.current.updateSelectedProperty('property-123');
      });

      // Verify API was called
      expect(mockedUpdateSelectedProperty).toHaveBeenCalledWith('property-123');

      // Verify user state was updated
      expect(result.current.user?.selected_property_id).toBe('property-123');

      // Verify localStorage was updated
      const storedUser = JSON.parse(
        localStorage.getItem('tanstack.auth.user') || '{}'
      );
      expect(storedUser.selected_property_id).toBe('property-123');
    });

    test('should clear selected property when null is provided', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        selected_property_id: 'property-123',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        is_admin: false
      };

      const mockUpdatedUser = {
        ...mockUser,
        selected_property_id: null,
        updated_at: '2024-01-02T00:00:00.000Z'
      };

      // Set initial user in localStorage
      localStorage.setItem('tanstack.auth.user', JSON.stringify(mockUser));

      mockedUpdateSelectedProperty.mockResolvedValueOnce(mockUpdatedUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      await act(async () => {
        await result.current.updateSelectedProperty(null);
      });

      expect(mockedUpdateSelectedProperty).toHaveBeenCalledWith(null);
      expect(result.current.user?.selected_property_id).toBeNull();
    });

    test('should return updated user from updateSelectedProperty', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        selected_property_id: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        is_admin: false
      };

      const mockUpdatedUser = {
        ...mockUser,
        selected_property_id: 'property-456',
        updated_at: '2024-01-02T00:00:00.000Z'
      };

      localStorage.setItem('tanstack.auth.user', JSON.stringify(mockUser));

      mockedUpdateSelectedProperty.mockResolvedValueOnce(mockUpdatedUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      let returnedUser;
      await act(async () => {
        returnedUser =
          await result.current.updateSelectedProperty('property-456');
      });

      expect(returnedUser).toEqual(mockUpdatedUser);
    });
  });

  describe('login with selected_property_id', () => {
    test('should store selected_property_id from login response', async () => {
      const mockLoginResponse = {
        user: {
          id: 1,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          selected_property_id: 'property-789',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          is_admin: false
        }
      };

      mockedLogin.mockResolvedValueOnce(mockLoginResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123'
        });
      });

      expect(result.current.user?.selected_property_id).toBe('property-789');
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('register with selected_property_id', () => {
    test('should have null selected_property_id after registration', async () => {
      const mockRegisterResponse = {
        user: {
          id: 1,
          email: 'newuser@example.com',
          first_name: 'New',
          last_name: 'User',
          selected_property_id: null,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          is_admin: false
        }
      };

      mockedRegister.mockResolvedValueOnce(mockRegisterResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await act(async () => {
        await result.current.register({
          email: 'newuser@example.com',
          password: 'password123',
          first_name: 'New',
          last_name: 'User'
        });
      });

      expect(result.current.user?.selected_property_id).toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
