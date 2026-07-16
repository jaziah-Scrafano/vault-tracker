"use client";

import {
  Boxes,
  PackageOpen,
  Trophy,
} from "lucide-react";

import type { VendorMetric } from "@/types/analytics";

type TopVendorsProps = {
  vendors: VendorMetric[];
};

export default function TopVendors({
  vendors,
}: TopVendorsProps) {
  const visibleVendors = vendors.slice(0, 6);

  const maxPackages =
    visibleVendors.length > 0
      ? Math.max(
          ...visibleVendors.map(
            (vendor) => vendor.packageCount
          )
        )
      : 0;

  return (
    <section className="glass-panel h-full rounded-[30px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--orange)]">
            Top vendors
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Inventory concentration
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Vendors with the largest number of positive
            inventory package records.
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(255,154,77,0.2)] bg-[rgba(255,154,77,0.08)]">
          <Trophy className="h-5 w-5 text-[var(--orange)]" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {visibleVendors.map((vendor, index) => {
          const width =
            maxPackages === 0
              ? 0
              : Math.round(
                  (vendor.packageCount /
                    maxPackages) *
                    100
                );

          return (
            <div
              key={vendor.vendor}
              className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    {index === 0 ? (
                      <Trophy className="h-4 w-4 text-[var(--orange)]" />
                    ) : (
                      <Boxes className="h-4 w-4 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {vendor.vendor}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {vendor.availableTotal.toLocaleString()}{" "}
                      total available
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="metric-number text-xl font-semibold text-[var(--orange)]">
                    {vendor.packageCount.toLocaleString()}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    packages
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-[var(--orange)] transition-all duration-500"
                  style={{
                    width: `${width}%`,
                  }}
                />
              </div>
            </div>
          );
        })}

        {visibleVendors.length === 0 && (
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] px-5 py-10 text-center">
            <PackageOpen className="mx-auto h-8 w-8 text-slate-600" />

            <p className="mt-3 font-semibold text-white">
              No vendor data available
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Upload an inventory CSV to populate vendor metrics.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}