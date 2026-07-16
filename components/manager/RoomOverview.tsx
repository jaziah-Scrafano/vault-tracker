"use client";

import {
  AlertTriangle,
  Boxes,
  FlaskConical,
  PackageCheck,
  ShieldAlert,
  Sparkles,
  Truck,
  Warehouse,
} from "lucide-react";

import type { RoomMetric } from "@/types/analytics";

type RoomOverviewProps = {
  rooms: RoomMetric[];
};

type RoomTone =
  | "lime"
  | "orange"
  | "blue"
  | "fuchsia"
  | "cyan"
  | "red"
  | "amber"
  | "slate";

export default function RoomOverview({
  rooms,
}: RoomOverviewProps) {
  const visibleRooms = rooms.slice(0, 8);

  const maxPackages =
    visibleRooms.length > 0
      ? Math.max(
          ...visibleRooms.map(
            (room) => room.packageCount
          )
        )
      : 0;

  return (
    <section className="glass-panel h-full rounded-[30px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">
            Inventory by room
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Room workload
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Positive package records and total available
            quantity by operational room.
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)]">
          <Warehouse className="h-5 w-5 text-[var(--blue)]" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {visibleRooms.map((room) => {
          const normalizedRoom = normalizeRoom(room.room);
          const tone = getRoomTone(normalizedRoom);
          const styles = getToneStyles(tone);
          const Icon = getRoomIcon(normalizedRoom);

          const width =
            maxPackages === 0
              ? 0
              : Math.round(
                  (room.packageCount / maxPackages) *
                    100
                );

          return (
            <div
              key={room.room}
              className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${styles.surface}`}
                  >
                    <Icon
                      className={`h-4 w-4 ${styles.text}`}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {room.room}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {room.availableTotal.toLocaleString()}{" "}
                      total available
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`metric-number text-xl font-semibold ${styles.text}`}
                  >
                    {room.packageCount.toLocaleString()}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    packages
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
                  style={{
                    width: `${width}%`,
                  }}
                />
              </div>
            </div>
          );
        })}

        {visibleRooms.length === 0 && (
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] px-5 py-10 text-center">
            <Warehouse className="mx-auto h-8 w-8 text-slate-600" />

            <p className="mt-3 font-semibold text-white">
              No room data available
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Upload an inventory CSV to populate room metrics.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function normalizeRoom(room: string): string {
  let cleaned = String(room ?? "").trim();

  if (
    cleaned.startsWith('="') &&
    cleaned.endsWith('"')
  ) {
    cleaned = cleaned.slice(2, -1);
  }

  return cleaned.trim().toLowerCase();
}

function getRoomTone(room: string): RoomTone {
  if (room.includes("vault")) {
    return "lime";
  }

  if (
    room.includes("backstock") ||
    room.includes("back stock")
  ) {
    return "orange";
  }

  if (room.includes("receiving")) {
    return "blue";
  }

  if (room.includes("promo")) {
    return "fuchsia";
  }

  if (room.includes("sample")) {
    return "cyan";
  }

  if (room.includes("quarantine")) {
    return "red";
  }

  if (room.includes("holding")) {
    return "amber";
  }

  return "slate";
}

function getRoomIcon(room: string) {
  if (room.includes("vault")) {
    return PackageCheck;
  }

  if (
    room.includes("backstock") ||
    room.includes("back stock")
  ) {
    return Boxes;
  }

  if (room.includes("receiving")) {
    return Truck;
  }

  if (room.includes("promo")) {
    return Sparkles;
  }

  if (room.includes("sample")) {
    return FlaskConical;
  }

  if (room.includes("quarantine")) {
    return ShieldAlert;
  }

  if (room.includes("holding")) {
    return Warehouse;
  }

  return AlertTriangle;
}

function getToneStyles(tone: RoomTone) {
  const styles: Record<
    RoomTone,
    {
      text: string;
      surface: string;
      bar: string;
    }
  > = {
    lime: {
      text: "text-[var(--lime)]",
      surface:
        "border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)]",
      bar: "bg-[var(--lime)]",
    },

    orange: {
      text: "text-[var(--orange)]",
      surface:
        "border-[rgba(255,154,77,0.2)] bg-[rgba(255,154,77,0.08)]",
      bar: "bg-[var(--orange)]",
    },

    blue: {
      text: "text-[var(--blue)]",
      surface:
        "border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)]",
      bar: "bg-[var(--blue)]",
    },

    fuchsia: {
      text: "text-fuchsia-300",
      surface:
        "border-fuchsia-400/20 bg-fuchsia-500/10",
      bar: "bg-fuchsia-300",
    },

    cyan: {
      text: "text-cyan-300",
      surface:
        "border-cyan-400/20 bg-cyan-500/10",
      bar: "bg-cyan-300",
    },

    red: {
      text: "text-[var(--red)]",
      surface:
        "border-[rgba(255,100,127,0.2)] bg-[rgba(255,100,127,0.08)]",
      bar: "bg-[var(--red)]",
    },

    amber: {
      text: "text-amber-300",
      surface:
        "border-amber-400/20 bg-amber-500/10",
      bar: "bg-amber-300",
    },

    slate: {
      text: "text-slate-300",
      surface:
        "border-white/10 bg-white/[0.045]",
      bar: "bg-slate-300",
    },
  };

  return styles[tone];
}