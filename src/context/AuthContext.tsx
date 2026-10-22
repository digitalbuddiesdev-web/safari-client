import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (creds: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The roles the server treats as staff (see server/src/utils/ownership.js).
const ADMIN_ROLES = ['super_admin', 'booking_manager', 'content_manager'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // A truncated or hand-edited sns_user would otherwise throw inside the useState
  // initialiser and white-screen the whole app before a single route renders.
  const readCachedUser = (): User | null => {
    try {
      const raw = localStorage.getItem('sns_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem('sns_user');
      return null;
    }
  };

  const [user, setUser] = useState<User | null>(readCachedUser);
  const [token, setToken] = useState<string | null>(localStorage.getItem('sns_token'));

  useEffect(() => {
    if (!token) return;
    authService.getMe().then(setUser).catch(() => logout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (creds: { email: string; password: string }) => {
    const res = await authService.login(creds);
    setUser(res.user);
    setToken(res.token);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      setUser(await authService.getMe());
    } catch (e) {
      console.error(e);
    }
  };

  const isAuthenticated = !!user && !!token;
  // Mirror the server's staff allowlist. "Anything that is not a customer" would
  // also let a role the server never granted into the admin shell.
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isAdmin, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
