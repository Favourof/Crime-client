'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EvidenceHomePage() {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Evidence Workspace</CardTitle>
          <CardDescription>
            Evidence is organized by case. Open a case first, then manage evidence under that case.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/cases"
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Go to Cases
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
