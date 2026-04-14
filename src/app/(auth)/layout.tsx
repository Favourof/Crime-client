import { Badge } from '@/components/ui/badge';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -left-28 -top-35 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-30 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:px-8">
        <section className="hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-white/20 text-white">
              Secure Access
            </Badge>
            <h1 className="max-w-md text-3xl font-semibold leading-tight text-white">
              Crime Evidence Analysis Platform
            </h1>
            <p className="max-w-lg text-sm leading-6 text-slate-200/90">
              Authorized personnel only. Every action is tracked with role-based access controls,
              custody logs, and audit trails.
            </p>
          </div>

          <div className="space-y-2 text-sm text-slate-200/90">
            <p>1. Sign in with your assigned account.</p>
            <p>2. Cases, evidence, and analysis access follow your role permissions.</p>
            <p>3. Contact an administrator for account provisioning.</p>
          </div>
        </section>

        <section className="flex items-center justify-center">{children}</section>
      </main>
    </div>
  );
}
