import Link from "next/link";

export default function ReportsPage() {
  return (
    <main className="min-h-screen px-5 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="glass-panel rounded-[30px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">
            Reports
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Reports coming soon
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Transfer reports, count discrepancies, room metrics, and
            inventory exports will appear here.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}