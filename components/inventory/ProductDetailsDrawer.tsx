"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clipboard,
  PackageSearch,
  X,
} from "lucide-react";

import type {
  InventoryRow,
  MoveRecommendation,
} from "@/types/inventory";

type ProductDetailsDrawerProps = {
  product: string | null;
  inventory: InventoryRow[];
  recommendation?: MoveRecommendation;
  onClose: () => void;
};

type RoomSummary = {
  room: string;
  packageCount: number;
  availableTotal: number;
};

export default function ProductDetailsDrawer({
  product,
  inventory,
  recommendation,
  onClose,
}: ProductDetailsDrawerProps) {
  if (!product) {
    return null;
  }

  const productRows = inventory.filter(
    (row) => normalize(row.product) === normalize(product)
  );

  const roomSummaries = buildRoomSummaries(productRows);

  const totalAvailable = productRows.reduce(
    (total, row) => total + row.available,
    0
  );

  const firstRow = productRows[0];

  async function copyPackageId(packageId: string) {
    try {
      await navigator.clipboard.writeText(
        cleanCsvValue(packageId)
      );
    } catch {
      window.alert(
        "The METRC Package ID could not be copied."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close product details"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <aside className="glass-panel relative z-10 h-full w-full max-w-[560px] overflow-y-auto border-l border-white/10 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-5 border-b border-white/[0.08] pb-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">
              Product details
            </p>

            <h2 className="mt-2 text-2xl font-semibold leading-tight text-white">
              {cleanCsvValue(product)}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {cleanCsvValue(firstRow?.vendor) ||
                "Vendor not listed"}

              {cleanCsvValue(firstRow?.strain)
                ? ` · ${cleanCsvValue(firstRow.strain)}`
                : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoCard
            label="Category"
            value={
              cleanCsvValue(firstRow?.category) ||
              "Uncategorized"
            }
          />

          <InfoCard
            label="Total available"
            value={totalAvailable.toLocaleString()}
          />

          <InfoCard
            label="Packages"
            value={productRows.length.toLocaleString()}
          />

          <InfoCard
            label="SKU"
            value={
              cleanCsvValue(firstRow?.sku) || "Not listed"
            }
          />
        </section>

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Inventory by room
          </p>

          <div className="mt-3 space-y-3">
            {roomSummaries.map((summary) => (
              <div
                key={summary.room}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">
                      {summary.room}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {summary.packageCount} package
                      {summary.packageCount === 1 ? "" : "s"}
                    </p>
                  </div>

                  <p className="text-xl font-semibold text-white">
                    {summary.availableTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Package records
          </p>

          <div className="mt-3 space-y-3">
            {productRows
              .slice()
              .sort((a, b) => b.available - a.available)
              .map((row, index) => (
                <div
                  key={[
                    cleanCsvValue(row.packageId),
                    cleanCsvValue(row.room),
                    cleanCsvValue(row.sku),
                    index,
                  ].join("-")}
                  className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="break-all font-mono text-sm font-bold text-[var(--lime)]">
                        {cleanCsvValue(row.packageId)}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {cleanCsvValue(row.room) ||
                          "Room not listed"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyPackageId(row.packageId)
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08]"
                      aria-label="Copy METRC Package ID"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
                    <span className="text-xs text-slate-500">
                      Available
                    </span>

                    <span className="font-semibold text-white">
                      {row.available.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Recommendation
          </p>

          {recommendation ? (
            <div className="mt-3 rounded-[24px] border border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.07)] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)]">
                  <CheckCircle2 className="h-5 w-5 text-[var(--lime)]" />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    Move this package
                  </p>

                  <p className="mt-2 break-all font-mono text-sm font-bold text-[var(--lime)]">
                    {recommendation.packageId}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-black/15 px-4 py-3">
                <span className="font-semibold text-[var(--orange)]">
                  {recommendation.moveFrom}
                </span>

                <ArrowRight className="h-4 w-4 text-slate-500" />

                <span className="font-semibold text-[var(--lime)]">
                  {recommendation.moveTo}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                The Vault has zero available inventory for this
                exact product. Backstock is prioritized, with
                Receiving Room used only when no eligible
                Backstock package exists.
              </p>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-8 text-center">
              <PackageSearch className="mx-auto h-7 w-7 text-slate-600" />

              <p className="mt-3 font-semibold text-white">
                No transfer recommended
              </p>

              <p className="mt-2 text-sm text-slate-500">
                This product currently has Vault inventory or no
                eligible source package.
              </p>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 truncate font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function buildRoomSummaries(
  rows: InventoryRow[]
): RoomSummary[] {
  const roomMap = new Map<string, RoomSummary>();

  for (const row of rows) {
    const room =
      cleanCsvValue(row.room) || "Not listed";

    const current = roomMap.get(room) ?? {
      room,
      packageCount: 0,
      availableTotal: 0,
    };

    current.packageCount += 1;
    current.availableTotal += row.available;

    roomMap.set(room, current);
  }

  return Array.from(roomMap.values()).sort(
    (a, b) => b.availableTotal - a.availableTotal
  );
}

function cleanCsvValue(value: string | undefined): string {
  let cleaned = String(value ?? "").trim();

  if (
    cleaned.startsWith('="') &&
    cleaned.endsWith('"')
  ) {
    cleaned = cleaned.slice(2, -1);
  }

  return cleaned.trim();
}

function normalize(value: string | undefined): string {
  return cleanCsvValue(value).toLowerCase();
}
