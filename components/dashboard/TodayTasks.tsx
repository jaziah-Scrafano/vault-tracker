"use client";

import {
  CheckCircle2,
  Circle,
  ClipboardClock,
} from "lucide-react";

import type { MoveRecommendation } from "@/types/inventory";

type TodayTasksProps = {
  recommendations: MoveRecommendation[];
  completedPackageIds: string[];
  onComplete: (item: MoveRecommendation) => void;
  onViewAll: () => void;
};

export default function TodayTasks({
  recommendations,
  completedPackageIds,
  onComplete,
  onViewAll,
}: TodayTasksProps) {
  const pending = recommendations.filter(
    (item) => !completedPackageIds.includes(item.packageId)
  );

  const visibleTasks = pending.slice(0, 4);

  return (
    <section className="glass-card rounded-[26px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Today&apos;s Tasks
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Vault transfers
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {pending.length.toLocaleString()} pending package
            {pending.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)]">
          <ClipboardClock className="h-5 w-5 text-[var(--lime)]" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {visibleTasks.map((item) => (
          <div
            key={item.packageId}
            className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3"
          >
            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lime)]" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {item.product}
              </p>

              <p className="mt-1 truncate font-mono text-xs text-slate-500">
                {item.packageId}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {item.moveFrom} → {item.moveTo}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onComplete(item)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(184,255,57,0.18)] bg-[rgba(184,255,57,0.07)] text-[var(--lime)] transition hover:border-[rgba(184,255,57,0.35)] hover:bg-[rgba(184,255,57,0.12)]"
              aria-label={`Complete ${item.product}`}
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {visibleTasks.length === 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-8 text-center text-sm text-slate-500">
            No pending transfers.
          </div>
        )}
      </div>

      {pending.length > 4 && (
        <button
          type="button"
          onClick={onViewAll}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.075]"
        >
          View all {pending.length} transfers
        </button>
      )}
    </section>
  );
}