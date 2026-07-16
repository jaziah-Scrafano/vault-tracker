"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Boxes,
  ChevronDown,
  ClipboardClock,
  Gauge,
  Warehouse,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

import StatCard from "@/components/dashboard/StatCard";
import UploadCard from "@/components/dashboard/UploadCard";
import TaskQueue from "@/components/dashboard/TaskQueue";
import MissingVaultDashboard from "@/components/dashboard/MissingVaultDashboard";
import ReceivingAssistant from "@/components/dashboard/ReceivingAssistant";

import InventoryTable from "@/components/inventory/InventoryTable";

import ReadinessScore from "@/components/manager/ReadinessScore";
import NeedsAttention from "@/components/manager/NeedsAttention";
import ActivitySummary from "@/components/manager/ActivitySummary";
import TopVendors from "@/components/manager/TopVendors";
import RoomOverview from "@/components/manager/RoomOverview";
import InventoryMetadata from "@/components/manager/InventoryMetadata";
import ManagerQuickActions from "@/components/manager/ManagerQuickActions";

import { buildManagerAnalytics } from "@/lib/analytics";
import { parseInventoryFile } from "@/lib/parser";
import { createMoveRecommendations } from "@/lib/recommendations";

import {
  getCompletedMoves,
  getCurrentInventory,
  getInventoryFileName,
  getInventoryUploadTime,
  getLatestCountSession,
  saveCompletedMoves,
  saveCurrentInventory,
  saveInventoryFileName,
  saveInventoryUploadTime,
} from "@/lib/storage";

import type { CountSessionSummary } from "@/types/analytics";
import type { CompletedMove } from "@/types/history";

import type {
  InventoryRow,
  MoveRecommendation,
} from "@/types/inventory";

export default function Dashboard() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [completedMoves, setCompletedMoves] = useState<
    CompletedMove[]
  >([]);

  const [latestCount, setLatestCount] =
    useState<CountSessionSummary | null>(null);

  const [fileName, setFileName] = useState("");
  const [lastUploadedAt, setLastUploadedAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [error, setError] = useState("");

  const operationsRef = useRef<HTMLElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const missingVaultRef = useRef<HTMLDivElement>(null);
  const receivingAssistantRef = useRef<HTMLDivElement>(null);
  const taskQueueRef = useRef<HTMLDivElement>(null);
  const transferTableRef = useRef<HTMLDivElement>(null);

  const loadStoredData = useCallback(() => {
    setInventory(getCurrentInventory());
    setCompletedMoves(getCompletedMoves());
    setLatestCount(getLatestCountSession());
    setFileName(getInventoryFileName());
    setLastUploadedAt(getInventoryUploadTime());
  }, []);

  useEffect(() => {
    loadStoredData();
    setStorageLoaded(true);
  }, [loadStoredData]);

  useEffect(() => {
    function refreshDashboardData() {
      setCompletedMoves(getCompletedMoves());
      setLatestCount(getLatestCountSession());
    }

    window.addEventListener(
      "focus",
      refreshDashboardData
    );

    window.addEventListener(
      "storage",
      refreshDashboardData
    );

    return () => {
      window.removeEventListener(
        "focus",
        refreshDashboardData
      );

      window.removeEventListener(
        "storage",
        refreshDashboardData
      );
    };
  }, []);

  const recommendations = useMemo(() => {
    return createMoveRecommendations(inventory);
  }, [inventory]);

  const completedPackageIds = useMemo(() => {
    return completedMoves.map(
      (move) => move.packageId
    );
  }, [completedMoves]);

  const pendingRecommendations = useMemo(() => {
    const completedIds = new Set(
      completedPackageIds.map((id) =>
        normalize(id)
      )
    );

    return recommendations.filter(
      (item) =>
        !completedIds.has(
          normalize(item.packageId)
        )
    );
  }, [
    recommendations,
    completedPackageIds,
  ]);

  const pendingTransferCount =
    pendingRecommendations.length;

  const completedToday = useMemo(() => {
    const today = new Date().toDateString();

    return completedMoves.filter((move) => {
      const completedDate = new Date(
        move.completedAt
      );

      return (
        !Number.isNaN(
          completedDate.getTime()
        ) &&
        completedDate.toDateString() === today
      );
    }).length;
  }, [completedMoves]);

  const backstockPackages = useMemo(() => {
    return inventory.filter((row) => {
      const room = normalize(row.room);

      return (
        (room.includes("backstock") ||
          room.includes("back stock")) &&
        row.available > 0
      );
    }).length;
  }, [inventory]);

  const receivingPackages = useMemo(() => {
    return inventory.filter((row) => {
      return (
        normalize(row.room).includes(
          "receiving"
        ) && row.available > 0
      );
    }).length;
  }, [inventory]);

  const analytics = useMemo(() => {
    return buildManagerAnalytics({
      inventory,
      completedMoves,
      latestCount,
      fileName,
      lastUploadedAt,
    });
  }, [
    inventory,
    completedMoves,
    latestCount,
    fileName,
    lastUploadedAt,
  ]);

  async function handleUpload(file: File) {
    setLoading(true);
    setError("");

    try {
      const parsedInventory =
        await parseInventoryFile(file);

      const uploadedAt =
        new Date().toISOString();

      setInventory(parsedInventory);
      setFileName(file.name);
      setLastUploadedAt(uploadedAt);

      saveCurrentInventory(
        parsedInventory
      );

      saveInventoryFileName(file.name);
      saveInventoryUploadTime(uploadedAt);
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
          normalize(
            recommendation.packageId
          )
      ),
    ];

    setCompletedMoves(updatedMoves);
    saveCompletedMoves(updatedMoves);
  }

  function openOperations(
    target?:
      | "upload"
      | "missing"
      | "receiving"
      | "tasks"
      | "queue"
  ) {
    const details =
      operationsRef.current?.querySelector(
        "details"
      );

    if (
      details instanceof HTMLDetailsElement
    ) {
      details.open = true;
    }

    window.setTimeout(() => {
      if (target === "upload") {
        uploadSectionRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "start",
          }
        );

        return;
      }

      if (target === "missing") {
        missingVaultRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "start",
          }
        );

        return;
      }

      if (target === "receiving") {
        receivingAssistantRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "start",
          }
        );

        return;
      }

      if (target === "tasks") {
        taskQueueRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "start",
          }
        );

        return;
      }

      if (target === "queue") {
        transferTableRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "start",
          }
        );

        return;
      }

      operationsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function handleSelectCategory(
    category: string
  ) {
    openOperations("queue");

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
    }, 350);
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
            pendingTransfers={
              pendingTransferCount
            }
            completedToday={completedToday}
          />

          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Store readiness"
              value={
                analytics.readinessScore
              }
              description={
                analytics.readinessLabel
              }
              icon={Gauge}
              tone={
                analytics.readinessScore >= 85
                  ? "lime"
                  : analytics.readinessScore >=
                      70
                    ? "orange"
                    : "red"
              }
            />

            <StatCard
              label="Pending transfers"
              value={
                pendingTransferCount
              }
              description="Packages waiting to move"
              icon={ClipboardClock}
              tone="lime"
              onClick={() =>
                openOperations("tasks")
              }
            />

            <StatCard
              label="Backstock packages"
              value={backstockPackages}
              description="Positive Backstock packages"
              icon={Boxes}
              tone="orange"
              onClick={() =>
                openOperations("queue")
              }
            />

            <StatCard
              label="Receiving packages"
              value={receivingPackages}
              description="Positive Receiving packages"
              icon={Warehouse}
              tone="blue"
              onClick={() =>
                openOperations("receiving")
              }
            />
          </section>

          <section className="mt-5 grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]">
            <ReadinessScore
              score={
                analytics.readinessScore
              }
              label={
                analytics.readinessLabel
              }
              pendingTransfers={
                analytics.pendingTransfers
              }
              missingVaultProducts={
                analytics.missingVaultProducts
              }
              receivingPackages={
                analytics.receivingPackages
              }
              countDiscrepancies={
                analytics.latestCount
                  ?.mismatchedRows ?? 0
              }
            />

            <NeedsAttention
              alerts={analytics.alerts}
            />
          </section>

          <section className="mt-5 grid gap-5 2xl:grid-cols-2">
            <ActivitySummary
              completedTransfersToday={
                analytics.completedTransfersToday
              }
              latestCount={
                analytics.latestCount
              }
            />

            <ManagerQuickActions />
          </section>

          <section className="mt-5 grid gap-5 2xl:grid-cols-2">
            <RoomOverview
              rooms={analytics.rooms}
            />

            <TopVendors
              vendors={analytics.vendors}
            />
          </section>

          <section
            ref={operationsRef}
            className="mt-5 scroll-mt-5"
          >
            <details className="glass-panel overflow-hidden rounded-[30px]">
              <summary className="group cursor-pointer list-none px-5 py-5 sm:px-7">
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lime)]">
                      Operations workspace
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Transfers, receiving and
                      inventory tools
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                      Open this section when you
                      need to upload inventory,
                      review missing Vault products,
                      process Receiving, or complete
                      package transfers.
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold text-slate-300 sm:inline-flex">
                      {
                        pendingTransferCount
                      }{" "}
                      pending
                    </span>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                      <ChevronDown className="h-5 w-5 text-slate-400 transition group-open:rotate-180" />
                    </div>
                  </div>
                </div>
              </summary>

              <div className="border-t border-white/[0.08] px-3 pb-5 pt-3 sm:px-5 sm:pb-6">
                <div
                  ref={uploadSectionRef}
                  className="scroll-mt-5"
                >
                  <UploadCard
                    fileName={fileName}
                    loading={loading}
                    error={error}
                    onUpload={handleUpload}
                  />
                </div>

                <div
                  ref={missingVaultRef}
                  className="mt-5 scroll-mt-5"
                >
                  <MissingVaultDashboard
                    recommendations={
                      recommendations
                    }
                    completedPackageIds={
                      completedPackageIds
                    }
                    onSelectCategory={
                      handleSelectCategory
                    }
                    onViewAll={() =>
                      openOperations("queue")
                    }
                  />
                </div>

                <div
                  ref={
                    receivingAssistantRef
                  }
                  className="mt-5 scroll-mt-5"
                >
                  <ReceivingAssistant
                    recommendations={
                      recommendations
                    }
                    completedPackageIds={
                      completedPackageIds
                    }
                    onComplete={
                      handleComplete
                    }
                    onViewAll={() =>
                      openOperations("queue")
                    }
                  />
                </div>

                <div
                  ref={taskQueueRef}
                  className="mt-5 scroll-mt-5"
                >
                  <TaskQueue
                    recommendations={
                      recommendations
                    }
                    completedPackageIds={
                      completedPackageIds
                    }
                    onComplete={
                      handleComplete
                    }
                    hasInventory={
                      inventory.length > 0
                    }
                  />
                </div>

                <div
                  ref={transferTableRef}
                  className="mt-5 scroll-mt-5"
                >
                  <details className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-black/15">
                    <summary className="cursor-pointer list-none px-5 py-5 sm:px-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Full transfer queue
                          </p>

                          <h3 className="mt-2 text-xl font-semibold text-white">
                            View all pending
                            packages
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Search, filter, copy
                            METRC IDs, complete
                            moves, or export.
                          </p>
                        </div>

                        <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-sm font-semibold text-slate-300">
                          {
                            pendingTransferCount
                          }
                        </span>
                      </div>
                    </summary>

                    <div className="border-t border-white/[0.08] p-3 sm:p-5">
                      <InventoryTable
                        recommendations={
                          recommendations
                        }
                        hasInventory={
                          inventory.length >
                          0
                        }
                        completedPackageIds={
                          completedPackageIds
                        }
                        onComplete={
                          handleComplete
                        }
                      />
                    </div>
                  </details>
                </div>

                <div className="mt-5">
                  <InventoryMetadata
                    metadata={
                      analytics.metadata
                    }
                  />
                </div>
              </div>
            </details>
          </section>

          <footer className="mt-5 pb-3 text-center text-xs text-slate-600">
            Vault Tracker · Broad St Buds ·
            Inventory Operations
          </footer>
        </div>
      </div>
    </main>
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
  return cleanCsvValue(
    value
  ).toLowerCase();
}