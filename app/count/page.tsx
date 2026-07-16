"use client";

import Link from "next/link";
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Papa from "papaparse";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Filter,
  Play,
  RotateCcw,
  Search,
  UploadCloud,
  XCircle,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";

import {
  clearSavedCountSession,
  getCurrentInventory,
  getInventoryFileName,
  getSavedCountSession,
  saveCountSession,
  saveLatestCountSession,
} from "@/lib/storage";

import {
  buildCountResults,
  cleanCsvValue,
  normalizePackageId,
} from "@/lib/counts";

import type { InventoryRow } from "@/types/inventory";

import type {
  CountEntry,
  CountResult,
  CountScope,
  CountScopeType,
  CountStatus,
} from "@/types/count";

import type { CountSessionSummary } from "@/types/analytics";

type StatusFilter = "all" | CountStatus;

type UploadedCountRow = Record<string, unknown>;

export default function CountPage() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [inventoryFileName, setInventoryFileName] =
    useState("");

  const [countEntries, setCountEntries] = useState<
    CountEntry[]
  >([]);

  const [countFileName, setCountFileName] = useState("");

  const [scopeType, setScopeType] =
    useState<CountScopeType>("all");

  const [scopeValue, setScopeValue] = useState("All");

  const [activeScope, setActiveScope] =
    useState<CountScope>({
      type: "all",
      value: "All",
    });

  const [sessionStartedAt, setSessionStartedAt] =
    useState("");

  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("All");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [loaded, setLoaded] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    const savedSession = getSavedCountSession();

    setInventory(getCurrentInventory());
    setInventoryFileName(getInventoryFileName());

    if (savedSession) {
      setActiveScope({
        type: savedSession.summary.scopeType,
        value: savedSession.summary.scopeValue,
      });

      setScopeType(savedSession.summary.scopeType);
      setScopeValue(savedSession.summary.scopeValue);
      setCountEntries(savedSession.entries);
      setCountFileName(savedSession.countFileName);
      setSessionStartedAt(
        savedSession.summary.startedAt
      );
    } else {
      setSessionStartedAt(new Date().toISOString());
    }

    setLoaded(true);
  }, []);

  const allRooms = useMemo(() => {
    return uniqueSorted(
      inventory.map(
        (row) =>
          cleanCsvValue(row.room) || "Not listed"
      )
    );
  }, [inventory]);

  const allCategories = useMemo(() => {
    return uniqueSorted(
      inventory.map(
        (row) =>
          cleanCsvValue(row.category) ||
          "Uncategorized"
      )
    );
  }, [inventory]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    if (scopeType === "all") {
      setScopeValue("All");
      return;
    }

    if (scopeType === "room") {
      const currentRoomStillExists =
        allRooms.includes(scopeValue);

      if (!currentRoomStillExists) {
        setScopeValue(allRooms[0] ?? "All");
      }

      return;
    }

    const currentCategoryStillExists =
      allCategories.includes(scopeValue);

    if (!currentCategoryStillExists) {
      setScopeValue(allCategories[0] ?? "All");
    }
  }, [
    loaded,
    scopeType,
    scopeValue,
    allRooms,
    allCategories,
  ]);

  const scopedInventory = useMemo(() => {
    return inventory.filter((row) => {
      if (row.available <= 0) {
        return false;
      }

      if (activeScope.type === "room") {
        return (
          normalizeText(row.room) ===
          normalizeText(activeScope.value)
        );
      }

      if (activeScope.type === "category") {
        return (
          normalizeText(row.category) ===
          normalizeText(activeScope.value)
        );
      }

      return true;
    });
  }, [inventory, activeScope]);

  const results = useMemo(() => {
    return buildCountResults(
      scopedInventory,
      countEntries
    );
  }, [scopedInventory, countEntries]);

  const rooms = useMemo(() => {
    return uniqueSorted(
      results.map(
        (result) =>
          result.room || "Not listed"
      )
    );
  }, [results]);

  const filteredResults = useMemo(() => {
    const query = normalizeText(search);

    return results.filter((result) => {
      if (
        roomFilter !== "All" &&
        normalizeText(result.room) !==
          normalizeText(roomFilter)
      ) {
        return false;
      }

      if (
        statusFilter !== "all" &&
        result.status !== statusFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        normalizeText(result.packageId).includes(query) ||
        normalizeText(result.product).includes(query) ||
        normalizeText(result.room).includes(query) ||
        normalizeText(result.category).includes(query) ||
        normalizeText(result.vendor).includes(query)
      );
    });
  }, [
    results,
    search,
    roomFilter,
    statusFilter,
  ]);

  const countedResults = useMemo(() => {
    return results.filter(
      (result) => result.counted !== null
    );
  }, [results]);

  const matchedResults = useMemo(() => {
    return results.filter(
      (result) => result.status === "match"
    );
  }, [results]);

  const mismatchedResults = useMemo(() => {
    return results.filter(
      (result) => result.status === "mismatch"
    );
  }, [results]);

  const notCountedResults = useMemo(() => {
    return results.filter(
      (result) => result.status === "not-counted"
    );
  }, [results]);

  const accuracy = useMemo(() => {
    if (countedResults.length === 0) {
      return 0;
    }

    return Math.round(
      (matchedResults.length /
        countedResults.length) *
        100
    );
  }, [
    countedResults.length,
    matchedResults.length,
  ]);

  const progress = useMemo(() => {
    if (results.length === 0) {
      return 0;
    }

    return Math.round(
      (countedResults.length / results.length) *
        100
    );
  }, [
    countedResults.length,
    results.length,
  ]);

  useEffect(() => {
    if (
      !loaded ||
      inventory.length === 0 ||
      !sessionStartedAt
    ) {
      return;
    }

    const summary: CountSessionSummary = {
      scopeType: activeScope.type,
      scopeValue: activeScope.value,
      totalRows: results.length,
      countedRows: countedResults.length,
      matchedRows: matchedResults.length,
      mismatchedRows: mismatchedResults.length,
      notCountedRows: notCountedResults.length,
      accuracy,
      progress,
      startedAt: sessionStartedAt,
      updatedAt: new Date().toISOString(),
    };

    saveLatestCountSession(summary);

    saveCountSession({
      summary,
      entries: countEntries,
      countFileName,
    });
  }, [
    loaded,
    inventory.length,
    activeScope,
    results.length,
    countedResults.length,
    matchedResults.length,
    mismatchedResults.length,
    notCountedResults.length,
    accuracy,
    progress,
    sessionStartedAt,
    countEntries,
    countFileName,
  ]);

  function startCycleCount() {
    const newScope: CountScope = {
      type: scopeType,
      value:
        scopeType === "all"
          ? "All"
          : scopeValue,
    };

    clearSavedCountSession();

    setActiveScope(newScope);
    setSessionStartedAt(new Date().toISOString());

    setSearch("");
    setRoomFilter("All");
    setStatusFilter("all");
    setCountEntries([]);
    setCountFileName("");
    setUploadError("");
  }

  function updateCount(
    packageId: string,
    value: string
  ) {
    const normalizedId =
      normalizePackageId(packageId);

    if (value.trim() === "") {
      setCountEntries((current) =>
        current.filter(
          (entry) =>
            normalizePackageId(
              entry.packageId
            ) !== normalizedId
        )
      );

      return;
    }

    const parsedValue = Number(value);

    if (
      Number.isNaN(parsedValue) ||
      parsedValue < 0
    ) {
      return;
    }

    setCountEntries((current) => {
      const existingIndex =
        current.findIndex(
          (entry) =>
            normalizePackageId(
              entry.packageId
            ) === normalizedId
        );

      const updatedEntry: CountEntry = {
        packageId: cleanCsvValue(packageId),
        counted: parsedValue,
      };

      if (existingIndex === -1) {
        return [...current, updatedEntry];
      }

      return current.map((entry, index) =>
        index === existingIndex
          ? updatedEntry
          : entry
      );
    });
  }

  function clearCount(packageId: string) {
    const normalizedId =
      normalizePackageId(packageId);

    setCountEntries((current) =>
      current.filter(
        (entry) =>
          normalizePackageId(
            entry.packageId
          ) !== normalizedId
      )
    );
  }

  function clearAllCounts() {
    const confirmed = window.confirm(
      "Clear every entered physical count?"
    );

    if (!confirmed) {
      return;
    }

    clearSavedCountSession();

    setCountEntries([]);
    setCountFileName("");
    setUploadError("");
    setSessionStartedAt(new Date().toISOString());
  }

  function handleCountUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError("");
    setCountFileName(file.name);

    Papa.parse<UploadedCountRow>(file, {
      header: true,
      skipEmptyLines: true,

      complete: (parseResult) => {
        try {
          const uploadedEntries =
            parseUploadedCountRows(
              parseResult.data
            );

          if (uploadedEntries.length === 0) {
            throw new Error(
              "No package IDs and counted quantities were found."
            );
          }

          setCountEntries(uploadedEntries);
        } catch (error) {
          setCountEntries([]);
          setCountFileName("");

          setUploadError(
            error instanceof Error
              ? error.message
              : "The count CSV could not be read."
          );
        }
      },

      error: (error) => {
        setCountEntries([]);
        setCountFileName("");
        setUploadError(error.message);
      },
    });

    event.target.value = "";
  }

  function exportDiscrepancies() {
    const discrepancyRows = results
      .filter(
        (result) =>
          result.status === "mismatch" ||
          result.status === "not-counted"
      )
      .map((result) => ({
        "METRC Package ID": result.packageId,
        Product: result.product,
        Room: result.room,
        Category: result.category,
        Vendor: result.vendor,
        Expected: result.expected,
        Counted:
          result.counted === null
            ? ""
            : result.counted,
        Variance:
          result.variance === null
            ? ""
            : result.variance,
        Status:
          result.status === "mismatch"
            ? "Mismatch"
            : "Not counted",
      }));

    downloadCsv(
      Papa.unparse(discrepancyRows),
      "inventory-count-discrepancies.csv"
    );
  }

  function exportFullCount() {
    const exportRows = results.map(
      (result) => ({
        "METRC Package ID": result.packageId,
        Product: result.product,
        Room: result.room,
        Category: result.category,
        Vendor: result.vendor,
        Expected: result.expected,
        Counted:
          result.counted === null
            ? ""
            : result.counted,
        Variance:
          result.variance === null
            ? ""
            : result.variance,
        Status: getStatusLabel(
          result.status
        ),
      })
    );

    downloadCsv(
      Papa.unparse(exportRows),
      "inventory-count-results.csv"
    );
  }

  function clearFilters() {
    setSearch("");
    setRoomFilter("All");
    setStatusFilter("all");
  }

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 text-white">
        <div className="glass-panel rounded-[28px] px-6 py-5 text-sm text-slate-400">
          Loading count workspace...
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
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lime)]">
              Cycle Count
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Hard count verification
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Count the full inventory, one room, or
              one category. Matching rows turn green.
              Discrepancies turn red.
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
              <p className="text-xs text-slate-500">
                Hard count source
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-white">
                {inventoryFileName ||
                  "No inventory uploaded"}
              </p>
            </div>
          </header>

          {!inventory.length ? (
            <section className="glass-panel mt-5 rounded-[30px] px-5 py-16 text-center">
              <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-600" />

              <p className="mt-4 text-xl font-semibold text-white">
                No hard count inventory available
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Upload the Dutchie inventory CSV from
                the Transfers page first.
              </p>

              <Link
                href="/transfers"
                className="mt-6 inline-flex rounded-2xl border border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)] px-5 py-3 text-sm font-semibold text-[var(--lime)]"
              >
                Open Transfers
              </Link>
            </section>
          ) : (
            <>
              <section className="glass-panel mt-5 rounded-[30px] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Count setup
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Choose the cycle count scope
                </h2>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <label className="glass-input rounded-2xl px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Scope type
                    </p>

                    <select
                      value={scopeType}
                      onChange={(event) =>
                        setScopeType(
                          event.target
                            .value as CountScopeType
                        )
                      }
                      className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none"
                    >
                      <option
                        value="all"
                        className="bg-slate-950"
                      >
                        Full inventory
                      </option>

                      <option
                        value="room"
                        className="bg-slate-950"
                      >
                        One room
                      </option>

                      <option
                        value="category"
                        className="bg-slate-950"
                      >
                        One category
                      </option>
                    </select>
                  </label>

                  <label className="glass-input rounded-2xl px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Scope value
                    </p>

                    <select
                      value={scopeValue}
                      disabled={scopeType === "all"}
                      onChange={(event) =>
                        setScopeValue(
                          event.target.value
                        )
                      }
                      className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none disabled:opacity-40"
                    >
                      {scopeType === "all" && (
                        <option
                          value="All"
                          className="bg-slate-950"
                        >
                          All inventory
                        </option>
                      )}

                      {scopeType === "room" &&
                        allRooms.map((room) => (
                          <option
                            key={room}
                            value={room}
                            className="bg-slate-950"
                          >
                            {room}
                          </option>
                        ))}

                      {scopeType === "category" &&
                        allCategories.map(
                          (category) => (
                            <option
                              key={category}
                              value={category}
                              className="bg-slate-950"
                            >
                              {category}
                            </option>
                          )
                        )}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={startCycleCount}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-[rgba(184,255,57,0.25)] bg-[var(--lime)] px-5 py-4 text-sm font-bold text-black transition hover:brightness-110"
                  >
                    <Play className="h-4 w-4" />
                    Start count
                  </button>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
                  <p className="text-xs text-slate-500">
                    Active count
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {getScopeLabel(activeScope)}
                  </p>
                </div>
              </section>

              <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                <CountSummaryCard
                  label="Count rows"
                  value={results.length}
                  description="Packages in current scope"
                  tone="blue"
                />

                <CountSummaryCard
                  label="Counted"
                  value={countedResults.length}
                  description="Physical counts entered"
                  tone="orange"
                />

                <CountSummaryCard
                  label="Remaining"
                  value={notCountedResults.length}
                  description="Still need counting"
                  tone="blue"
                />

                <CountSummaryCard
                  label="Matched"
                  value={matchedResults.length}
                  description="Exact matches"
                  tone="lime"
                />

                <CountSummaryCard
                  label="Mismatched"
                  value={mismatchedResults.length}
                  description="Discrepancies"
                  tone="red"
                />

                <CountSummaryCard
                  label="Accuracy"
                  value={accuracy}
                  description={`${progress}% count progress`}
                  tone={
                    accuracy === 100 &&
                    countedResults.length > 0
                      ? "lime"
                      : "blue"
                  }
                  suffix="%"
                />
              </section>

              <section className="glass-panel mt-5 rounded-[30px] p-5 sm:p-6">
                <div className="grid gap-5 xl:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Upload physical count
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                      Import count CSV
                    </h2>

                    <label
                      htmlFor="count-upload"
                      className="mt-5 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)] px-5 py-4 text-sm font-semibold text-[var(--blue)]"
                    >
                      <UploadCloud className="h-4 w-4" />
                      Choose count CSV

                      <input
                        id="count-upload"
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleCountUpload}
                        className="hidden"
                      />
                    </label>

                    {countFileName &&
                      !uploadError && (
                        <p className="mt-3 text-sm text-slate-400">
                          Loaded:{" "}
                          <span className="font-semibold text-white">
                            {countFileName}
                          </span>
                        </p>
                      )}

                    {uploadError && (
                      <p className="mt-3 text-sm text-[var(--red)]">
                        {uploadError}
                      </p>
                    )}
                  </div>

                  <div className="rounded-[24px] border border-white/[0.08] bg-black/20 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Current progress
                    </p>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-[var(--lime)] transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-sm text-slate-400">
                      {countedResults.length} of{" "}
                      {results.length} packages counted
                    </p>
                  </div>
                </div>
              </section>

              <section className="glass-panel mt-5 rounded-[30px] p-5 sm:p-6">
                <div className="flex flex-col gap-4">
                  <div className="glass-input flex items-center gap-3 rounded-2xl px-4 py-3">
                    <Search className="h-5 w-5 text-slate-500" />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search product, METRC Package ID, vendor..."
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <label className="glass-input rounded-2xl px-4 py-3">
                      <p className="text-xs text-slate-500">
                        Room
                      </p>

                      <select
                        value={roomFilter}
                        onChange={(event) =>
                          setRoomFilter(
                            event.target.value
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

                        {rooms.map((room) => (
                          <option
                            key={room}
                            value={room}
                            className="bg-slate-950"
                          >
                            {room}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="glass-input rounded-2xl px-4 py-3">
                      <p className="text-xs text-slate-500">
                        Status
                      </p>

                      <select
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(
                            event.target
                              .value as StatusFilter
                          )
                        }
                        className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none"
                      >
                        <option
                          value="all"
                          className="bg-slate-950"
                        >
                          All statuses
                        </option>

                        <option
                          value="match"
                          className="bg-slate-950"
                        >
                          Matched
                        </option>

                        <option
                          value="mismatch"
                          className="bg-slate-950"
                        >
                          Mismatched
                        </option>

                        <option
                          value="not-counted"
                          className="bg-slate-950"
                        >
                          Not counted
                        </option>
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300"
                    >
                      <Filter className="h-4 w-4" />
                      Clear filters
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-white/[0.07] pt-4">
                    <button
                      type="button"
                      onClick={exportDiscrepancies}
                      disabled={
                        mismatchedResults.length ===
                          0 &&
                        notCountedResults.length ===
                          0
                      }
                      className="flex items-center gap-2 rounded-xl border border-[rgba(255,100,127,0.2)] bg-[rgba(255,100,127,0.08)] px-3 py-2 text-xs font-semibold text-[var(--red)] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export discrepancies
                    </button>

                    <button
                      type="button"
                      onClick={exportFullCount}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export full count
                    </button>

                    <button
                      type="button"
                      onClick={clearAllCounts}
                      disabled={
                        countEntries.length === 0
                      }
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset count
                    </button>
                  </div>
                </div>
              </section>

              <section className="glass-panel mt-5 rounded-[30px] p-4 sm:p-6">
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
                          Expected
                        </th>

                        <th className="px-5 py-4">
                          Counted
                        </th>

                        <th className="px-5 py-4">
                          Variance
                        </th>

                        <th className="px-5 py-4">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredResults.map(
                        (result, index) => (
                          <CountTableRow
                            key={[
                              result.packageId,
                              result.room,
                              result.product,
                              index,
                            ].join("-")}
                            result={result}
                            onCountChange={
                              updateCount
                            }
                            onClear={clearCount}
                          />
                        )
                      )}

                      {filteredResults.length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-16 text-center text-slate-500"
                          >
                            No rows match the current
                            cycle count.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

type CountTableRowProps = {
  result: CountResult;
  onCountChange: (
    packageId: string,
    value: string
  ) => void;
  onClear: (packageId: string) => void;
};

function CountTableRow({
  result,
  onCountChange,
  onClear,
}: CountTableRowProps) {
  return (
    <tr
      className={`border-t border-white/[0.07] ${
        result.status === "match"
          ? "bg-[rgba(184,255,57,0.075)]"
          : result.status === "mismatch"
            ? "bg-[rgba(255,100,127,0.085)]"
            : "bg-amber-500/[0.035]"
      }`}
    >
      <td className="px-5 py-5">
        <p className="font-mono text-sm font-bold text-[var(--lime)]">
          {result.packageId}
        </p>
      </td>

      <td className="px-5 py-5">
        <p className="font-medium text-white">
          {result.product}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {result.vendor} · {result.category}
        </p>
      </td>

      <td className="px-5 py-5 text-slate-300">
        {result.room}
      </td>

      <td className="px-5 py-5 text-lg font-semibold text-white">
        {result.expected.toLocaleString()}
      </td>

      <td className="px-5 py-5">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="any"
            value={result.counted ?? ""}
            onChange={(event) =>
              onCountChange(
                result.packageId,
                event.target.value
              )
            }
            placeholder="Count"
            className="w-28 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-semibold text-white outline-none"
          />

          {result.counted !== null && (
            <button
              type="button"
              onClick={() =>
                onClear(result.packageId)
              }
              className="rounded-xl border border-white/10 bg-black/20 p-2 text-slate-500 transition hover:text-white"
              aria-label="Clear count"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </td>

      <td className="px-5 py-5">
        {result.variance === null ? (
          <span className="text-slate-600">
            —
          </span>
        ) : (
          <span
            className={
              result.variance === 0
                ? "font-semibold text-[var(--lime)]"
                : "font-semibold text-[var(--red)]"
            }
          >
            {result.variance > 0 ? "+" : ""}
            {result.variance.toLocaleString()}
          </span>
        )}
      </td>

      <td className="px-5 py-5">
        {result.status === "match" && (
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(184,255,57,0.25)] bg-[rgba(184,255,57,0.1)] px-3 py-1.5 text-xs font-semibold text-[var(--lime)]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Match
          </span>
        )}

        {result.status === "mismatch" && (
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,100,127,0.25)] bg-[rgba(255,100,127,0.1)] px-3 py-1.5 text-xs font-semibold text-[var(--red)]">
            <XCircle className="h-3.5 w-3.5" />
            Mismatch
          </span>
        )}

        {result.status === "not-counted" && (
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            Not counted
          </span>
        )}
      </td>
    </tr>
  );
}

type SummaryTone =
  | "lime"
  | "blue"
  | "orange"
  | "red";

function CountSummaryCard({
  label,
  value,
  description,
  tone,
  suffix = "",
}: {
  label: string;
  value: number;
  description: string;
  tone: SummaryTone;
  suffix?: string;
}) {
  const toneClass: Record<
    SummaryTone,
    string
  > = {
    lime: "text-[var(--lime)]",
    blue: "text-[var(--blue)]",
    orange: "text-[var(--orange)]",
    red: "text-[var(--red)]",
  };

  return (
    <div className="glass-card rounded-[26px] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>

      <p
        className={`metric-number mt-4 text-4xl font-semibold ${toneClass[tone]}`}
      >
        {value.toLocaleString()}
        {suffix}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

function parseUploadedCountRows(
  rows: UploadedCountRow[]
): CountEntry[] {
  const entries = new Map<
    string,
    CountEntry
  >();

  for (const row of rows) {
    const packageValue = findColumnValue(
      row,
      [
        "metrc package id",
        "package id",
        "package",
        "metrc",
        "label",
        "package label",
      ]
    );

    const countValue = findColumnValue(
      row,
      [
        "counted quantity",
        "counted",
        "physical count",
        "physical quantity",
        "count",
        "quantity counted",
        "actual",
      ]
    );

    const packageId = cleanCsvValue(
      String(packageValue ?? "")
    );

    const counted =
      parseQuantity(countValue);

    if (!packageId || counted === null) {
      continue;
    }

    entries.set(
      normalizePackageId(packageId),
      {
        packageId,
        counted,
      }
    );
  }

  return Array.from(entries.values());
}

function findColumnValue(
  row: UploadedCountRow,
  possibleNames: string[]
): unknown {
  return Object.entries(row).find(
    ([columnName]) =>
      possibleNames.some(
        (possibleName) =>
          normalizeText(columnName) ===
          normalizeText(possibleName)
      )
  )?.[1];
}

function parseQuantity(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const parsed = Number(
    String(value)
      .replace(/,/g, "")
      .trim()
  );

  return Number.isNaN(parsed) ||
    parsed < 0
    ? null
    : parsed;
}

function getStatusLabel(
  status: CountStatus
): string {
  if (status === "match") {
    return "Match";
  }

  if (status === "mismatch") {
    return "Mismatch";
  }

  return "Not counted";
}

function getScopeLabel(
  scope: CountScope
): string {
  if (scope.type === "all") {
    return "Full inventory count";
  }

  if (scope.type === "room") {
    return `Room count: ${scope.value}`;
  }

  return `Category count: ${scope.value}`;
}

function normalizeText(
  value: string | undefined
): string {
  return cleanCsvValue(value)
    .trim()
    .toLowerCase();
}

function uniqueSorted(
  values: string[]
): string[] {
  return Array.from(
    new Set(values)
  ).sort((a, b) =>
    a.localeCompare(b)
  );
}

function downloadCsv(
  csv: string,
  fileName: string
) {
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}