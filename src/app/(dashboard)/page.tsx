'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardOverview } from '@/hooks/useDashboardOverview';

export default function DashboardHomePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { loading, error, metrics, createdByMe, assignedCases, recentEvidenceActivity, refresh } = useDashboardOverview();

  useEffect(() => {
    refresh(user);
  }, [refresh, user]);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            Overview
          </Badge>
          <CardTitle className="text-2xl">Crime Analysis Dashboard</CardTitle>
          <CardDescription>
            Review active investigations, inspect evidence trails, and coordinate case analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Access Level</p>
            <p className="mt-1 text-sm font-semibold capitalize text-slate-800">{user?.role || 'Investigator'}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Signed In As</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{user?.name || 'Unknown'}</p>
            <p className="mt-0.5 text-xs break-all text-slate-500">{user?.email || ''}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">System Status</p>
            <p className="mt-1 text-sm font-semibold text-emerald-700">Operational</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <Card className="border-slate-200 shadow-sm"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Total Cases</p><p className="mt-1 text-2xl font-semibold text-slate-900">{metrics.totalCases}</p></CardContent></Card>
            <Card className="border-slate-200 shadow-sm"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Open</p><p className="mt-1 text-2xl font-semibold text-slate-900">{metrics.openCases}</p></CardContent></Card>
            <Card className="border-slate-200 shadow-sm"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Investigating</p><p className="mt-1 text-2xl font-semibold text-slate-900">{metrics.investigatingCases}</p></CardContent></Card>
            <Card className="border-slate-200 shadow-sm"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Closed</p><p className="mt-1 text-2xl font-semibold text-slate-900">{metrics.closedCases}</p></CardContent></Card>
            <Card className="border-slate-200 shadow-sm"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Pending Assignments</p><p className="mt-1 text-2xl font-semibold text-slate-900">{metrics.pendingAssignments}</p></CardContent></Card>
            <Card className="border-slate-200 shadow-sm"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Recent Evidence Items</p><p className="mt-1 text-2xl font-semibold text-slate-900">{metrics.recentEvidenceItems}</p></CardContent></Card>
          </>
        )}
      </div>

      {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Created Cases</CardTitle>
            <CardDescription>Most recent cases created by you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : createdByMe.length === 0 ? (
              <p className="text-sm text-slate-500">No recently created cases.</p>
            ) : (
              createdByMe.map((item) => (
                <Link
                  key={item.id}
                  href={`/cases/${item.id}`}
                  className="block rounded-md border border-slate-200 px-3 py-2 transition-colors hover:bg-slate-50"
                >
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {item.crimeType} - {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Assigned Cases</CardTitle>
            <CardDescription>
              {isAdmin ? 'Latest cases that already have an assignee.' : 'Latest cases assigned to you.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : assignedCases.length === 0 ? (
              <p className="text-sm text-slate-500">No recently assigned cases.</p>
            ) : (
              assignedCases.map((item) => (
                <Link
                  key={item.id}
                  href={`/cases/${item.id}`}
                  className="block rounded-md border border-slate-200 px-3 py-2 transition-colors hover:bg-slate-50"
                >
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    Assigned to: {item.assignedTo?.name || 'Unassigned'} - {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent Evidence Activity</CardTitle>
          <CardDescription>Latest evidence updates in your recent accessible cases.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </>
          ) : recentEvidenceActivity.length === 0 ? (
            <p className="text-sm text-slate-500">No recent evidence activity.</p>
          ) : (
            recentEvidenceActivity.map((activity) => (
              <Link
                key={activity.id}
                href={`/evidence/${activity.caseId}`}
                className="block rounded-md border border-slate-200 px-3 py-2 transition-colors hover:bg-slate-50"
              >
                <p className="text-sm font-medium text-slate-900">{activity.caseTitle}</p>
                <p className="text-xs text-slate-500">
                  {activity.type} - {activity.lastAction} - {new Date(activity.updatedAt).toLocaleString()}
                </p>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Admin Controls</CardTitle>
            <CardDescription>Manage investigator access and roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/users"
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Open User Management
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
