import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './auth-context';
import type { AdminUser } from './auth-context';
import { apiClient } from '@/lib/api-client';

interface AuthResponseData {
  success: boolean;
  data: {
    accessToken: string;
    user: AdminUser;
  };
}

interface ProfileResponseData {
  success: boolean;
  data: {
    user: AdminUser;
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const logout = useCallback(async () => {
    try {
      if (apiClient.getAccessToken()) {
        await apiClient.post('/api/auth/logout');
      }
    } catch (err) {
      // Even if network request fails, clear local credentials
      console.error('Logout request failed:', err);
    } finally {
      apiClient.setAccessToken(null);
      setUser(null);
      setAuthenticated(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await apiClient.post<AuthResponseData>('/api/auth/refresh');
      if (response.success && response.data.accessToken) {
        apiClient.setAccessToken(response.data.accessToken);
        setUser(response.data.user);
        setAuthenticated(true);
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (err) {
      apiClient.setAccessToken(null);
      setUser(null);
      setAuthenticated(false);
      throw err;
    }
  }, []);


  const getProfile = useCallback(async () => {
    const response = await apiClient.get<ProfileResponseData>('/api/auth/me');
    if (response.success && response.data.user) {
      setUser(response.data.user);
    } else {
      throw new Error('Failed to retrieve profile');
    }
  }, []);

  // Initialize: attempt to refresh token on app mount to restore session
  useEffect(() => {
    let active = true;

    async function initSession() {
      try {
        // Register API client unauthorized listener
        apiClient.onUnauthorized(() => {
          if (active) {
            setUser(null);
            setAuthenticated(false);
          }
        });

        await refresh();
      } catch {
        // No active session/cookie, ignore and allow user to log in
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initSession();

    return () => {
      active = false;
    };
  }, [refresh]);

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        user,
        loading,
        logout,
        refresh,
        getProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
