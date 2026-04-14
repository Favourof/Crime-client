'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';

export default function UsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { users, loading, error, fetchUsers, createUser, deleteUser } = useUsers();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('investigator');
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSuccess(null);

    const result = await createUser({ name, email, password, role });
    if (result.success) {
      setSuccess('User created successfully');
      setName('');
      setEmail('');
      setPassword('');
      setRole('investigator');
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    const result = await deleteUser(id);
    if (result.success) {
      setSuccess('User deleted successfully');
    }
    setDeletingId(null);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading session...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        Access denied. Only administrators can manage users.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Create User</CardTitle>
          <CardDescription>Provision new dashboard users with role-based access.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="role">Role</Label>
              <Select
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="investigator">Investigator</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div className="flex items-end md:col-span-2">
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? 'Creating...' : 'Create user'}
              </Button>
            </div>
          </form>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
          {success && <p className="mt-4 text-sm text-emerald-600">{success}</p>}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Users
            <Badge variant="outline">{users.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-500">No users found.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell className="capitalize">{item.role}</TableCell>
                      <TableCell>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loading || deletingId === item.id || item.id === user?.id}
                          onClick={() => onDelete(item.id)}
                        >
                          {item.id === user?.id ? 'Current' : deletingId === item.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
