"use client";

import {
  AlertTriangle,
  Boxes,
  ChevronRight,
  PackageX,
} from "lucide-react";

import type { MoveRecommendation } from "@/types/inventory";

type MissingVaultDashboardProps = {
  recommendations: MoveRecommendation[];
  completedPackageIds: string[];
  onSelectCategory: (category: string) => void;
  onViewAll: () => void;
};

type CategorySummary = {
  category: string;
  count: number;
};

export default function MissingVaultDashboard({
  recommendations,
  completedPackageIds,
  onSelectCategory,
  onViewAll,
}: MissingVaultDashboardProps) {
  const pendingRecommendations = recommendations.filter(
    (item) => !completedPackageIds.includes(item.packageId)
  );

  const categoryCounts = new Map<string, number>();

  for (const recommendation of pendingRecommendations) {
    const category =
      recommendation.category.trim() || "Uncategorized";

    categoryCounts.set(
      category,
      (categoryCounts.get(category) ?? 0) + 1
    );
  }

  const categories: CategorySummary[] = Array.from(
    categoryCounts.entries()
  )
    .map(([category, count]) => ({
      category,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const visibleCategories = categories.slice(0, 6);

  return (
    <section className="glass-panel rounded-[30px] p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--red)]">
            Missing from Vault
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Products requiring attention
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            These exact products have zero available inventory
            in the Vault and an eligible package elsewhere.
          </p>
        </div>

        <div className="flex min-w-[150px] items-center gap-4 rounded-2xl border border-[rgba(255,100,127,0.2)] bg-[rgba(255,100,127,0.07)] px-4 py-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(255,100,127,0.2)] bg-[rgba(255,100,127,0.08)]">
            <PackageX className="h-5 w-5 text-[var(--red)]" />
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Total missing
            </p>

            <p className="text-2xl font-semibold text-white">
              {pendingRecommendations.length.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        {visibleCategories.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleCategories.map((item) => (
              <button
                key={item.category}
                type="button"
                onClick={() =>
                  onSelectCategory(item.category)
                }
                className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 text-left transition hover:border-white/20 hover:bg-white/[0.055]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <Boxes className="h-4 w-4 text-slate-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {item.category}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Missing Vault products
                    </p>
                  </div>
                </div>

                <div className="ml-3 flex items-center gap-2">
                  <span className="rounded-full border border-[rgba(255,100,127,0.18)] bg-[rgba(255,100,127,0.07)] px-2.5 py-1 text-xs font-semibold text-[var(--red)]">
                    {item.count}
                  </span>

                  <ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[rgba(184,255,57,0.16)] bg-[rgba(184,255,57,0.055)] px-5 py-10 text-center">
            <AlertTriangle className="mx-auto h-7 w-7 text-[var(--lime)]" />

            <p className="mt-3 font-semibold text-white">
              No products are currently missing from the Vault
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Upload an updated CSV whenever inventory changes.
            </p>
          </div>
        )}
      </div>

      {pendingRecommendations.length > 0 && (
        <button
          type="button"
          onClick={onViewAll}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.075]"
        >
          View all missing Vault products
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}