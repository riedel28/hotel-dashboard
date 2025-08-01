import * as React from 'react';

import { sleep } from './utils';

interface User {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthContext {
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
}

const AuthContext = React.createContext<AuthContext | null>(null);

const key = 'tanstack.auth.user';

function getStoredUser(): User | null {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
}

function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem(key, JSON.stringify(user));
  } else {
    localStorage.removeItem(key);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(getStoredUser());
  const isAuthenticated = Boolean(user); // In a real app, you would check for a valid user

  const logout = React.useCallback(async () => {
    await sleep(150);
    setStoredUser(null);
    setUser(null);
  }, []);

  const login = React.useCallback(
    async (credentials: { email: string; password: string }) => {
      await sleep(500);
      // In a real app, you would validate credentials here
      const user = {
        email: credentials.email,
        password: credentials.password,
        firstName: 'John',
        lastName: 'Doe'
      };
      setStoredUser(user);
      setUser(user);
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
        logout,
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
