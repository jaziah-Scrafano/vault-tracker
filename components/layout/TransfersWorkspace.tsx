"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

import UploadCard from "@/components/dashboard/UploadCard";
import MissingVaultDashboard from "@/components/dashboard/MissingVaultDashboard";
import ReceivingAssistant from "@/components/dashboard/ReceivingAssistant";
import TaskQueue from "@/components/dashboard/TaskQueue";
import InventoryTable from "@/components/inventory/InventoryTable";

import { parseInventoryFile } from "@/lib/parser";
import { createMoveRecommendations } from "@/lib/recommendations";

import {
  getCompletedMoves,
  getCurrentInventory,
  getInventoryFileName,
  saveCompletedMoves,
  saveCurrentInventory,
  saveInventoryFileName,
  saveInventoryUploadTime,
} from "@/lib/storage";

import type { CompletedMove } from "@/types/history";

import type {
  InventoryRow,
  MoveRecommendation,
} from "@/types/inventory";

export default function TransfersWorkspace() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [completedMoves, setCompletedMoves] = useState<
    CompletedMove[]
  >([]);

  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const uploadRef = useRef<HTMLElement>(null);
  const missingVaultRef = useRef<HTMLElement>(null);
  const receivingRef = useRef<HTMLElement>(null);
  const taskQueueRef = useRef<HTMLElement>(null);
  const fullQueueRef = useRef<HTMLElement>(null);

  const loadStoredData = useCallback(() => {
    setInventory(getCurrentInventory());
    setCompletedMoves(getCompletedMoves());
    setFileName(getInventoryFileName());
  }, []);

  useEffect(() => {
    loadStoredData();
    setLoaded(true);
  }, [loadStoredData]);

  const recommendations = useMemo(() => {
    return createMoveRecommendations(inventory);
  }, [inventory]);

  const completedPackageIds = useMemo(() => {
    return completedMoves.map((move) => move.packageId);
  }, [completedMoves]);

  const pendingRecommendations = useMemo(() => {
    const completedIds = new Set(
      completedPackageIds.map((id) => normalize(id))
    );

    return recommendations.filter(
      (item) =>
        !completedIds.has(normalize(item.packageId))
    );
  }, [recommendations, completedPackageIds]);

  const pendingTransferCount =
    pendingRecommendations.length;

  const completedToday = useMemo(() => {
    const today = new Date().toDateString();

    return completedMoves.filter((move) => {
      const completedDate = new Date(move.completedAt);

      return (
        !Number.isNaN(completedDate.getTime()) &&
        completedDate.toDateString() === today
      );
    }).length;
  }, [completedMoves]);

  async function handleUpload(file: File) {
    setLoading(true);
    setError("");

    try {
      const parsedInventory =
        await parseInventoryFile(file);

      const uploadedAt = new Date().toISOString();

      setInventory(parsedInventory);
      setFileName(file.name);

      saveCurrentInventory(parsedInventory);
      saveInventoryFileName(file.name);
      saveInventoryUploadTime(uploadedAt);

      window.setTimeout(() => {
        missingVaultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The inventory file could not be read."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleComplete(
    recommendation: MoveRecommendation
  ) {
    const completedMove: CompletedMove = {
      ...recommendation,
      completedAt: new Date().toISOString(),
    };

    const updatedMoves = [
      completedMove,
      ...completedMoves.filter(
        (move) =>
          normalize(move.packageId) !==
          normalize(recommendation.packageId)
      ),
    ];

    setCompletedMoves(updatedMoves);
    saveCompletedMoves(updatedMoves);
  }

  function scrollToUpload() {
    uploadRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function scrollToMissingVault() {
    missingVaultRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function scrollToReceiving() {
    receivingRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function scrollToTasks() {
    taskQueueRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function scrollToFullQueue() {
    const details =
      fullQueueRef.current?.querySelector("details");

    if (details instanceof HTMLDetailsElement) {
      details.open = true;
    }

    fullQueueRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleSelectCategory(category: string) {
    scrollToFullQueue();

    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent(
          "vault-tracker-category-filter",
          {
            detail: {
              category,
            },
          }
        )
      );
    }, 300);
  }

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 text-white">
        <div className="glass-panel rounded-[28px] px-6 py-5 text-sm text-slate-400">
          Loading transfers...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-3 py-3 text-white sm:px-5 sm:py-5">
      <div className="mx-auto flex max-w-[1720px] gap-5">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="min-w-0 flex-1">
          <Header
            pendingTransfers={pendingTransferCount}
            completedToday={completedToday}
          />

          <section className="glass-panel mt-5 rounded-[30px] p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lime)]">
              Transfers
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Vault replenishment workspace
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Upload the latest inventory, review products missing
              from the Vault, process Receiving moves, and complete
              exact METRC package transfers.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <WorkspaceButton
                label="Upload inventory"
                onClick={scrollToUpload}
              />

              <WorkspaceButton
                label="Missing Vault"
                onClick={scrollToMissingVault}
              />

              <WorkspaceButton
                label="Receiving"
                onClick={scrollToReceiving}
              />

              <WorkspaceButton
                label="Next package"
                onClick={scrollToTasks}
              />

              <WorkspaceButton
                label={`Full queue (${pendingTransferCount})`}
                onClick={scrollToFullQueue}
              />
            </div>
          </section>

          <section
            ref={uploadRef}
            className="mt-5 scroll-mt-5"
          >
            <UploadCard
              fileName={fileName}
              loading={loading}
              error={error}
              onUpload={handleUpload}
            />
          </section>

          <section
            ref={missingVaultRef}
            className="mt-5 scroll-mt-5"
          >
            <MissingVaultDashboard
              recommendations={recommendations}
              completedPackageIds={completedPackageIds}
              onSelectCategory={handleSelectCategory}
              onViewAll={scrollToFullQueue}
            />
          </section>

          <section
            ref={receivingRef}
            className="mt-5 scroll-mt-5"
          >
            <ReceivingAssistant
              recommendations={recommendations}
              completedPackageIds={completedPackageIds}
              onComplete={handleComplete}
              onViewAll={scrollToFullQueue}
            />
          </section>

          <section
            ref={taskQueueRef}
            className="mt-5 scroll-mt-5"
          >
            <TaskQueue
              recommendations={recommendations}
              completedPackageIds={completedPackageIds}
              onComplete={handleComplete}
              hasInventory={inventory.length > 0}
            />
          </section>

          <section
            ref={fullQueueRef}
            className="mt-5 scroll-mt-5"
          >
            <details className="glass-panel overflow-hidden rounded-[30px]">
              <summary className="cursor-pointer list-none px-5 py-5 sm:px-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Full transfer queue
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                      View all pending packages
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Search, filter, copy METRC IDs, complete
                      moves, or export the queue.
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-sm font-semibold text-slate-300">
                    {pendingTransferCount.toLocaleString()}
                  </span>
                </div>
              </summary>

              <div className="border-t border-white/[0.08] p-3 sm:p-5">
                <InventoryTable
                  recommendations={recommendations}
                  hasInventory={inventory.length > 0}
                  completedPackageIds={completedPackageIds}
                  onComplete={handleComplete}
                />
              </div>
            </details>
          </section>

          <footer className="mt-5 pb-3 text-center text-xs text-slate-600">
            Vault Tracker · Transfer Operations
          </footer>
        </div>
      </div>
    </main>
  );
}

function WorkspaceButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.075]"
    >
      {label}
    </button>
  );
}

function cleanCsvValue(
  value: string | undefined
): string {
  let cleaned = String(value ?? "").trim();

  if (
    cleaned.startsWith('="') &&
    cleaned.endsWith('"')
  ) {
    cleaned = cleaned.slice(2, -1);
  }

  return cleaned.trim();
}

function normalize(
  value: string | undefined
): string {
  return cleanCsvValue(value).toLowerCase();
}