'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith('/cases')) return 'Cases';
  if (pathname.startsWith('/users')) return 'User Management';
  if (pathname.startsWith('/analysis')) return 'Analysis';
  if (pathname.startsWith('/evidence')) return 'Evidence';
  return 'Dashboard';
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, user, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin';
  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/cases', label: 'Cases' },
    { href: '/evidence', label: 'Evidence' },
    ...(isAdmin ? [{ href: '/users', label: 'User Management' }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-[1400px] grid-cols-1 md:grid-cols-[272px_1fr]">
        <aside className="border-r border-slate-800 bg-slate-950 p-4 md:sticky md:top-0 md:h-screen md:overflow-y-auto md:p-5">
          <div className="mb-8 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Crime Evidence</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Operations Console</h2>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group block rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'border-sky-400/30 bg-sky-400/20 text-white shadow-[inset_0_0_0_1px_rgba(56,189,248,0.35)]'
                      : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{getPageTitle(pathname)}</h1>
              <p className="text-xs text-slate-500">Law enforcement operations dashboard</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-800">{user.name || 'Signed in user'}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
                <Badge variant="outline" className="mt-1 uppercase tracking-wide">
                  {user.role}
                </Badge>
              </div>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
