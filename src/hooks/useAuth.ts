'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getToken, removeToken, setToken } from '@/lib/auth';
import type { AuthResponse, User } from '@/types/auth';

interface MeResponse {
  message: string;
  data: {
    user: User;
  };
}

type UseAuthOptions = {
  auto?: boolean;
};

export const useAuth = (options: UseAuthOptions = {}) => {
  const { auto = true } = options;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get<MeResponse>('/auth/me');
      setUser(response.data.user);
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 401 || status === 403) {
        removeToken();
        setUser(null);
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!auto) {
      setLoading(false);
      return;
    }
    refreshSession();
  }, [auto, refreshSession]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      router.replace('/');
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout API failures and clear local session regardless.
    } finally {
      removeToken();
      setUser(null);
      router.replace('/login');
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    refreshSession,
  };
};
