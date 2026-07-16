"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  PackageCheck,
} from "lucide-react";

import type { MoveRecommendation } from "@/types/inventory";

type TaskQueueProps = {
  recommendations: MoveRecommendation[];
  completedPackageIds: string[];
  onComplete: (item: MoveRecommendation) => void;
  hasInventory: boolean;
};

export default function TaskQueue({
  recommendations,
  completedPackageIds,
  onComplete,
  hasInventory,
}: TaskQueueProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedPackageId, setCopiedPackageId] = useState("");
  const [transitionState, setTransitionState] = useState<
    "idle" | "leaving" | "entering"
  >("idle");

  const pendingTasks = useMemo(() => {
    return recommendations.filter(
      (item) =>
        !completedPackageIds.includes(item.packageId)
    );
  }, [recommendations, completedPackageIds]);

  const safeIndex =
    pendingTasks.length === 0
      ? 0
      : Math.min(activeIndex, pendingTasks.length - 1);

  const activeTask = pendingTasks[safeIndex];

  const completedCount =
    recommendations.length - pendingTasks.length;

  const progress =
    recommendations.length === 0
      ? 0
      : Math.round(
          (completedCount / recommendations.length) * 100
        );

  useEffect(() => {
    if (activeIndex > pendingTasks.length - 1) {
      setActiveIndex(
        pendingTasks.length > 0
          ? pendingTasks.length - 1
          : 0
      );
    }
  }, [activeIndex, pendingTasks.length]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;

      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (typing || transitionState !== "idle") {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }

      if (event.code === "Space" && activeTask) {
        event.preventDefault();
        completeCurrentTask();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  });

  async function copyPackageId(packageId: string) {
    try {
      await navigator.clipboard.writeText(packageId);
      setCopiedPackageId(packageId);

      window.setTimeout(() => {
        setCopiedPackageId("");
      }, 1400);
    } catch {
      window.alert(
        "The METRC Package ID could not be copied."
      );
    }
  }

  function showPrevious() {
    if (pendingTasks.length <= 1) {
      return;
    }

    setTransitionState("leaving");

    window.setTimeout(() => {
      setActiveIndex((current) =>
        current <= 0
          ? pendingTasks.length - 1
          : current - 1
      );

      setTransitionState("entering");

      window.setTimeout(() => {
        setTransitionState("idle");
      }, 220);
    }, 180);
  }

  function showNext() {
    if (pendingTasks.length <= 1) {
      return;
    }

    setTransitionState("leaving");

    window.setTimeout(() => {
      setActiveIndex((current) =>
        current >= pendingTasks.length - 1
          ? 0
          : current + 1
      );

      setTransitionState("entering");

      window.setTimeout(() => {
        setTransitionState("idle");
      }, 220);
    }, 180);
  }

  function completeCurrentTask() {
    if (!activeTask || transitionState !== "idle") {
      return;
    }

    const taskToComplete = activeTask;

    setTransitionState("leaving");

    window.setTimeout(() => {
      onComplete(taskToComplete);

      setActiveIndex((current) => {
        const remainingLength =
          pendingTasks.length - 1;

        if (remainingLength <= 0) {
          return 0;
        }

        return Math.min(
          current,
          remainingLength - 1
        );
      });

      setTransitionState("entering");

      window.setTimeout(() => {
        setTransitionState("idle");
      }, 240);
    }, 220);
  }

  const animationClass =
    transitionState === "leaving"
      ? "translate-y-3 scale-[0.985] opacity-0"
      : transitionState === "entering"
        ? "-translate-y-3 scale-[0.985] opacity-0"
        : "translate-y-0 scale-100 opacity-100";

  return (
    <section className="glass-panel rounded-[30px] p-5 sm:p-7">
      <div className="flex flex-col gap-5 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lime)]">
            Today&apos;s workflow
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            Next package to move
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Complete one transfer at a time using
            the exact METRC Package ID.
          </p>

          <p className="mt-3 text-xs text-slate-600">
            Keyboard: Space to complete · ← previous ·
            → next
          </p>
        </div>

        <div className="min-w-[190px] rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Progress
            </span>

            <span className="font-semibold text-white">
              {completedCount} /{" "}
              {recommendations.length}
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-[var(--lime)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-right text-xs text-slate-500">
            {progress}% complete
          </p>
        </div>
      </div>

      {!hasInventory && (
        <div className="py-16 text-center">
          <PackageCheck className="mx-auto h-10 w-10 text-slate-600" />

          <p className="mt-4 text-lg font-semibold text-white">
            Upload today&apos;s inventory
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Your next transfer will appear here.
          </p>
        </div>
      )}

      {hasInventory && !activeTask && (
        <div className="py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)]">
            <Check className="h-7 w-7 text-[var(--lime)]" />
          </div>

          <p className="mt-5 text-xl font-semibold text-white">
            All transfers complete
          </p>

          <p className="mt-2 text-sm text-slate-500">
            No additional packages need to move
            into the Vault.
          </p>
        </div>
      )}

      {activeTask && (
        <div className="overflow-hidden pt-6">
          <div
            className={`grid gap-5 transition-all duration-200 ease-out xl:grid-cols-[1fr_240px] ${animationClass}`}
          >
            <div className="rounded-[26px] border border-white/10 bg-black/20 p-5 sm:p-7">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Product
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold leading-tight text-white">
                    {activeTask.product}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {activeTask.vendor ||
                      "Vendor not listed"}

                    {activeTask.strain
                      ? ` · ${activeTask.strain}`
                      : ""}
                  </p>
                </div>

                <span className="w-fit rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold text-slate-300">
                  {activeTask.category ||
                    "Uncategorized"}
                </span>
              </div>

              <div className="mt-7">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Exact METRC Package ID
                </p>

                <button
                  type="button"
                  onClick={() =>
                    copyPackageId(
                      activeTask.packageId
                    )
                  }
                  className="mt-3 flex w-full items-center justify-between gap-4 rounded-2xl border border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.07)] px-4 py-4 text-left transition hover:border-[rgba(184,255,57,0.35)] hover:bg-[rgba(184,255,57,0.1)]"
                >
                  <span className="break-all font-mono text-base font-bold text-[var(--lime)] sm:text-lg">
                    {activeTask.packageId}
                  </span>

                  {copiedPackageId ===
                  activeTask.packageId ? (
                    <Check className="h-5 w-5 shrink-0 text-[var(--lime)]" />
                  ) : (
                    <Clipboard className="h-5 w-5 shrink-0 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="mt-7 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <RoomCard
                  label="Move from"
                  room={activeTask.moveFrom}
                  tone={
                    activeTask.moveFrom
                      .toLowerCase()
                      .includes("receiving")
                      ? "blue"
                      : "orange"
                  }
                />

                <div className="flex justify-center">
                  <ArrowDown className="h-5 w-5 text-slate-600 sm:rotate-[-90deg]" />
                </div>

                <RoomCard
                  label="Move to"
                  room={activeTask.moveTo}
                  tone="lime"
                />
              </div>

              <div className="mt-7 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
                <span className="text-sm text-slate-500">
                  Package availability
                </span>

                <span className="text-lg font-semibold text-white">
                  {activeTask.available.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={completeCurrentTask}
                disabled={
                  transitionState !== "idle"
                }
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-[rgba(184,255,57,0.3)] bg-[var(--lime)] px-5 py-4 font-bold text-black transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
              >
                <Check className="h-5 w-5" />

                {transitionState === "leaving"
                  ? "Completing transfer..."
                  : "Mark transfer complete"}
              </button>
            </div>

            <aside className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Queue position
              </p>

              <p className="mt-3 text-3xl font-semibold text-white">
                {safeIndex + 1}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                of {pendingTasks.length} pending
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={showPrevious}
                  disabled={
                    pendingTasks.length <= 1 ||
                    transitionState !== "idle"
                  }
                  className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] py-3 text-slate-300 transition hover:bg-white/[0.075] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Previous task"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={showNext}
                  disabled={
                    pendingTasks.length <= 1 ||
                    transitionState !== "idle"
                  }
                  className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] py-3 text-slate-300 transition hover:bg-white/[0.075] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Next task"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 border-t border-white/[0.08] pt-5">
                <p className="text-sm leading-6 text-slate-500">
                  Complete this package and the next
                  pending transfer will slide into place.
                </p>
              </div>
            </aside>
          </div>
        </div>
      )}
    </section>
  );
}

type RoomCardProps = {
  label: string;
  room: string;
  tone: "lime" | "blue" | "orange";
};

function RoomCard({
  label,
  room,
  tone,
}: RoomCardProps) {
  const toneClasses = {
    lime:
      "border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.07)] text-[var(--lime)]",
    blue:
      "border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.07)] text-[var(--blue)]",
    orange:
      "border-[rgba(255,154,77,0.2)] bg-[rgba(255,154,77,0.07)] text-[var(--orange)]",
  };

  return (
    <div
      className={`rounded-2xl border p-4 text-center ${toneClasses[tone]}`}
    >
      <p className="text-xs uppercase tracking-[0.12em] opacity-70">
        {label}
      </p>

      <p className="mt-2 font-semibold">
        {room}
      </p>
    </div>
  );
}