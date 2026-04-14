'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
  return (
    <div className="w-full max-w-md">
      <Card className="border-white/10 bg-white text-slate-900 shadow-xl shadow-slate-950/20">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="w-fit">
            Account Provisioning
          </Badge>
          <CardTitle className="text-2xl">Signup is restricted</CardTitle>
          <CardDescription>
            Public signup is disabled for security. New accounts are created by administrators.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            If you need access, contact your security admin with your official agency email.
          </p>
          <div className="flex gap-2">
            <Link
              href="/login"
              className="inline-flex h-9 flex-1 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Back to Login
            </Link>
            <Link
              href="mailto:admin@agency.gov"
              className="inline-flex h-9 flex-1 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              Contact Admin
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
