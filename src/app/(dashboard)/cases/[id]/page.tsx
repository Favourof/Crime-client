'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCases } from '@/hooks/useCases';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useEvidence } from '@/hooks/useEvidence';
import { useUsers } from '@/hooks/useUsers';
import type { CaseAuditEvent } from '@/hooks/useCases';
import type { Case, CaseStatus } from '@/types/case';

const NEXT_STATUS: Record<CaseStatus, CaseStatus | null> = {
  open: 'investigating',
  investigating: 'closed',
  closed: null,
};

const STATUS_STYLES: Record<CaseStatus, string> = {
  open: 'bg-slate-200 text-slate-800',
  investigating: 'bg-amber-100 text-amber-800',
  closed: 'bg-emerald-100 text-emerald-800',
};

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const caseId = params?.id;

  const { user } = useAuth();
  const { getCaseById, updateCase, changeCaseStatus, assignInvestigator, getCaseAudit } = useCases();
  const { evidences, fetchEvidenceByCase } = useEvidence();
  const { users, fetchUsers } = useUsers();

  const [caseItem, setCaseItem] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedInvestigatorId, setSelectedInvestigatorId] = useState('');
  const [investigatorSearch, setInvestigatorSearch] = useState('');
  const [confirmReassign, setConfirmReassign] = useState(false);
  const [auditEvents, setAuditEvents] = useState<CaseAuditEvent[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [crimeType, setCrimeType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const debouncedInvestigatorSearch = useDebouncedValue(investigatorSearch, 250);

  const loadAudit = async (targetCaseId: string) => {
    setLoadingAudit(true);
    setAuditError(null);
    try {
      const result = await getCaseAudit(targetCaseId, 8);
      setAuditEvents(result);
    } catch (err) {
      setAuditError((err as Error).message || 'Failed to load case timeline');
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!caseId) return;

      setLoading(true);
      setError(null);

      try {
        const result = await getCaseById(caseId);
        setCaseItem(result);
        setTitle(result.title);
        setCrimeType(result.crimeType);
        setLocation(result.location);
        setDescription(result.description || '');
        await loadAudit(result.id);
      } catch (err) {
        setError((err as Error).message || 'Failed to load case');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [caseId, getCaseById]);

  useEffect(() => {
    if (!caseId) return;
    fetchEvidenceByCase(caseId);
  }, [caseId, fetchEvidenceByCase]);

  const canEdit = useMemo(() => {
    if (!user || !caseItem) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'investigator' && caseItem.status !== 'closed') {
      return user.id === caseItem.createdBy.id || user.id === caseItem.assignedTo?.id;
    }
    return false;
  }, [user, caseItem]);

  const nextStatus = caseItem ? NEXT_STATUS[caseItem.status] : null;
  const canChangeStatus = Boolean(nextStatus && canEdit);
  const isAdmin = user?.role === 'admin';
  const investigators = useMemo(
    () => users.filter((candidate) => candidate.role === 'investigator'),
    [users]
  );
  const filteredInvestigators = useMemo(() => {
    const term = debouncedInvestigatorSearch.trim().toLowerCase();
    if (!term) return investigators;
    return investigators.filter((candidate) => {
      const full = `${candidate.name} ${candidate.email}`.toLowerCase();
      return full.includes(term);
    });
  }, [debouncedInvestigatorSearch, investigators]);

  const handleUpdateCase = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!caseItem) return;

    setSaving(true);
    setActionError(null);

    try {
      const updated = await updateCase(caseItem.id, {
        title,
        crimeType,
        location,
        description,
      });
      setCaseItem(updated);
    } catch (err) {
      setActionError((err as Error).message || 'Failed to update case');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    if (!caseItem || !nextStatus) return;

    setSaving(true);
    setActionError(null);

    try {
      const updated = await changeCaseStatus(caseItem.id, nextStatus);
      setCaseItem(updated);
      await loadAudit(updated.id);
    } catch (err) {
      setActionError((err as Error).message || 'Failed to change status');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAssign = async () => {
    if (!caseItem) return;
    setActionError(null);
    setConfirmReassign(false);
    setInvestigatorSearch('');
    setSelectedInvestigatorId(caseItem.assignedTo?.id || '');
    await fetchUsers();
    setIsAssignOpen(true);
  };

  const handleAssignInvestigator = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!caseItem || !selectedInvestigatorId) return;

    setAssigning(true);
    setActionError(null);
    try {
      const updated = await assignInvestigator(caseItem.id, {
        investigatorId: selectedInvestigatorId,
        confirmReassign,
      });
      setCaseItem(updated);
      await loadAudit(updated.id);
      setIsAssignOpen(false);
    } catch (err) {
      setActionError((err as Error).message || 'Failed to assign investigator');
    } finally {
      setAssigning(false);
    }
  };

  const formatAuditAction = (action: string) =>
    action
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Loading case...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !caseItem) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error || 'Case not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {caseItem.title}
            <Badge className={STATUS_STYLES[caseItem.status]}>{caseItem.status}</Badge>
          </CardTitle>
          <CardDescription>
            Created by {caseItem.createdBy.name} - {new Date(caseItem.createdAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Crime Type</p>
            <p className="mt-1 capitalize">{caseItem.crimeType}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
            <p className="mt-1">{caseItem.location}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Assigned Investigator</p>
            <p className="mt-1">{caseItem.assignedTo?.name || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Last Updated</p>
            <p className="mt-1">{new Date(caseItem.updatedAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Evidence Items</p>
            <p className="mt-1">{evidences.length}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
            <p className="mt-1 whitespace-pre-wrap">{caseItem.description || 'No description provided.'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Case Timeline</CardTitle>
          <CardDescription>Recent assignment and status activity for this case.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAudit ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : auditError ? (
            <p className="text-sm text-rose-600">{auditError}</p>
          ) : auditEvents.length === 0 ? (
            <p className="text-sm text-slate-500">No timeline activity yet.</p>
          ) : (
            <div className="space-y-3">
              {auditEvents.map((event) => (
                <div key={event.id} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
                  <p className="font-medium text-slate-900">{formatAuditAction(event.action)}</p>
                  <p className="text-slate-600">
                    {event.actor?.name || 'System'} - {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Case Actions</CardTitle>
          <CardDescription>Update case details and progress investigation status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => {
              setActionError(null);
              setIsActionOpen(true);
            }}
          >
            Open Case Actions
          </Button>
          {isAdmin ? (
            <Button variant="outline" onClick={handleOpenAssign}>
              Assign Investigator
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {isActionOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4">
          <Card className="z-50 w-full max-w-2xl border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-base">Case Actions</CardTitle>
              <CardDescription>Update case details and progress investigation status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleUpdateCase} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    disabled={!canEdit || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crimeType">Crime Type</Label>
                  <Input
                    id="crimeType"
                    value={crimeType}
                    onChange={(event) => setCrimeType(event.target.value)}
                    disabled={!canEdit || saving}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    disabled={!canEdit || saving}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    disabled={!canEdit || saving}
                  />
                </div>
                <div className="md:col-span-2 flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsActionOpen(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!canEdit || saving}>
                    {saving ? 'Saving...' : 'Update Case'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canChangeStatus || saving}
                    onClick={handleStatusChange}
                  >
                    {nextStatus ? `Move to ${nextStatus}` : 'No further status'}
                  </Button>
                </div>
              </form>
              {actionError ? <p className="text-sm text-rose-600">{actionError}</p> : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {isAssignOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4">
          <Card className="z-50 w-full max-w-lg border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-base">Assign Investigator</CardTitle>
              <CardDescription>Only admins can assign or reassign case ownership.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAssignInvestigator} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="investigator-search">Search investigator</Label>
                  <Input
                    id="investigator-search"
                    value={investigatorSearch}
                    onChange={(event) => setInvestigatorSearch(event.target.value)}
                    placeholder="Search by name or email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investigator">Investigator</Label>
                  <Select
                    id="investigator"
                    value={selectedInvestigatorId}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                      setSelectedInvestigatorId(event.target.value)
                    }
                    required
                  >
                    <option value="">Select investigator</option>
                    {filteredInvestigators.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} ({candidate.email})
                      </option>
                    ))}
                  </Select>
                  {filteredInvestigators.length === 0 ? (
                    <p className="text-xs text-slate-500">No investigators match your search.</p>
                  ) : null}
                </div>

                {caseItem.assignedTo ? (
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={confirmReassign}
                      onChange={(event) => setConfirmReassign(event.target.checked)}
                    />
                    Confirm reassignment from current investigator
                  </label>
                ) : null}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)} disabled={assigning}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={assigning || !selectedInvestigatorId}>
                    {assigning ? 'Assigning...' : 'Assign Case'}
                  </Button>
                </div>
              </form>
              {actionError ? <p className="text-sm text-rose-600">{actionError}</p> : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Quick Links</CardTitle>
          <CardDescription>Open evidence and analysis workspace for this case.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href={`/analysis/${caseItem.id}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Open Analysis
          </Link>
          <Link
            href={`/evidence/${caseItem.id}`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
          >
            Open Evidence
          </Link>
          <Link
            href={`/evidence/${caseItem.id}?create=1`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
          >
            Add Evidence
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
