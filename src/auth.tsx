import * as React from 'react';

import {
  login as apiLogin,
  loginTwoFactor as apiLoginTwoFactor,
  logout as apiLogout,
  updateSelectedProperty as apiUpdateSelectedProperty
} from './api/auth';
import type { LoginData, User } from './lib/schemas';

/**
 * Signing in is one step or two depending on whether the account has
 * two-factor authentication, so the caller has to be told which happened.
 */
export type LoginResult =
  | { status: 'authenticated'; user: User }
  | { status: 'two-factor-required'; challengeToken: string };

export interface AuthContext {
  isAuthenticated: boolean;
  login: (credentials: LoginData) => Promise<LoginResult>;
  completeTwoFactorLogin: (input: {
    challengeToken: string;
    code: string;
    rememberMe?: boolean;
  }) => Promise<User>;
  logout: () => Promise<void>;
  updateSelectedProperty: (propertyId: string | null) => Promise<User>;
  /** Refreshes the cached copy after the profile page saves changes. */
  syncUser: (user: User) => void;
  user: User | null;
}

const AuthContext = React.createContext<AuthContext | null>(null);

const userKey = 'backoffice.auth.user';

function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(userKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem(userKey);
    return null;
  }
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

  const login = React.useCallback(
    async (credentials: LoginData): Promise<LoginResult> => {
      const response = await apiLogin(credentials);

      // No session yet — the server is holding it back until the second factor.
      if ('requires_2fa' in response) {
        return {
          status: 'two-factor-required',
          challengeToken: response.challenge_token
        };
      }

      setStoredUser(response.user);
      setUser(response.user);
      return { status: 'authenticated', user: response.user };
    },
    []
  );

  const completeTwoFactorLogin = React.useCallback(
    async ({
      challengeToken,
      code,
      rememberMe
    }: {
      challengeToken: string;
      code: string;
      rememberMe?: boolean;
    }) => {
      const response = await apiLoginTwoFactor({
        challenge_token: challengeToken,
        code,
        rememberMe
      });
      setStoredUser(response.user);
      setUser(response.user);
      return response.user;
    },
    []
  );

  const syncUser = React.useCallback((next: User) => {
    setStoredUser(next);
    setUser(next);
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
        completeTwoFactorLogin,
        isAuthenticated,
        login,
        logout,
        syncUser,
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
