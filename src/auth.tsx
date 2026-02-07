import * as React from 'react';

import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  updateSelectedProperty as apiUpdateSelectedProperty
} from './api/auth';
import type {
  AuthResponse,
  LoginData,
  RegisterData,
  User
} from './lib/schemas';

export interface AuthContext {
  isAuthenticated: boolean;
  login: (credentials: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateSelectedProperty: (propertyId: string | null) => Promise<User>;
  user: User | null;
}

const AuthContext = React.createContext<AuthContext | null>(null);

const userKey = 'tanstack.auth.user';

function getStoredUser(): User | null {
  const stored = localStorage.getItem(userKey);
  return stored ? JSON.parse(stored) : null;
}

function setStoredUser(user: User) {
  localStorage.setItem(userKey, JSON.stringify(user));
}

function clearStoredUser() {
  localStorage.removeItem(userKey);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(getStoredUser());
  const isAuthenticated = Boolean(user);

  const logout = React.useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      clearStoredUser();
      setUser(null);
    }
  }, []);

  const login = React.useCallback(async (credentials: LoginData) => {
    const response = await apiLogin(credentials);
    if (response) {
      setStoredUser(response.user);
      setUser(response.user);
      return response;
    }
    throw new Error('Login failed');
  }, []);

  const register = React.useCallback(async (data: RegisterData) => {
    const response = await apiRegister(data);
    if (response) {
      setStoredUser(response.user);
      setUser(response.user);
      return response;
    }
    throw new Error('Registration failed');
  }, []);

  const updateSelectedProperty = React.useCallback(
    async (propertyId: string | null) => {
      const updatedUser = await apiUpdateSelectedProperty(propertyId);
      setStoredUser(updatedUser);
      setUser(updatedUser);
      return updatedUser;
    },
    []
  );

  React.useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        register,
        logout,
        updateSelectedProperty,
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
