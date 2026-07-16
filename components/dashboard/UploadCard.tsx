"use client";

import type { ChangeEvent } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

type UploadCardProps = {
  fileName: string;
  loading: boolean;
  error: string;
  onUpload: (file: File) => void;
};

export default function UploadCard({
  fileName,
  loading,
  error,
  onUpload,
}: UploadCardProps) {
  function handleChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      onUpload(file);
    }
  }

  return (
    <section className="glass-panel rounded-[30px] p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)]">
            <FileSpreadsheet
              size={28}
              className="text-[var(--lime)]"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Daily Inventory
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-white">
              Upload Dutchie CSV
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Import today&apos;s inventory export. Vault Tracker
              will automatically determine which METRC package
              should move into the Vault.
            </p>
          </div>
        </div>

        <label
          htmlFor="inventory-upload"
          className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)] px-6 py-4 font-semibold text-[var(--lime)] transition hover:border-[rgba(184,255,57,0.35)] hover:bg-[rgba(184,255,57,0.12)]"
        >
          {loading ? (
            <LoaderCircle
              className="animate-spin"
              size={20}
            />
          ) : (
            <UploadCloud size={20} />
          )}

          {loading
            ? "Reading Inventory..."
            : "Choose Inventory CSV"}

          <input
            id="inventory-upload"
            type="file"
            accept=".csv,text/csv"
            onChange={handleChange}
            className="hidden"
          />
        </label>
      </div>

      {fileName && !loading && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[rgba(184,255,57,0.18)] bg-[rgba(184,255,57,0.07)] px-4 py-3">
          <CheckCircle2
            size={18}
            className="text-[var(--lime)]"
          />

          <span className="text-sm text-slate-300">
            Loaded:
          </span>

          <span className="font-semibold text-white">
            {fileName}
          </span>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-[rgba(255,100,127,0.2)] bg-[rgba(255,100,127,0.08)] px-4 py-3 text-sm text-[var(--red)]">
          {error}
        </div>
      )}
    </section>
  );
}