import { createContext } from 'react';

export interface AdminUser {
  name: string;
  email: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  login: (email: string, name: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
