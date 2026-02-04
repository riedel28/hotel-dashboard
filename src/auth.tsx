import * as React from 'react';

import {
  login as apiLogin,
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
  token: string | null;
}

const AuthContext = React.createContext<AuthContext | null>(null);

const userKey = 'tanstack.auth.user';
const tokenKey = 'tanstack.auth.token';

function getStoredUser(): User | null {
  const stored = localStorage.getItem(userKey);
  return stored ? JSON.parse(stored) : null;
}

function getStoredToken(): string | null {
  return localStorage.getItem(tokenKey);
}

function setStoredAuth(user: User | null, token: string | null) {
  if (user && token) {
    localStorage.setItem(userKey, JSON.stringify(user));
    localStorage.setItem(tokenKey, token);
  } else {
    localStorage.removeItem(userKey);
    localStorage.removeItem(tokenKey);
  }
}

function setStoredUser(user: User) {
  localStorage.setItem(userKey, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(getStoredUser());
  const [token, setToken] = React.useState<string | null>(getStoredToken());
  const isAuthenticated = Boolean(user && token);

  const logout = React.useCallback(async () => {
    setStoredAuth(null, null);
    setUser(null);
    setToken(null);
  }, []);

  const login = React.useCallback(async (credentials: LoginData) => {
    const response = await apiLogin(credentials);
    if (response) {
      setStoredAuth(response.user, response.token);
      setUser(response.user);
      setToken(response.token);
      return response;
    }
    throw new Error('Login failed');
  }, []);

  const register = React.useCallback(async (data: RegisterData) => {
    const response = await apiRegister(data);
    if (response) {
      setStoredAuth(response.user, response.token);
      setUser(response.user);
      setToken(response.token);
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
    setToken(getStoredToken());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        register,
        logout,
        updateSelectedProperty,
        user,
        token
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
