"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  clearCompletedMoves,
  getCompletedMoves,
  saveCompletedMoves,
} from "@/lib/storage";

import type { CompletedMove } from "@/types/history";

export default function HistoryPage() {
  const [moves, setMoves] = useState<CompletedMove[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMoves(getCompletedMoves());
  }, []);

  const filteredMoves = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return moves;
    }

    return moves.filter((move) => {
      return (
        move.packageId.toLowerCase().includes(query) ||
        move.product.toLowerCase().includes(query) ||
        move.strain.toLowerCase().includes(query) ||
        move.vendor.toLowerCase().includes(query)
      );
    });
  }, [moves, search]);

  const completedToday = useMemo(() => {
    const today = new Date().toDateString();

    return moves.filter((move) => {
      return new Date(move.completedAt).toDateString() === today;
    }).length;
  }, [moves]);

  function undoMove(packageId: string) {
    const confirmed = window.confirm(
      "Undo this completed move?"
    );

    if (!confirmed) {
      return;
    }

    const updatedMoves = moves.filter(
      (move) => move.packageId !== packageId
    );

    setMoves(updatedMoves);
    saveCompletedMoves(updatedMoves);
  }

  function clearHistory() {
    const confirmed = window.confirm(
      "Delete all completed move history?"
    );

    if (!confirmed) {
      return;
    }

    clearCompletedMoves();
    setMoves([]);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Inventory Control
            </p>

            <h1 className="text-4xl font-bold">
              Move History
            </h1>

            <p className="mt-3 max-w-2xl text-slate-300">
              Review completed Backstock-to-Vault transfers by exact METRC
              Package ID.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg border border-slate-700 px-4 py-2 font-semibold transition hover:border-slate-500 hover:bg-slate-900"
          >
            Back to dashboard
          </Link>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <HistoryCard
            label="All completed moves"
            value={moves.length}
            description="Saved transfer records"
          />

          <HistoryCard
            label="Completed today"
            value={completedToday}
            description="Moves completed today"
            highlight
          />

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <label
              htmlFor="history-search"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              Search move history
            </label>

            <input
              id="history-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="METRC, product, strain, or vendor"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400"
            />
          </div>
        </section>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Completed transfers
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {filteredMoves.length} record
              {filteredMoves.length === 1 ? "" : "s"} shown
            </p>
          </div>

          <button
            type="button"
            onClick={clearHistory}
            disabled={moves.length === 0}
            className="rounded-lg border border-red-800 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear all history
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
                    Transfer
                  </th>

                  <th className="px-4 py-3">
                    Completed
                  </th>

                  <th className="px-4 py-3">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMoves.map((move) => (
                  <tr
                    key={move.packageId}
                    className="border-t border-slate-800 align-top"
                  >
                    <td className="px-4 py-4">
                      <p className="font-mono text-base font-bold text-emerald-300">
                        {move.packageId}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Completed package
                      </p>
                    </td>

                    <td className="max-w-md px-4 py-4">
                      <p className="font-medium">
                        {move.product}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {move.strain || "No strain listed"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {move.vendor || "Vendor not listed"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-300">
                        {move.moveFrom} → {move.moveTo}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-slate-300">
                      {new Date(
                        move.completedAt
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          undoMove(move.packageId)
                        }
                        className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold transition hover:border-slate-500 hover:bg-slate-800"
                      >
                        Undo move
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredMoves.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-slate-400"
                    >
                      {moves.length === 0
                        ? "No completed moves yet."
                        : "No move history matches your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

type HistoryCardProps = {
  label: string;
  value: number;
  description: string;
  highlight?: boolean;
};

function HistoryCard({
  label,
  value,
  description,
  highlight = false,
}: HistoryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${
          highlight ? "text-emerald-300" : "text-white"
        }`}
      >
        {value.toLocaleString()}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}