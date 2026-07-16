"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Boxes,
  ClipboardClock,
  PackageCheck,
  Warehouse,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import UploadCard from "@/components/dashboard/UploadCard";
import QuickActions from "@/components/dashboard/QuickActions";
import TaskQueue from "@/components/dashboard/TaskQueue";
import MissingVaultDashboard from "@/components/dashboard/MissingVaultDashboard";
import ReceivingAssistant from "@/components/dashboard/ReceivingAssistant";
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
} from "@/lib/storage";

import type {
  InventoryRow,
  MoveRecommendation,
} from "@/types/inventory";
import type { CompletedMove } from "@/types/history";

export default function Dashboard() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [completedMoves, setCompletedMoves] = useState<
    CompletedMove[]
  >([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storageLoaded, setStorageLoaded] = useState(false);

  const uploadSectionRef = useRef<HTMLElement>(null);
  const taskQueueRef = useRef<HTMLElement>(null);
  const transferTableRef = useRef<HTMLElement>(null);
  const missingVaultRef = useRef<HTMLElement>(null);
  const receivingAssistantRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setInventory(getCurrentInventory());
    setCompletedMoves(getCompletedMoves());
    setFileName(getInventoryFileName());
    setStorageLoaded(true);
  }, []);

  const recommendations = useMemo(() => {
    return createMoveRecommendations(inventory);
  }, [inventory]);

  const completedPackageIds = useMemo(() => {
    return completedMoves.map((move) => move.packageId);
  }, [completedMoves]);

  const pendingRecommendations = useMemo(() => {
    return recommendations.filter(
      (item) =>
        !completedPackageIds.includes(item.packageId)
    );
  }, [recommendations, completedPackageIds]);

  const pendingTransferCount =
    pendingRecommendations.length;

  const completedToday = useMemo(() => {
    const today = new Date().toDateString();

    return completedMoves.filter((move) => {
      return (
        new Date(move.completedAt).toDateString() === today
      );
    }).length;
  }, [completedMoves]);

  const vaultPackages = useMemo(() => {
    return inventory.filter((row) => {
      return (
        row.room.toLowerCase().includes("vault") &&
        row.available > 0
      );
    }).length;
  }, [inventory]);

  const backstockPackages = useMemo(() => {
    return inventory.filter((row) => {
      return (
        row.room.toLowerCase().includes("backstock") &&
        row.available > 0
      );
    }).length;
  }, [inventory]);

  const receivingPackages = useMemo(() => {
    return inventory.filter((row) => {
      return (
        row.room
          .toLowerCase()
          .includes("receiving room") &&
        row.available > 0
      );
    }).length;
  }, [inventory]);

  async function handleUpload(file: File) {
    setLoading(true);
    setError("");
    setFileName(file.name);

    try {
      const parsedInventory =
        await parseInventoryFile(file);

      setInventory(parsedInventory);
      saveCurrentInventory(parsedInventory);
      saveInventoryFileName(file.name);

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
          move.packageId !== recommendation.packageId
      ),
    ];

    setCompletedMoves(updatedMoves);
    saveCompletedMoves(updatedMoves);
  }

  function scrollToUpload() {
    uploadSectionRef.current?.scrollIntoView({
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

  function scrollToTransfers() {
    transferTableRef.current?.scrollIntoView({
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

  function scrollToReceivingAssistant() {
    receivingAssistantRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleSelectCategory(category: string) {
    scrollToTransfers();

    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("vault-tracker-category-filter", {
          detail: {
            category,
          },
        })
      );
    }, 250);
  }

  function exportQueue() {
    scrollToTransfers();
  }

  function refreshView() {
    window.location.reload();
  }

  if (!storageLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 text-white">
        <div className="glass-panel rounded-[28px] px-6 py-5 text-sm text-slate-400">
          Loading Vault Tracker...
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

          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Pending transfers"
              value={pendingTransferCount}
              description="Packages waiting to move"
              icon={ClipboardClock}
              tone="lime"
              onClick={scrollToTasks}
            />

            <StatCard
              label="Vault packages"
              value={vaultPackages}
              description="Positive packages in Vault"
              icon={PackageCheck}
              tone="blue"
              onClick={scrollToMissingVault}
            />

            <StatCard
              label="Backstock packages"
              value={backstockPackages}
              description="Positive packages in Backstock"
              icon={Boxes}
              tone="orange"
              onClick={scrollToTransfers}
            />

            <StatCard
              label="Receiving packages"
              value={receivingPackages}
              description="Available in Receiving room"
              icon={Warehouse}
              tone="red"
              onClick={scrollToReceivingAssistant}
            />
          </section>

          <section
            ref={uploadSectionRef}
            className="mt-5 scroll-mt-5"
          >
            <UploadCard
              fileName={fileName}
              loading={loading}
              error={error}
              onUpload={handleUpload}
            />
          </section>

          <section className="mt-5">
            <QuickActions
              onUploadClick={scrollToUpload}
              onExportClick={exportQueue}
              onRefreshClick={refreshView}
              exportDisabled={
                pendingRecommendations.length === 0
              }
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
              onViewAll={scrollToTransfers}
            />
          </section>

          <section
            ref={receivingAssistantRef}
            className="mt-5 scroll-mt-5"
          >
            <ReceivingAssistant
              recommendations={recommendations}
              completedPackageIds={completedPackageIds}
              onComplete={handleComplete}
              onViewAll={scrollToTransfers}
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
            ref={transferTableRef}
            className="mt-5 scroll-mt-5"
          >
            <details className="glass-panel overflow-hidden rounded-[30px]">
              <summary className="cursor-pointer list-none px-5 py-5 sm:px-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Full queue
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                      View all pending transfers
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Search, copy METRC IDs, complete moves,
                      or export the queue.
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-sm font-semibold text-slate-300">
                    {pendingTransferCount}
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
            Vault Tracker · Broad St Buds · METRC Inventory
            Control
          </footer>
        </div>
      </div>
    </main>
  );
}