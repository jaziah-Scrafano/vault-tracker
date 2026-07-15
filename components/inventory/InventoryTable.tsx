"use client";

import Papa from "papaparse";
import type { MoveRecommendation } from "@/types/inventory";

type InventoryTableProps = {
  recommendations: MoveRecommendation[];
  hasInventory: boolean;
  completedPackageIds: string[];
  onComplete: (item: MoveRecommendation) => void;
};

export default function InventoryTable({
  recommendations,
  hasInventory,
  completedPackageIds,
  onComplete,
}: InventoryTableProps) {
  const activeRecommendations = recommendations.filter(
    (item) => !completedPackageIds.includes(item.packageId)
  );

  async function copyMetrc(packageId: string) {
    try {
      await navigator.clipboard.writeText(packageId);
    } catch {
      window.alert("The METRC Package ID could not be copied.");
    }
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
    link.download = "vault-move-list.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            METRC packages to move
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            One package per exact product only when the Vault is at zero.
          </p>
        </div>

        <button
          type="button"
          onClick={exportMoveList}
          disabled={activeRecommendations.length === 0}
          className="rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Export move list
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-slate-900 text-left text-sm">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="px-4 py-3">
                  METRC Package ID
                </th>

                <th className="px-4 py-3">
                  Product
                </th>

                <th className="px-4 py-3">
                  Strain
                </th>

                <th className="px-4 py-3">
                  Available
                </th>

                <th className="px-4 py-3">
                  Transfer
                </th>

                <th className="px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {activeRecommendations.map((item) => (
                <tr
                  key={item.packageId}
                  className="border-t border-slate-800 align-top"
                >
                  <td className="px-4 py-4">
                    <p className="font-mono text-base font-bold text-emerald-300">
                      {item.packageId}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Exact package to move
                    </p>
                  </td>

                  <td className="max-w-md px-4 py-4">
                    <p className="font-medium">
                      {item.product}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.vendor || "Vendor not listed"}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {item.strain || "Not listed"}
                  </td>

                  <td className="px-4 py-4">
                    {item.available}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="rounded-full border border-amber-800 bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-300">
                      {item.moveFrom} → {item.moveTo}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          copyMetrc(item.packageId)
                        }
                        className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold transition hover:border-slate-500 hover:bg-slate-800"
                      >
                        Copy METRC
                      </button>

                      <button
                        type="button"
                        onClick={() => onComplete(item)}
                        className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300"
                      >
                        Mark complete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!hasInventory && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-400"
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
                      className="px-4 py-12 text-center text-slate-400"
                    >
                      No pending Vault transfers.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
