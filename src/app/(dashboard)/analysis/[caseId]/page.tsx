'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function AnalysisPage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params?.caseId || '';
  const { analyses, loading, error, fetchAnalysisHistory, runAnalysis, previewPrompt, saveAnalysis } =
    useAnalysis();
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const [savingManual, setSavingManual] = useState(false);
  const [manualJson, setManualJson] = useState(
    '{\n  "patterns": [],\n  "insights": [],\n  "recommendations": [],\n  "confidence": "medium"\n}'
  );
  const [manualProvider, setManualProvider] = useState('external');
  const [manualModel, setManualModel] = useState('');

  useEffect(() => {
    if (!caseId) return;
    fetchAnalysisHistory(caseId);
  }, [caseId, fetchAnalysisHistory]);

  const onRunAnalysis = async () => {
    if (!caseId) return;
    setRunError(null);
    setRunning(true);

    try {
      await runAnalysis(caseId);
      await fetchAnalysisHistory(caseId);
    } catch (err) {
      setRunError((err as Error).message || 'Failed to run analysis');
    } finally {
      setRunning(false);
    }
  };

  const onPreviewPrompt = async () => {
    if (!caseId) return;
    setRunError(null);
    setPreviewLoading(true);
    try {
      const prompt = await previewPrompt(caseId);
      setPreviewText(prompt);
      setPreviewOpen(true);
    } catch (err) {
      setRunError((err as Error).message || 'Failed to preview prompt');
    } finally {
      setPreviewLoading(false);
    }
  };

  const onSaveManualAnalysis = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!caseId) return;

    setRunError(null);
    setSavingManual(true);
    try {
      const parsed = JSON.parse(manualJson) as {
        patterns: string[];
        insights: string[];
        recommendations: string[];
        confidence: 'low' | 'medium' | 'high';
      };
      await saveAnalysis(caseId, {
        analysis: parsed,
        provider: manualProvider,
        model: manualModel || undefined,
      });
      setSaveOpen(false);
      await fetchAnalysisHistory(caseId);
    } catch (err) {
      setRunError((err as Error).message || 'Failed to save manual analysis');
    } finally {
      setSavingManual(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Case Analysis</h2>
          <p className="mt-1 text-sm text-slate-600">Case ID: {caseId}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/cases/${caseId}`}
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
          >
            Back to Case
          </Link>
          <Button variant="outline" onClick={onPreviewPrompt} disabled={previewLoading}>
            {previewLoading ? 'Loading Prompt...' : 'Preview Prompt'}
          </Button>
          <Button variant="outline" onClick={() => setSaveOpen(true)}>
            Save Manual Analysis
          </Button>
          <Button onClick={onRunAnalysis} disabled={running}>
            {running ? 'Running...' : 'Run Analysis'}
          </Button>
        </div>
      </div>

      {runError ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{runError}</div> : null}

      {loading ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Loading analysis history...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : analyses.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600">No analysis history found.</div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">Analysis Result</CardTitle>
                  <Badge variant="outline">{new Date(analysis.createdAt).toLocaleString()}</Badge>
                </div>
                <CardDescription>
                  By {analysis.createdBy.name}
                  {analysis.createdBy.email ? ` (${analysis.createdBy.email})` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <span className="font-medium text-slate-800">Confidence:</span> {analysis.response.confidence}
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">Patterns</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {analysis.response.patterns.map((item, index) => (
                      <li key={`p-${analysis.id}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">Insights</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {analysis.response.insights.map((item, index) => (
                      <li key={`i-${analysis.id}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">Recommendations</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {analysis.response.recommendations.map((item, index) => (
                      <li key={`r-${analysis.id}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">Prompt Snapshot</p>
                  <p className="line-clamp-4 whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                    {analysis.prompt}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {previewOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4">
          <Card className="z-50 w-full max-w-4xl border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle>Analysis Prompt Preview</CardTitle>
              <CardDescription>This is the exact prompt generated from case and evidence data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800">
                {previewText}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {saveOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4">
          <Card className="z-50 w-full max-w-3xl border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle>Save Manual Analysis</CardTitle>
              <CardDescription>Paste strict JSON analysis payload and save it to case history.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSaveManualAnalysis} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-800">Provider</label>
                    <input
                      value={manualProvider}
                      onChange={(event) => setManualProvider(event.target.value)}
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-800">Model (optional)</label>
                    <input
                      value={manualModel}
                      onChange={(event) => setManualModel(event.target.value)}
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800">Analysis JSON</label>
                  <Textarea
                    value={manualJson}
                    onChange={(event) => setManualJson(event.target.value)}
                    rows={14}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setSaveOpen(false)} disabled={savingManual}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingManual}>
                    {savingManual ? 'Saving...' : 'Save Analysis'}
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
