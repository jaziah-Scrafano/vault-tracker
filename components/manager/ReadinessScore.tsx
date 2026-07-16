"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  ShieldAlert,
} from "lucide-react";

type ReadinessScoreProps = {
  score: number;
  label: string;
  pendingTransfers: number;
  missingVaultProducts: number;
  receivingPackages: number;
  countDiscrepancies: number;
};

export default function ReadinessScore({
  score,
  label,
  pendingTransfers,
  missingVaultProducts,
  receivingPackages,
  countDiscrepancies,
}: ReadinessScoreProps) {
  const scoreStyle = getScoreStyle(score);
  const circumference = 2 * Math.PI * 52;
  const progressOffset =
    circumference - (score / 100) * circumference;

  return (
    <section className="glass-panel h-full rounded-[30px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Store readiness
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Inventory health
          </h2>

          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
            A live operational score based on Vault coverage,
            receiving workload, duplicate packages, and count
            accuracy.
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${scoreStyle.iconSurface}`}
        >
          <Gauge className={`h-5 w-5 ${scoreStyle.text}`} />
        </div>
      </div>

      <div className="mt-7 grid items-center gap-7 xl:grid-cols-[220px_1fr]">
        <div className="relative mx-auto flex h-[190px] w-[190px] items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            className="h-full w-full -rotate-90"
            aria-label={`Store readiness score ${score} percent`}
          >
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="8"
            />

            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              className={`transition-all duration-700 ${scoreStyle.text}`}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p
              className={`metric-number text-5xl font-semibold ${scoreStyle.text}`}
            >
              {score}
            </p>

            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              out of 100
            </p>
          </div>
        </div>

        <div>
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${scoreStyle.badge}`}
          >
            <scoreStyle.Icon className="h-3.5 w-3.5" />
            {label}
          </div>

          <h3 className="mt-4 text-xl font-semibold text-white">
            {getScoreHeadline(score)}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {getScoreDescription(score)}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <HealthMetric
              label="Missing from Vault"
              value={missingVaultProducts}
              warning={missingVaultProducts > 0}
            />

            <HealthMetric
              label="Pending transfers"
              value={pendingTransfers}
              warning={pendingTransfers > 0}
            />

            <HealthMetric
              label="Receiving packages"
              value={receivingPackages}
              warning={receivingPackages >= 40}
            />

            <HealthMetric
              label="Count discrepancies"
              value={countDiscrepancies}
              warning={countDiscrepancies > 0}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HealthMetric({
  label,
  value,
  warning,
}: {
  label: string;
  value: number;
  warning: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <div
          className={`h-2.5 w-2.5 rounded-full ${
            warning
              ? "bg-[var(--red)] shadow-[0_0_12px_rgba(255,100,127,0.55)]"
              : "bg-[var(--lime)] shadow-[0_0_12px_rgba(184,255,57,0.45)]"
          }`}
        />
      </div>

      <p
        className={`metric-number mt-3 text-2xl font-semibold ${
          warning
            ? "text-[var(--red)]"
            : "text-[var(--lime)]"
        }`}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function getScoreStyle(score: number) {
  if (score >= 85) {
    return {
      text: "text-[var(--lime)]",
      badge:
        "border-[rgba(184,255,57,0.22)] bg-[rgba(184,255,57,0.08)] text-[var(--lime)]",
      iconSurface:
        "border-[rgba(184,255,57,0.22)] bg-[rgba(184,255,57,0.08)]",
      Icon: CheckCircle2,
    };
  }

  if (score >= 70) {
    return {
      text: "text-amber-300",
      badge:
        "border-amber-400/20 bg-amber-500/10 text-amber-300",
      iconSurface:
        "border-amber-400/20 bg-amber-500/10",
      Icon: AlertTriangle,
    };
  }

  return {
    text: "text-[var(--red)]",
    badge:
      "border-[rgba(255,100,127,0.22)] bg-[rgba(255,100,127,0.08)] text-[var(--red)]",
    iconSurface:
      "border-[rgba(255,100,127,0.22)] bg-[rgba(255,100,127,0.08)]",
    Icon: ShieldAlert,
  };
}

function getScoreHeadline(score: number): string {
  if (score >= 95) {
    return "The store is operationally ready.";
  }

  if (score >= 85) {
    return "Inventory is in strong condition.";
  }

  if (score >= 70) {
    return "A few inventory issues need attention.";
  }

  if (score >= 50) {
    return "Several issues should be resolved.";
  }

  return "Immediate inventory review is recommended.";
}

function getScoreDescription(score: number): string {
  if (score >= 95) {
    return "Vault coverage, receiving workload, package data, and count results are all within strong operating ranges.";
  }

  if (score >= 85) {
    return "The store is ready, but completing the remaining transfers or counts would improve readiness.";
  }

  if (score >= 70) {
    return "Review the Needs Attention panel and resolve the largest transfer, receiving, or count issues first.";
  }

  if (score >= 50) {
    return "Missing Vault products, receiving workload, or count discrepancies are significantly affecting readiness.";
  }

  return "Critical inventory issues are reducing confidence in current package availability and room accuracy.";
}