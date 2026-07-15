"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import UploadBox from "@/components/upload/UploadBox";
import InventoryTable from "@/components/inventory/InventoryTable";

import { parseInventoryFile } from "@/lib/parser";
import { createMoveRecommendations } from "@/lib/recommendations";
import {
  getCompletedMoves,
  saveCompletedMoves,
} from "@/lib/storage";

import type {
  InventoryRow,
  MoveRecommendation,
} from "@/types/inventory";
import type { CompletedMove } from "@/types/history";

export default function Home() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [completedMoves, setCompletedMoves] = useState<CompletedMove[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const moveTableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCompletedMoves(getCompletedMoves());
  }, []);

  const recommendations = useMemo(() => {
    return createMoveRecommendations(inventory);
  }, [inventory]);

  const completedPackageIds = useMemo(() => {
    return completedMoves.map((move) => move.packageId);
  }, [completedMoves]);

  const pendingTransferCount = useMemo(() => {
    return recommendations.filter(
      (item) => !completedPackageIds.includes(item.packageId)
    ).length;
  }, [recommendations, completedPackageIds]);

  const backstockPackages = useMemo(() => {
    return inventory.filter(
      (row) =>
        row.room.toLowerCase().includes("backstock") &&
        row.available > 0
    ).length;
  }, [inventory]);

  const completedToday = useMemo(() => {
    const today = new Date().toDateString();

    return completedMoves.filter((move) => {
      return new Date(move.completedAt).toDateString() === today;
    }).length;
  }, [completedMoves]);

  const vaultProductsEmpty = useMemo(() => {
    return recommendations.length;
  }, [recommendations]);

  async function handleUpload(file: File) {
    setLoading(true);
    setError("");
    setFileName(file.name);

    try {
      const rows = await parseInventoryFile(file);
      setInventory(rows);
    } catch (uploadError) {
      setInventory([]);

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The inventory file could not be read."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleComplete(item: MoveRecommendation) {
    const completedMove: CompletedMove = {
      ...item,
      completedAt: new Date().toISOString(),
    };

    const updatedMoves = [
      completedMove,
      ...completedMoves.filter(
        (move) => move.packageId !== item.packageId
      ),
    ];

    setCompletedMoves(updatedMoves);
    saveCompletedMoves(updatedMoves);
  }

  function scrollToMoves() {
    moveTableRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
              Vault Tracker
            </h1>

            <p className="mt-3 max-w-3xl text-slate-300">
              Upload the Dutchie inventory report to identify the exact METRC
              package that should move from Backstock to Vault.
            </p>
          </div>

          <Link
            href="/history"
            className="rounded-lg border border-slate-700 px-4 py-2 font-semibold transition hover:border-slate-500 hover:bg-slate-900"
          >
            View move history
          </Link>
        </header>

        <div className="mb-8">
          <UploadBox
            fileName={fileName}
            loading={loading}
            error={error}
            onUpload={handleUpload}
          />
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            label="Pending transfers"
            value={pendingTransferCount}
            description="METRC packages waiting to move"
            highlight
            onClick={scrollToMoves}
          />

          <DashboardCard
            label="Completed today"
            value={completedToday}
            description="Transfers marked complete today"
            href="/history"
          />

          <DashboardCard
            label="Vault products empty"
            value={vaultProductsEmpty}
            description="Exact products with zero in Vault"
            onClick={scrollToMoves}
          />

          <DashboardCard
            label="Backstock packages"
            value={backstockPackages}
            description="Positive packages currently in Backstock"
          />
        </section>

        <div ref={moveTableRef} className="scroll-mt-6">
          <InventoryTable
            recommendations={recommendations}
            hasInventory={inventory.length > 0}
            completedPackageIds={completedPackageIds}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </main>
  );
}

type DashboardCardProps = {
  label: string;
  value: number;
  description: string;
  highlight?: boolean;
  onClick?: () => void;
  href?: string;
};

function DashboardCard({
  label,
  value,
  description,
  highlight = false,
  onClick,
  href,
}: DashboardCardProps) {
  const cardClassName = `
    block w-full rounded-2xl border border-slate-800
    bg-slate-900 p-5 text-left transition
    ${
      onClick || href
        ? "cursor-pointer hover:border-slate-600 hover:bg-slate-800"
        : ""
    }
  `;

  const content = (
    <>
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${
          highlight ? "text-amber-300" : "text-white"
        }`}
      >
        {value.toLocaleString()}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cardClassName}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cardClassName}>
      {content}
    </div>
  );
}