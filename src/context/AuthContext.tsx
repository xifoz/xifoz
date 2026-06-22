import React, { useState } from 'react';
import { AuthContext } from './auth-context';
import type { AdminUser } from './auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('xifoz_admin_session');
      if (session) {
        try {
          return JSON.parse(session) as AdminUser;
        } catch {
          localStorage.removeItem('xifoz_admin_session');
        }
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('xifoz_admin_session') !== null;
    }
    return false;
  });

  const login = (email: string, name: string) => {
    const user: AdminUser = { name, email };
    localStorage.setItem('xifoz_admin_session', JSON.stringify(user));
    setAdmin(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('xifoz_admin_session');
    setAdmin(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
