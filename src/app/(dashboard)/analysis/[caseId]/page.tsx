'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function AnalysisPage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params?.caseId || '';
  const { analyses, loading, error, fetchAnalysisHistory, runAnalysis } = useAnalysis();
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

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
                <div className="text-sm text-slate-700">
                  <span className="font-medium">Confidence:</span> {analysis.response.confidence}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
