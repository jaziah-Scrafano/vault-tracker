"use client";

import {
  ArrowRight,
  CheckCircle2,
  PackageOpen,
  Truck,
} from "lucide-react";

import type { MoveRecommendation } from "@/types/inventory";

type ReceivingAssistantProps = {
  recommendations: MoveRecommendation[];
  completedPackageIds: string[];
  onComplete: (item: MoveRecommendation) => void;
  onViewAll: () => void;
};

export default function ReceivingAssistant({
  recommendations,
  completedPackageIds,
  onComplete,
  onViewAll,
}: ReceivingAssistantProps) {
  const receivingRecommendations = recommendations.filter(
    (item) =>
      item.moveFrom
        .toLowerCase()
        .includes("receiving room") &&
      !completedPackageIds.includes(item.packageId)
  );

  const visibleItems = receivingRecommendations.slice(0, 5);

  return (
    <section className="glass-panel rounded-[30px] p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">
            Receiving Assistant
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Move directly from Receiving
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            These products are missing from the Vault and have no
            available Backstock package, so Receiving room is the
            next eligible source.
          </p>
        </div>

        <div className="flex min-w-[150px] items-center gap-4 rounded-2xl border border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.07)] px-4 py-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)]">
            <Truck className="h-5 w-5 text-[var(--blue)]" />
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Direct moves
            </p>

            <p className="text-2xl font-semibold text-white">
              {receivingRecommendations.length.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {visibleItems.map((item) => (
          <div
            key={item.packageId}
            className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(126,162,255,0.18)] bg-[rgba(126,162,255,0.07)]">
                <PackageOpen className="h-5 w-5 text-[var(--blue)]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {item.product}
                </p>

                <p className="mt-1 truncate font-mono text-xs text-[var(--blue)]">
                  {item.packageId}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {item.vendor || "Vendor not listed"}

                  {item.strain
                    ? ` · ${item.strain}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:justify-end">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(126,162,255,0.18)] bg-[rgba(126,162,255,0.07)] px-3 py-1.5 text-xs font-semibold text-[var(--blue)]">
                Receiving room
                <ArrowRight className="h-3.5 w-3.5" />
                Vault
              </span>

              <button
                type="button"
                onClick={() => onComplete(item)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)] text-[var(--lime)] transition hover:border-[rgba(184,255,57,0.35)] hover:bg-[rgba(184,255,57,0.12)]"
                aria-label={`Complete ${item.product}`}
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {visibleItems.length === 0 && (
          <div className="rounded-2xl border border-[rgba(184,255,57,0.16)] bg-[rgba(184,255,57,0.055)] px-5 py-10 text-center">
            <CheckCircle2 className="mx-auto h-7 w-7 text-[var(--lime)]" />

            <p className="mt-3 font-semibold text-white">
              No direct Receiving moves are needed
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Backstock currently covers every available transfer.
            </p>
          </div>
        )}
      </div>

      {receivingRecommendations.length > 5 && (
        <button
          type="button"
          onClick={onViewAll}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.075]"
        >
          View all {receivingRecommendations.length} Receiving moves
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}