import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types/auth';

type RawUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

interface UsersResponse {
  data: RawUser[];
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<UsersResponse>('/auth/users');
      const mapped = response.data.map((item) => ({
        id: item._id,
        name: item.name,
        email: item.email,
        role: item.role,
        createdAt: item.createdAt,
      }));
      setUsers(mapped);
    } catch (err) {
      setError((err as Error).message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(
    async (payload: { name: string; email: string; password: string; role?: string }) => {
      setLoading(true);
      setError(null);
      try {
        await api.post('/auth/users', payload);
        await fetchUsers();
        return { success: true };
      } catch (err) {
        const message = (err as Error).message || 'Failed to create user';
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/auth/users/${id}`);
        await fetchUsers();
        return { success: true };
      } catch (err) {
        const message = (err as Error).message || 'Failed to delete user';
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers]
  );

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    deleteUser,
  };
};
