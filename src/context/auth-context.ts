import { createContext } from 'react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SECURITY_ADMIN' | 'READ_ONLY';
  lastLoginAt?: string | null;
}

export interface AuthContextType {
  authenticated: boolean;
  user: AdminUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  getProfile: () => Promise<void>;
}


export const AuthContext = createContext<AuthContextType | undefined>(undefined);
