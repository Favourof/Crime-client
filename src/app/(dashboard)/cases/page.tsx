'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaseFilters } from '@/components/cases/CaseFilters';
import { CasePagination } from '@/components/cases/CasePagination';
import { CaseTable } from '@/components/cases/CaseTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCases } from '@/hooks/useCases';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { CaseStatus } from '@/types/case';

export default function CasesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cases, loading, error, meta, fetchCases, createCase } = useCases();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<CaseStatus | ''>('');
  const [crimeType, setCrimeType] = useState('');
  const [title, setTitle] = useState('');
  const [newCrimeType, setNewCrimeType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const debouncedCrimeType = useDebouncedValue(crimeType, 400);

  useEffect(() => {
    fetchCases({ page, status, crimeType: debouncedCrimeType });
  }, [fetchCases, page, status, debouncedCrimeType]);

  const canCreateCase = useMemo(() => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'investigator';
  }, [user]);

  const handleStatusChange = (value: CaseStatus | '') => {
    setPage(1);
    setStatus(value);
  };

  const handleCrimeTypeChange = (value: string) => {
    setPage(1);
    setCrimeType(value);
  };

  const handlePreviousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const handleNextPage = () => {
    setPage((current) => Math.min(meta.totalPages, current + 1));
  };

  const handleCreateCase = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const created = await createCase({
        title,
        crimeType: newCrimeType,
        location,
        description,
      });

      setTitle('');
      setNewCrimeType('');
      setLocation('');
      setDescription('');
      setIsCreateOpen(false);
      await fetchCases({ page: 1, status, crimeType: debouncedCrimeType });
      setPage(1);
      router.push(`/cases/${created.id}`);
    } catch (err) {
      setSubmitError((err as Error).message || 'Failed to create case');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Cases</h2>
        <p className="mt-1 text-sm text-slate-600">
          Track active investigations and review case records with status-based filtering.
        </p>
      </div>

      {canCreateCase ? (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setSubmitError(null);
              setIsCreateOpen(true);
            }}
          >
            Create Case
          </Button>
        </div>
      ) : null}

      {isCreateOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4">
          <Card className="z-50 w-full max-w-2xl rounded-xl border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-base">Create Case</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCase} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="crimeType">Crime Type</Label>
                  <Input
                    id="crimeType"
                    value={newCrimeType}
                    onChange={(event) => setNewCrimeType(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                  />
                </div>
                {submitError ? <p className="md:col-span-2 text-sm text-rose-600">{submitError}</p> : null}
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Case'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <CaseFilters
        status={status}
        crimeType={crimeType}
        onStatusChange={handleStatusChange}
        onCrimeTypeChange={handleCrimeTypeChange}
      />

      {loading ? (
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Loading cases...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : cases.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
          No cases found
        </div>
      ) : (
        <CaseTable
          cases={cases}
          currentUserId={user?.id}
          onRowClick={(caseId) => router.push(`/cases/${caseId}`)}
        />
      )}

      <CasePagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
      />
    </div>
  );
}
