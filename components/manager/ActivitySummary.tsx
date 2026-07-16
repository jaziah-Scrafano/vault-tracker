"use client";

import {
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  TrendingUp,
} from "lucide-react";

import type { CountSessionSummary } from "@/types/analytics";

type ActivitySummaryProps = {
  completedTransfersToday: number;
  latestCount: CountSessionSummary | null;
};

export default function ActivitySummary({
  completedTransfersToday,
  latestCount,
}: ActivitySummaryProps) {
  const countedRows = latestCount?.countedRows ?? 0;
  const matchedRows = latestCount?.matchedRows ?? 0;
  const mismatchedRows = latestCount?.mismatchedRows ?? 0;
  const accuracy = latestCount?.accuracy ?? 0;
  const progress = latestCount?.progress ?? 0;

  return (
    <section className="glass-panel h-full rounded-[30px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">
            Today&apos;s activity
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Shift performance
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            A live summary of transfer completion and the latest
            inventory count session.
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)]">
          <TrendingUp className="h-5 w-5 text-[var(--blue)]" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ActivityMetric
          label="Transfers completed"
          value={completedTransfersToday}
          description="Completed today"
          icon={PackageCheck}
          tone="lime"
        />

        <ActivityMetric
          label="Packages counted"
          value={countedRows}
          description={
            latestCount
              ? `${progress}% of latest count`
              : "No count session yet"
          }
          icon={ClipboardCheck}
          tone="blue"
        />

        <ActivityMetric
          label="Exact matches"
          value={matchedRows}
          description="Counted rows with zero variance"
          icon={CheckCircle2}
          tone="lime"
        />

        <ActivityMetric
          label="Discrepancies"
          value={mismatchedRows}
          description="Counted rows requiring review"
          icon={ClipboardCheck}
          tone={mismatchedRows > 0 ? "red" : "blue"}
        />
      </div>

      <div className="mt-5 rounded-[24px] border border-white/[0.08] bg-black/20 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Latest count accuracy
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Based only on rows that have been physically counted.
            </p>
          </div>

          <p
            className={`metric-number text-4xl font-semibold ${
              latestCount && accuracy === 100
                ? "text-[var(--lime)]"
                : latestCount && accuracy < 90
                  ? "text-[var(--red)]"
                  : "text-[var(--blue)]"
            }`}
          >
            {latestCount ? `${accuracy}%` : "—"}
          </p>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              latestCount && accuracy === 100
                ? "bg-[var(--lime)]"
                : latestCount && accuracy < 90
                  ? "bg-[var(--red)]"
                  : "bg-[var(--blue)]"
            }`}
            style={{
              width: latestCount
                ? `${Math.max(0, Math.min(100, accuracy))}%`
                : "0%",
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            {latestCount
              ? `${latestCount.scopeType}: ${latestCount.scopeValue}`
              : "No completed count session"}
          </span>

          <span>
            {latestCount
              ? `${latestCount.countedRows.toLocaleString()} counted`
              : "Start a count to populate this metric"}
          </span>
        </div>
      </div>
    </section>
  );
}

type ActivityTone = "lime" | "blue" | "red";

type ActivityMetricProps = {
  label: string;
  value: number;
  description: string;
  icon: typeof PackageCheck;
  tone: ActivityTone;
};

function ActivityMetric({
  label,
  value,
  description,
  icon: Icon,
  tone,
}: ActivityMetricProps) {
  const styles: Record<
    ActivityTone,
    {
      text: string;
      surface: string;
    }
  > = {
    lime: {
      text: "text-[var(--lime)]",
      surface:
        "border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.07)]",
    },
    blue: {
      text: "text-[var(--blue)]",
      surface:
        "border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.07)]",
    },
    red: {
      text: "text-[var(--red)]",
      surface:
        "border-[rgba(255,100,127,0.2)] bg-[rgba(255,100,127,0.07)]",
    },
  };

  const selected = styles[tone];

  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p
            className={`metric-number mt-3 text-3xl font-semibold ${selected.text}`}
          >
            {value.toLocaleString()}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${selected.surface}`}
        >
          <Icon className={`h-4 w-4 ${selected.text}`} />
        </div>
      </div>
    </div>
  );
}