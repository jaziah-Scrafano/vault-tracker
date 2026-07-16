"use client";

import {
  CalendarClock,
  CircleOff,
  CopyCheck,
  FileSpreadsheet,
  PackageSearch,
  Rows3,
} from "lucide-react";

import type { InventoryMetadata as InventoryMetadataType } from "@/types/analytics";

type InventoryMetadataProps = {
  metadata: InventoryMetadataType;
};

export default function InventoryMetadata({
  metadata,
}: InventoryMetadataProps) {
  return (
    <section className="glass-panel h-full rounded-[30px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Inventory metadata
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Current data source
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Details from the latest uploaded inventory file and its
            parsed package records.
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045]">
          <FileSpreadsheet className="h-5 w-5 text-slate-300" />
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/[0.08] bg-black/20 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Loaded file
        </p>

        <p className="mt-3 break-all text-base font-semibold text-white">
          {metadata.fileName || "No inventory uploaded"}
        </p>

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
          <CalendarClock className="h-4 w-4" />

          {metadata.lastUploadedAt
            ? `Uploaded ${formatUploadTime(metadata.lastUploadedAt)}`
            : "Upload time unavailable"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetadataMetric
          label="CSV rows"
          value={metadata.totalRows}
          description="Total parsed package records"
          icon={Rows3}
          tone="blue"
        />

        <MetadataMetric
          label="Positive packages"
          value={metadata.positivePackages}
          description="Rows with available quantity above zero"
          icon={PackageSearch}
          tone="lime"
        />

        <MetadataMetric
          label="Zero quantity"
          value={metadata.zeroQuantityPackages}
          description="Rows with no available inventory"
          icon={CircleOff}
          tone="orange"
        />

        <MetadataMetric
          label="Unique products"
          value={metadata.uniqueProducts}
          description="Distinct normalized product names"
          icon={PackageSearch}
          tone="blue"
        />

        <MetadataMetric
          label="Duplicate IDs"
          value={metadata.duplicatePackageIds}
          description="Repeated METRC Package IDs"
          icon={CopyCheck}
          tone={
            metadata.duplicatePackageIds > 0
              ? "red"
              : "lime"
          }
        />
      </div>
    </section>
  );
}

type MetadataTone =
  | "lime"
  | "blue"
  | "orange"
  | "red";

type MetadataMetricProps = {
  label: string;
  value: number;
  description: string;
  icon: typeof Rows3;
  tone: MetadataTone;
};

function MetadataMetric({
  label,
  value,
  description,
  icon: Icon,
  tone,
}: MetadataMetricProps) {
  const styles: Record<
    MetadataTone,
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
    orange: {
      text: "text-[var(--orange)]",
      surface:
        "border-[rgba(255,154,77,0.2)] bg-[rgba(255,154,77,0.07)]",
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

function formatUploadTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "at an unknown time";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}