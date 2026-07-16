"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  Filter,
  FlaskConical,
  PackageCheck,
  PackageSearch,
  Search,
  ShieldAlert,
  Sparkles,
  Truck,
  Warehouse,
  X,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";

import {
  getCurrentInventory,
  getInventoryFileName,
} from "@/lib/storage";

import type { InventoryRow } from "@/types/inventory";

type RoomType =
  | "Vault"
  | "Backstock"
  | "Receiving Room"
  | "Promo Room"
  | "Sample Room"
  | "Quarantine Room"
  | "Holding"
  | "Other";

type RoomSummary = {
  room: RoomType;
  packageCount: number;
  availableTotal: number;
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState<RoomType | "All">(
    "All"
  );
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [positiveOnly, setPositiveOnly] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setInventory(getCurrentInventory());
    setFileName(getInventoryFileName());
    setLoaded(true);
  }, []);

  const roomSummaries = useMemo<RoomSummary[]>(() => {
    const roomMap = new Map<
      RoomType,
      {
        packageCount: number;
        availableTotal: number;
      }
    >();

    for (const row of inventory) {
      const room = getRoomType(row.room);

      const current = roomMap.get(room) ?? {
        packageCount: 0,
        availableTotal: 0,
      };

      current.packageCount += 1;
      current.availableTotal += row.available;

      roomMap.set(room, current);
    }

    const roomOrder: RoomType[] = [
      "Vault",
      "Backstock",
      "Receiving Room",
      "Promo Room",
      "Sample Room",
      "Quarantine Room",
      "Holding",
      "Other",
    ];

    return roomOrder
      .map((room) => {
        const summary = roomMap.get(room);

        return {
          room,
          packageCount: summary?.packageCount ?? 0,
          availableTotal: summary?.availableTotal ?? 0,
        };
      })
      .filter((summary) => summary.packageCount > 0);
  }, [inventory]);

  const categories = useMemo(() => {
    return uniqueSorted(
      inventory.map(
        (row) => cleanCsvValue(row.category) || "Uncategorized"
      )
    );
  }, [inventory]);

  const vendors = useMemo(() => {
    return uniqueSorted(
      inventory.map(
        (row) => cleanCsvValue(row.vendor) || "Not listed"
      )
    );
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    const query = normalize(search);

    return inventory
      .filter((row) => {
        if (positiveOnly && row.available <= 0) {
          return false;
        }

        if (
          roomFilter !== "All" &&
          getRoomType(row.room) !== roomFilter
        ) {
          return false;
        }

        const category =
          cleanCsvValue(row.category) || "Uncategorized";

        if (
          categoryFilter !== "All" &&
          normalize(category) !== normalize(categoryFilter)
        ) {
          return false;
        }

        const vendor =
          cleanCsvValue(row.vendor) || "Not listed";

        if (
          vendorFilter !== "All" &&
          normalize(vendor) !== normalize(vendorFilter)
        ) {
          return false;
        }

        if (!query) {
          return true;
        }

        return (
          normalize(row.packageId).includes(query) ||
          normalize(row.product).includes(query) ||
          normalize(row.strain).includes(query) ||
          normalize(row.vendor).includes(query) ||
          normalize(row.category).includes(query) ||
          normalize(row.room).includes(query) ||
          normalize(row.sku).includes(query)
        );
      })
      .sort((a, b) => {
        const productCompare = cleanCsvValue(
          a.product
        ).localeCompare(cleanCsvValue(b.product));

        if (productCompare !== 0) {
          return productCompare;
        }

        return getRoomType(a.room).localeCompare(
          getRoomType(b.room)
        );
      });
  }, [
    inventory,
    search,
    roomFilter,
    categoryFilter,
    vendorFilter,
    positiveOnly,
  ]);

  const totalAvailable = useMemo(() => {
    return filteredInventory.reduce(
      (total, row) => total + row.available,
      0
    );
  }, [filteredInventory]);

  const uniqueProducts = useMemo(() => {
    return new Set(
      filteredInventory.map((row) =>
        normalize(row.product)
      )
    ).size;
  }, [filteredInventory]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    roomFilter !== "All" ||
    categoryFilter !== "All" ||
    vendorFilter !== "All" ||
    !positiveOnly;

  function clearFilters() {
    setSearch("");
    setRoomFilter("All");
    setCategoryFilter("All");
    setVendorFilter("All");
    setPositiveOnly(true);
  }

  function selectRoom(room: RoomType) {
    setRoomFilter((current) =>
      current === room ? "All" : room
    );
  }

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 text-white">
        <div className="glass-panel rounded-[28px] px-6 py-5 text-sm text-slate-400">
          Loading inventory...
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
          <header className="glass-panel rounded-[30px] p-5 sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Link>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">
                  Inventory Explorer
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Search every METRC package
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Search every package and instantly filter inventory
                  by its exact operational room.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
                <p className="text-xs text-slate-500">
                  Current inventory file
                </p>

                <p className="mt-1 max-w-[320px] truncate text-sm font-semibold text-white">
                  {fileName || "No inventory uploaded"}
                </p>
              </div>
            </div>
          </header>

          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              label="Packages shown"
              value={filteredInventory.length}
              description="Matching METRC package records"
              tone="blue"
            />

            <SummaryCard
              label="Unique products"
              value={uniqueProducts}
              description="Matching exact products"
              tone="lime"
            />

            <SummaryCard
              label="Available total"
              value={totalAvailable}
              description="Combined available quantity"
              tone="orange"
            />
          </section>

          <section className="glass-panel mt-5 rounded-[30px] p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Room Explorer
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-white">
                Inventory by room
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Select a room to show only its exact package records.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {roomSummaries.map((summary) => (
                <RoomCard
                  key={summary.room}
                  summary={summary}
                  active={roomFilter === summary.room}
                  onClick={() => selectRoom(summary.room)}
                />
              ))}
            </div>
          </section>

          <section className="glass-panel mt-5 rounded-[30px] p-5 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="glass-input flex items-center gap-3 rounded-2xl px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-slate-500" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search product, METRC Package ID, SKU, strain, vendor..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="glass-input rounded-2xl px-4 py-3">
                  <p className="text-xs text-slate-500">
                    Room
                  </p>

                  <select
                    value={roomFilter}
                    onChange={(event) =>
                      setRoomFilter(
                        event.target.value as RoomType | "All"
                      )
                    }
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none"
                  >
                    <option
                      value="All"
                      className="bg-slate-950"
                    >
                      All rooms
                    </option>

                    {roomSummaries.map((summary) => (
                      <option
                        key={summary.room}
                        value={summary.room}
                        className="bg-slate-950"
                      >
                        {summary.room}
                      </option>
                    ))}
                  </select>
                </label>

                <FilterSelect
                  label="Category"
                  value={categoryFilter}
                  options={categories}
                  onChange={setCategoryFilter}
                />

                <FilterSelect
                  label="Vendor"
                  value={vendorFilter}
                  options={vendors}
                  onChange={setVendorFilter}
                />

                <label className="glass-input flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      Availability
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      Positive inventory only
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={positiveOnly}
                    onChange={(event) =>
                      setPositiveOnly(event.target.checked)
                    }
                    className="h-4 w-4 accent-[var(--lime)]"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                    <Filter className="h-4 w-4" />

                    {filteredInventory.length.toLocaleString()}{" "}
                    package
                    {filteredInventory.length === 1
                      ? ""
                      : "s"}{" "}
                    match
                  </span>

                  {roomFilter !== "All" && (
                    <span className="rounded-full border border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--blue)]">
                      Room: {roomFilter}
                    </span>
                  )}

                  {categoryFilter !== "All" && (
                    <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold text-slate-300">
                      Category: {categoryFilter}
                    </span>
                  )}

                  {vendorFilter !== "All" && (
                    <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold text-slate-300">
                      Vendor: {vendorFilter}
                    </span>
                  )}
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.075]"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="glass-panel mt-5 rounded-[30px] p-4 sm:p-6">
            {!inventory.length ? (
              <div className="py-16 text-center">
                <PackageSearch className="mx-auto h-10 w-10 text-slate-600" />

                <p className="mt-4 text-lg font-semibold text-white">
                  No inventory available
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Upload a Dutchie CSV from the dashboard first.
                </p>

                <Link
                  href="/"
                  className="mt-5 inline-flex rounded-2xl border border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)] px-4 py-3 text-sm font-semibold text-[var(--lime)]"
                >
                  Return to dashboard
                </Link>
              </div>
            ) : (
              <div className="custom-scrollbar overflow-x-auto rounded-[22px] border border-white/10 bg-black/20">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.025] text-xs uppercase tracking-[0.12em] text-slate-500">
                      <th className="px-5 py-4">
                        METRC Package ID
                      </th>

                      <th className="px-5 py-4">
                        Product
                      </th>

                      <th className="px-5 py-4">
                        Room
                      </th>

                      <th className="px-5 py-4">
                        Category
                      </th>

                      <th className="px-5 py-4">
                        Available
                      </th>

                      <th className="px-5 py-4">
                        SKU
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInventory.map((row) => (
                      <tr
                        key={`${row.packageId}-${getRoomType(
                          row.room
                        )}`}
                        className="table-row"
                      >
                        <td className="px-5 py-5">
                          <p className="font-mono text-sm font-bold text-[var(--lime)]">
                            {cleanCsvValue(row.packageId)}
                          </p>
                        </td>

                        <td className="max-w-[430px] px-5 py-5">
                          <p className="font-medium text-white">
                            {cleanCsvValue(row.product)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {cleanCsvValue(row.vendor) ||
                              "Vendor not listed"}

                            {cleanCsvValue(row.strain)
                              ? ` · ${cleanCsvValue(row.strain)}`
                              : ""}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <RoomBadge room={getRoomType(row.room)} />
                        </td>

                        <td className="px-5 py-5">
                          <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold text-slate-300">
                            {cleanCsvValue(row.category) ||
                              "Uncategorized"}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span className="text-base font-semibold text-white">
                            {row.available.toLocaleString()}
                          </span>
                        </td>

                        <td className="px-5 py-5 font-mono text-xs text-slate-500">
                          {cleanCsvValue(row.sku) || "Not listed"}
                        </td>
                      </tr>
                    ))}

                    {filteredInventory.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-16 text-center text-slate-500"
                        >
                          No inventory matches the selected room,
                          search, and filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
  description: string;
  tone: "lime" | "blue" | "orange";
};

function SummaryCard({
  label,
  value,
  description,
  tone,
}: SummaryCardProps) {
  const toneClass = {
    lime: "text-[var(--lime)]",
    blue: "text-[var(--blue)]",
    orange: "text-[var(--orange)]",
  }[tone];

  return (
    <div className="glass-card rounded-[26px] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>

      <p
        className={`metric-number mt-4 text-4xl font-semibold ${toneClass}`}
      >
        {value.toLocaleString()}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <label className="glass-input rounded-2xl px-4 py-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none"
      >
        <option value="All" className="bg-slate-950">
          All {label.toLowerCase()}s
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-slate-950"
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

type RoomCardProps = {
  summary: RoomSummary;
  active: boolean;
  onClick: () => void;
};

function RoomCard({
  summary,
  active,
  onClick,
}: RoomCardProps) {
  const styles = getRoomStyles(summary.room);
  const Icon = getRoomIcon(summary.room);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass-card w-full rounded-[24px] p-4 text-left transition ${
        active
          ? `${styles.activeBorder} ${styles.activeBackground}`
          : "hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">
            {summary.room}
          </p>

          <p
            className={`metric-number mt-4 text-3xl font-semibold ${styles.text}`}
          >
            {summary.packageCount.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            packages
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${styles.iconSurface}`}
        >
          <Icon className={`h-5 w-5 ${styles.text}`} />
        </div>
      </div>

      <div className="mt-4 border-t border-white/[0.07] pt-3">
        <p className="text-xs text-slate-500">
          Available total
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-300">
          {summary.availableTotal.toLocaleString()}
        </p>
      </div>
    </button>
  );
}

function RoomBadge({
  room,
}: {
  room: RoomType;
}) {
  const styles = getRoomStyles(room);

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${styles.badge}`}
    >
      {room}
    </span>
  );
}

function getRoomType(room: string): RoomType {
  const normalizedRoom = normalize(room);

  if (normalizedRoom.includes("vault")) {
    return "Vault";
  }

  if (
    normalizedRoom.includes("backstock") ||
    normalizedRoom.includes("back stock")
  ) {
    return "Backstock";
  }

  if (normalizedRoom.includes("receiving")) {
    return "Receiving Room";
  }

  if (normalizedRoom.includes("promo")) {
    return "Promo Room";
  }

  if (normalizedRoom.includes("sample")) {
    return "Sample Room";
  }

  if (normalizedRoom.includes("quarantine")) {
    return "Quarantine Room";
  }

  if (normalizedRoom.includes("holding")) {
    return "Holding";
  }

  return "Other";
}

function getRoomIcon(room: RoomType) {
  const icons = {
    Vault: PackageCheck,
    Backstock: Boxes,
    "Receiving Room": Truck,
    "Promo Room": Sparkles,
    "Sample Room": FlaskConical,
    "Quarantine Room": ShieldAlert,
    Holding: Warehouse,
    Other: AlertTriangle,
  };

  return icons[room];
}

function getRoomStyles(room: RoomType) {
  const styles = {
    Vault: {
      text: "text-[var(--lime)]",
      badge:
        "border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)] text-[var(--lime)]",
      iconSurface:
        "border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)]",
      activeBorder:
        "border-[rgba(184,255,57,0.38)]",
      activeBackground:
        "bg-[rgba(184,255,57,0.08)]",
    },
    Backstock: {
      text: "text-[var(--orange)]",
      badge:
        "border-[rgba(255,154,77,0.2)] bg-[rgba(255,154,77,0.08)] text-[var(--orange)]",
      iconSurface:
        "border-[rgba(255,154,77,0.2)] bg-[rgba(255,154,77,0.08)]",
      activeBorder:
        "border-[rgba(255,154,77,0.38)]",
      activeBackground:
        "bg-[rgba(255,154,77,0.08)]",
    },
    "Receiving Room": {
      text: "text-[var(--blue)]",
      badge:
        "border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)] text-[var(--blue)]",
      iconSurface:
        "border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)]",
      activeBorder:
        "border-[rgba(126,162,255,0.38)]",
      activeBackground:
        "bg-[rgba(126,162,255,0.08)]",
    },
    "Promo Room": {
      text: "text-fuchsia-300",
      badge:
        "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300",
      iconSurface:
        "border-fuchsia-400/20 bg-fuchsia-500/10",
      activeBorder:
        "border-fuchsia-400/40",
      activeBackground:
        "bg-fuchsia-500/10",
    },
    "Sample Room": {
      text: "text-cyan-300",
      badge:
        "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
      iconSurface:
        "border-cyan-400/20 bg-cyan-500/10",
      activeBorder:
        "border-cyan-400/40",
      activeBackground:
        "bg-cyan-500/10",
    },
    "Quarantine Room": {
      text: "text-[var(--red)]",
      badge:
        "border-[rgba(255,100,127,0.2)] bg-[rgba(255,100,127,0.08)] text-[var(--red)]",
      iconSurface:
        "border-[rgba(255,100,127,0.2)] bg-[rgba(255,100,127,0.08)]",
      activeBorder:
        "border-[rgba(255,100,127,0.38)]",
      activeBackground:
        "bg-[rgba(255,100,127,0.08)]",
    },
    Holding: {
      text: "text-amber-300",
      badge:
        "border-amber-400/20 bg-amber-500/10 text-amber-300",
      iconSurface:
        "border-amber-400/20 bg-amber-500/10",
      activeBorder:
        "border-amber-400/40",
      activeBackground:
        "bg-amber-500/10",
    },
    Other: {
      text: "text-slate-300",
      badge:
        "border-white/10 bg-white/[0.045] text-slate-300",
      iconSurface:
        "border-white/10 bg-white/[0.045]",
      activeBorder:
        "border-white/25",
      activeBackground:
        "bg-white/[0.06]",
    },
  };

  return styles[room];
}

function cleanCsvValue(value: string): string {
  let cleaned = String(value ?? "").trim();

  if (cleaned.startsWith('="') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(2, -1);
  }

  return cleaned.trim();
}

function normalize(value: string): string {
  return cleanCsvValue(value).toLowerCase();
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) =>
    a.localeCompare(b)
  );
}