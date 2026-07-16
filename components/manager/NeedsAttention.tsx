"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CircleAlert,
  Info,
  ShieldAlert,
} from "lucide-react";

import type { InventoryAlert } from "@/types/analytics";

type NeedsAttentionProps = {
  alerts: InventoryAlert[];
};

export default function NeedsAttention({
  alerts,
}: NeedsAttentionProps) {
  return (
    <section className="glass-panel h-full rounded-[30px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--red)]">
            Needs attention
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Operational alerts
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Review the highest-priority inventory issues before the
            shift gets busy.
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(255,100,127,0.2)] bg-[rgba(255,100,127,0.08)]">
          <AlertTriangle className="h-5 w-5 text-[var(--red)]" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {alerts.map((alert) => (
          <AlertRow
            key={alert.id}
            alert={alert}
          />
        ))}
      </div>
    </section>
  );
}

function AlertRow({
  alert,
}: {
  alert: InventoryAlert;
}) {
  const style = getAlertStyle(alert.severity);
  const Icon = style.Icon;

  const content = (
    <div
      className={`group flex items-start gap-4 rounded-2xl border p-4 transition ${style.surface} ${
        alert.href
          ? "hover:-translate-y-0.5 hover:brightness-110"
          : ""
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${style.iconSurface}`}
      >
        <Icon className={`h-5 w-5 ${style.text}`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-white">
              {alert.title}
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              {alert.description}
            </p>
          </div>

          {typeof alert.value === "number" && (
            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${style.badge}`}
            >
              {alert.value.toLocaleString()}
            </span>
          )}
        </div>

        {alert.href && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500 transition group-hover:text-white">
            Review issue
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
    </div>
  );

  if (!alert.href) {
    return content;
  }

  return (
    <Link
      href={alert.href}
      className="block"
    >
      {content}
    </Link>
  );
}

function getAlertStyle(
  severity: InventoryAlert["severity"]
) {
  if (severity === "critical") {
    return {
      Icon: ShieldAlert,
      text: "text-[var(--red)]",
      surface:
        "border-[rgba(255,100,127,0.2)] bg-[rgba(255,100,127,0.07)]",
      iconSurface:
        "border-[rgba(255,100,127,0.22)] bg-[rgba(255,100,127,0.09)]",
      badge:
        "border-[rgba(255,100,127,0.22)] bg-[rgba(255,100,127,0.1)] text-[var(--red)]",
    };
  }

  if (severity === "warning") {
    return {
      Icon: CircleAlert,
      text: "text-amber-300",
      surface:
        "border-amber-400/20 bg-amber-500/[0.07]",
      iconSurface:
        "border-amber-400/20 bg-amber-500/10",
      badge:
        "border-amber-400/20 bg-amber-500/10 text-amber-300",
    };
  }

  return {
    Icon: Info,
    text: "text-[var(--blue)]",
    surface:
      "border-[rgba(126,162,255,0.18)] bg-[rgba(126,162,255,0.06)]",
    iconSurface:
      "border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)]",
    badge:
      "border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)] text-[var(--blue)]",
  };
}