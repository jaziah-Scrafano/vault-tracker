"use client";

import type { ChangeEvent } from "react";

type UploadBoxProps = {
  fileName: string;
  loading: boolean;
  error: string;
  onUpload: (file: File) => void;
};

export default function UploadBox({
  fileName,
  loading,
  error,
  onUpload,
}: UploadBoxProps) {
  function handleChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      onUpload(file);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <label
        htmlFor="inventory-upload"
        className="mb-3 block font-semibold"
      >
        Upload Dutchie inventory CSV
      </label>

      <input
        id="inventory-upload"
        type="file"
        accept=".csv,text/csv"
        disabled={loading}
        onChange={handleChange}
        className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
      />

      {loading && (
        <p className="mt-3 text-sm text-amber-300">
          Reading inventory...
        </p>
      )}

      {fileName && !loading && (
        <p className="mt-3 text-sm text-slate-400">
          Loaded: {fileName}
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}