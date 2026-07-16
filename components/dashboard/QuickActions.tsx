"use client";

import {
  Download,
  RefreshCw,
  UploadCloud,
} from "lucide-react";

type QuickActionsProps = {
  onUploadClick: () => void;
  onExportClick: () => void;
  onRefreshClick: () => void;
  exportDisabled?: boolean;
};

export default function QuickActions({
  onUploadClick,
  onExportClick,
  onRefreshClick,
  exportDisabled = false,
}: QuickActionsProps) {
  return (
    <section className="glass-card rounded-[26px] p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Quick Actions
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white">
          Inventory controls
        </h2>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={onUploadClick}
          className="flex items-center justify-center gap-2 rounded-2xl border border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)] px-4 py-3 text-sm font-semibold text-[var(--lime)] transition hover:border-[rgba(184,255,57,0.35)] hover:bg-[rgba(184,255,57,0.12)]"
        >
          <UploadCloud className="h-4 w-4" />
          Upload CSV
        </button>

        <button
          type="button"
          onClick={onExportClick}
          disabled={exportDisabled}
          className="flex items-center justify-center gap-2 rounded-2xl border border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)] px-4 py-3 text-sm font-semibold text-[var(--blue)] transition hover:border-[rgba(126,162,255,0.35)] hover:bg-[rgba(126,162,255,0.12)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Download className="h-4 w-4" />
          Export Queue
        </button>

        <button
          type="button"
          onClick={onRefreshClick}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.075]"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh View
        </button>
      </div>
    </section>
  );
}