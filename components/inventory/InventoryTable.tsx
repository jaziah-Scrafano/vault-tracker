"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import {
  Check,
  Clipboard,
  Download,
  Filter,
  Search,
  X,
} from "lucide-react";

import type { MoveRecommendation } from "@/types/inventory";

type InventoryTableProps = {
  recommendations: MoveRecommendation[];
  hasInventory: boolean;
  completedPackageIds: string[];
  onComplete: (item: MoveRecommendation) => void;
};

type CategoryFilterEvent = CustomEvent<{
  category: string;
}>;

export default function InventoryTable({
  recommendations,
  hasInventory,
  completedPackageIds,
  onComplete,
}: InventoryTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const pendingRecommendations = useMemo(() => {
    return recommendations.filter(
      (item) => !completedPackageIds.includes(item.packageId)
    );
  }, [recommendations, completedPackageIds]);

  const categories = useMemo(() => {
    const categorySet = new Set<string>();

    for (const item of pendingRecommendations) {
      categorySet.add(item.category.trim() || "Uncategorized");
    }

    return Array.from(categorySet).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [pendingRecommendations]);

  const activeRecommendations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pendingRecommendations.filter((item) => {
      const itemCategory =
        item.category.trim() || "Uncategorized";

      const matchesCategory =
        categoryFilter === "All" ||
        itemCategory.toLowerCase() ===
          categoryFilter.toLowerCase();

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        item.packageId.toLowerCase().includes(query) ||
        item.product.toLowerCase().includes(query) ||
        item.strain.toLowerCase().includes(query) ||
        item.vendor.toLowerCase().includes(query) ||
        itemCategory.toLowerCase().includes(query) ||
        item.moveFrom.toLowerCase().includes(query)
      );
    });
  }, [pendingRecommendations, search, categoryFilter]);

  useEffect(() => {
    function handleCategoryFilter(event: Event) {
      const customEvent = event as CategoryFilterEvent;
      const category = customEvent.detail?.category;

      if (!category) {
        return;
      }

      setCategoryFilter(category);
      setSearch("");
    }

    window.addEventListener(
      "vault-tracker-category-filter",
      handleCategoryFilter
    );

    return () => {
      window.removeEventListener(
        "vault-tracker-category-filter",
        handleCategoryFilter
      );
    };
  }, []);

  async function copyMetrc(packageId: string) {
    try {
      await navigator.clipboard.writeText(packageId);
    } catch {
      window.alert(
        "The METRC Package ID could not be copied."
      );
    }
  }

  function clearFilters() {
    setSearch("");
    setCategoryFilter("All");
  }

  function exportMoveList() {
    const csv = Papa.unparse(
      activeRecommendations.map((item) => ({
        "METRC Package ID": item.packageId,
        Product: item.product,
        Strain: item.strain,
        Category: item.category,
        Vendor: item.vendor,
        Available: item.available,
        "Move From": item.moveFrom,
        "Move To": item.moveTo,
      }))
    );

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      categoryFilter === "All"
        ? "vault-move-list.csv"
        : `vault-move-list-${categoryFilter
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}.csv`;

    link.click();
    URL.revokeObjectURL(url);
  }

  const hasActiveFilters =
    search.trim().length > 0 || categoryFilter !== "All";

  return (
    <section className="glass-panel rounded-[30px] p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Transfer Queue
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            METRC packages to move
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            One exact package is recommended when the Vault
            has zero of that product. Backstock is prioritized,
            followed by Receiving room.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="glass-input flex min-w-0 items-center gap-3 rounded-2xl px-4 py-3 sm:min-w-[300px]">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search METRC, product, vendor..."
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          <div className="glass-input flex items-center gap-3 rounded-2xl px-4 py-3">
            <Filter className="h-4 w-4 shrink-0 text-slate-500" />

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="min-w-[170px] bg-transparent text-sm text-white outline-none"
            >
              <option value="All" className="bg-slate-950">
                All categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-slate-950"
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={exportMoveList}
            disabled={activeRecommendations.length === 0}
            className="flex items-center justify-center gap-2 rounded-2xl border border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)] px-4 py-3 text-sm font-semibold text-[var(--lime)] transition hover:border-[rgba(184,255,57,0.35)] hover:bg-[rgba(184,255,57,0.12)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Download className="h-4 w-4" />
            Export queue
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300">
            {activeRecommendations.length.toLocaleString()} shown
          </span>

          {categoryFilter !== "All" && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--blue)]">
              Category: {categoryFilter}
            </span>
          )}

          {search.trim() && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300">
              Search: {search.trim()}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.075]"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>

      <div className="table-shell custom-scrollbar overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="bg-white/[0.025] text-xs uppercase tracking-[0.12em] text-slate-500">
              <th className="px-5 py-4">
                METRC Package ID
              </th>

              <th className="px-5 py-4">
                Product
              </th>

              <th className="px-5 py-4">
                Category
              </th>

              <th className="px-5 py-4">
                Available
              </th>

              <th className="px-5 py-4">
                Transfer
              </th>

              <th className="px-5 py-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {activeRecommendations.map((item) => {
              const fromReceiving = item.moveFrom
                .toLowerCase()
                .includes("receiving");

              return (
                <tr
                  key={item.packageId}
                  className="table-row align-top"
                >
                  <td className="px-5 py-5">
                    <p className="font-mono text-sm font-bold text-[var(--lime)]">
                      {item.packageId}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Exact package
                    </p>
                  </td>

                  <td className="max-w-[420px] px-5 py-5">
                    <p className="font-medium text-white">
                      {item.product}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {item.vendor || "Vendor not listed"}

                      {item.strain
                        ? ` · ${item.strain}`
                        : ""}
                    </p>
                  </td>

                  <td className="px-5 py-5">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold text-slate-300">
                      {item.category || "Uncategorized"}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <p className="text-base font-semibold text-white">
                      {item.available.toLocaleString()}
                    </p>
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        fromReceiving
                          ? "border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)] text-[var(--blue)]"
                          : "border-[rgba(255,154,77,0.2)] bg-[rgba(255,154,77,0.08)] text-[var(--orange)]"
                      }`}
                    >
                      {item.moveFrom} → {item.moveTo}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex min-w-max gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          copyMetrc(item.packageId)
                        }
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.075]"
                      >
                        <Clipboard className="h-3.5 w-3.5" />
                        Copy
                      </button>

                      <button
                        type="button"
                        onClick={() => onComplete(item)}
                        className="flex items-center gap-2 rounded-xl border border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)] px-3 py-2 text-xs font-semibold text-[var(--lime)] transition hover:border-[rgba(184,255,57,0.35)] hover:bg-[rgba(184,255,57,0.12)]"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Complete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {!hasInventory && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-16 text-center text-slate-500"
                >
                  Upload an inventory CSV to begin.
                </td>
              </tr>
            )}

            {hasInventory &&
              activeRecommendations.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-slate-500"
                  >
                    {hasActiveFilters
                      ? "No transfers match the selected filters."
                      : "No pending Vault transfers."}
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
