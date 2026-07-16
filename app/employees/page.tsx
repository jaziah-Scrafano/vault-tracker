import Link from "next/link";

export default function EmployeesPage() {
  return (
    <main className="min-h-screen px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <section className="glass-panel rounded-[30px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lime)]">
            Employees
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Employee management
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            The employee management interface is being connected to
            Supabase.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            Return to dashboard
          </Link>
        </section>
      </div>
    </main>
  );
}