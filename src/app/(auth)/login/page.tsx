'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading, error, refreshSession } = useAuth({ auto: false });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const token = getToken();
    if (token) {
      refreshSession();
    }
  }, [refreshSession]);

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await login(email, password);
  };

  return (
    <div className="w-full max-w-md">
      <Card className="border-white/10 bg-white text-slate-900 shadow-xl shadow-slate-950/20">
        <CardHeader className="space-y-3">
          <Badge variant="secondary" className="w-fit">
            Authorized Access
          </Badge>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to continue to your dashboard. Accounts are provisioned by administrators.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@agency.gov"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            <Button type="submit" className="h-10 w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Need an account? Contact your administrator or{' '}
            <Link href="mailto:admin@agency.gov" className="font-medium text-slate-700 underline underline-offset-2">
              security admin
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
