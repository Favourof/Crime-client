'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useCases } from '@/hooks/useCases';
import { useEvidence } from '@/hooks/useEvidence';
import type { Case } from '@/types/case';
import type { Evidence } from '@/types/evidence';

type EvidenceType = 'physical' | 'digital' | 'testimonial';

export default function EvidencePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const caseId = params?.id || '';

  const { getCaseById } = useCases();
  const { evidences, loading, error, fetchEvidenceByCase, createEvidence, updateEvidence, deleteEvidence } = useEvidence();

  const [caseInfo, setCaseInfo] = useState<Case | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [activeEvidence, setActiveEvidence] = useState<Evidence | null>(null);

  const [type, setType] = useState<EvidenceType>('physical');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const [updateType, setUpdateType] = useState<EvidenceType>('physical');
  const [updateDescription, setUpdateDescription] = useState('');
  const [custodyAction, setCustodyAction] = useState('');
  const [updateFiles, setUpdateFiles] = useState<File[]>([]);

  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) return;
    fetchEvidenceByCase(caseId);
  }, [caseId, fetchEvidenceByCase]);

  useEffect(() => {
    const run = async () => {
      if (!caseId) return;
      try {
        const result = await getCaseById(caseId);
        setCaseInfo(result);
      } catch {
        setCaseInfo(null);
      }
    };

    run();
  }, [caseId, getCaseById]);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setActionError(null);
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  const sortedEvidences = useMemo(
    () => [...evidences].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [evidences]
  );

  const totalFiles = useMemo(
    () => sortedEvidences.reduce((sum, item) => sum + item.files.length, 0),
    [sortedEvidences]
  );

  const physicalCount = useMemo(
    () => sortedEvidences.filter((item) => item.type === 'physical').length,
    [sortedEvidences]
  );

  const digitalCount = useMemo(
    () => sortedEvidences.filter((item) => item.type === 'digital').length,
    [sortedEvidences]
  );

  const testimonialCount = useMemo(
    () => sortedEvidences.filter((item) => item.type === 'testimonial').length,
    [sortedEvidences]
  );

  const openUpdateModal = (item: Evidence) => {
    setActiveEvidence(item);
    setUpdateType(item.type);
    setUpdateDescription(item.description || '');
    setCustodyAction('');
    setUpdateFiles([]);
    setActionError(null);
    setIsUpdateOpen(true);
  };

  const onCreateEvidence = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!caseId) return;

    setSubmitting(true);
    setActionError(null);

    try {
      await createEvidence({
        caseId,
        type,
        description,
        files,
      });

      setType('physical');
      setDescription('');
      setFiles([]);
      setIsCreateOpen(false);
      await fetchEvidenceByCase(caseId);
    } catch (err) {
      setActionError((err as Error).message || 'Failed to create evidence');
    } finally {
      setSubmitting(false);
    }
  };

  const onUpdateEvidence = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeEvidence) return;

    setSubmitting(true);
    setActionError(null);

    try {
      await updateEvidence(activeEvidence.id, {
        type: updateType,
        description: updateDescription,
        custodyAction,
        files: updateFiles,
      });

      setIsUpdateOpen(false);
      setActiveEvidence(null);
      await fetchEvidenceByCase(caseId);
    } catch (err) {
      setActionError((err as Error).message || 'Failed to update evidence');
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteEvidence = async (evidenceId: string) => {
    const confirmed = window.confirm('Delete this evidence? This action cannot be undone.');
    if (!confirmed) return;

    setDeletingId(evidenceId);
    setActionError(null);
    try {
      await deleteEvidence(evidenceId);
      await fetchEvidenceByCase(caseId);
    } catch (err) {
      setActionError((err as Error).message || 'Failed to delete evidence');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Evidence</h2>
          <p className="mt-1 text-sm text-slate-600">Case ID: {caseId}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/cases/${caseId}`}
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
          >
            Back to Case
          </Link>
          <Button
            onClick={() => {
              setActionError(null);
              setIsCreateOpen(true);
            }}
          >
            Add Evidence
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Case Evidence Summary</CardTitle>
          <CardDescription>
            {caseInfo
              ? `${caseInfo.title} - ${caseInfo.status} - ${caseInfo.location}`
              : 'Case information unavailable'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Evidence Items</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{sortedEvidences.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Files</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{totalFiles}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">By Type</p>
            <p className="mt-1 text-sm text-slate-800">
              Physical: {physicalCount} - Digital: {digitalCount} - Testimonial: {testimonialCount}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Created By</p>
            <p className="mt-1 text-sm text-slate-800">{caseInfo?.createdBy?.name || 'Unknown'}</p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Loading evidence...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : sortedEvidences.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600">No evidence found for this case.</div>
      ) : (
        <div className="space-y-4">
          {sortedEvidences.map((item) => (
            <Card key={item.id} className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base capitalize">{item.type} Evidence</CardTitle>
                  <Badge variant="outline">{new Date(item.createdAt).toLocaleString()}</Badge>
                </div>
                <CardDescription>{item.description || 'No description provided.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Files</p>
                  {item.files.length === 0 ? (
                    <p className="text-sm text-slate-500">No files attached.</p>
                  ) : (
                    <div className="space-y-1">
                      {item.files.map((file) => (
                        <a
                          key={file.publicId}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-sm text-sky-700 underline underline-offset-2"
                        >
                          {file.resourceType}/{file.format || 'unknown'} ({Math.ceil(file.size / 1024)} KB)
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Collected By</p>
                  <p className="text-sm text-slate-700">{item.collectedBy || 'Unknown collector'}</p>
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Latest Custody Action</p>
                  <p className="text-sm text-slate-700">
                    {item.custodyLog.length
                      ? `${item.custodyLog[item.custodyLog.length - 1].action} by ${item.custodyLog[item.custodyLog.length - 1].officer}`
                      : 'No custody entries.'}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Custody Timeline</p>
                  {item.custodyLog.length === 0 ? (
                    <p className="text-sm text-slate-500">No custody timeline available.</p>
                  ) : (
                    <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                      {item.custodyLog.map((entry, index) => (
                        <div key={`${entry.timestamp}-${entry.action}-${index}`} className="text-sm text-slate-700">
                          <span className="font-medium">{entry.action}</span> by {entry.officer}
                          <span className="block text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => openUpdateModal(item)}>
                    Update Evidence
                  </Button>
                  <Button
                    variant="outline"
                    className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => onDeleteEvidence(item.id)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete Evidence'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isCreateOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4">
          <Card className="z-50 w-full max-w-2xl border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle>Add Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onCreateEvidence} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select id="type" value={type} onChange={(event) => setType(event.target.value as EvidenceType)}>
                    <option value="physical">Physical</option>
                    <option value="digital">Digital</option>
                    <option value="testimonial">Testimonial</option>
                  </Select>
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="files">Attach Files</Label>
                  <Input
                    id="files"
                    type="file"
                    multiple
                    onChange={(event) => setFiles(Array.from(event.target.files || []))}
                  />
                </div>
                {actionError ? <p className="md:col-span-2 text-sm text-rose-600">{actionError}</p> : null}
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Evidence'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {isUpdateOpen && activeEvidence ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4">
          <Card className="z-50 w-full max-w-2xl border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle>Update Evidence</CardTitle>
              <CardDescription>Custody action is required for each update.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onUpdateEvidence} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="updateType">Type</Label>
                  <Select id="updateType" value={updateType} onChange={(event) => setUpdateType(event.target.value as EvidenceType)}>
                    <option value="physical">Physical</option>
                    <option value="digital">Digital</option>
                    <option value="testimonial">Testimonial</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custodyAction">Custody Action</Label>
                  <Input
                    id="custodyAction"
                    value={custodyAction}
                    onChange={(event) => setCustodyAction(event.target.value)}
                    placeholder="e.g. transferred"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="updateDescription">Description</Label>
                  <Textarea
                    id="updateDescription"
                    value={updateDescription}
                    onChange={(event) => setUpdateDescription(event.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="updateFiles">Add More Files</Label>
                  <Input
                    id="updateFiles"
                    type="file"
                    multiple
                    onChange={(event) => setUpdateFiles(Array.from(event.target.files || []))}
                  />
                </div>
                {actionError ? <p className="md:col-span-2 text-sm text-rose-600">{actionError}</p> : null}
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsUpdateOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Evidence'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
