"use client";

import Link from "next/link";
import {
  Bell,
  ChevronRight,
  History,
  Search,
} from "lucide-react";

type HeaderProps = {
  pendingTransfers: number;
  completedToday: number;
};

export default function Header({
  pendingTransfers,
  completedToday,
}: HeaderProps) {
  return (
    <header className="glass-panel rounded-[30px] p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">
            Inventory control
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Vault Tracker
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Review the exact METRC packages that should move into the Vault.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="glass-input hidden min-w-[320px] items-center gap-3 rounded-2xl px-4 py-3 lg:flex">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />

            <span className="text-sm text-slate-500">
              Search inventory, METRC, product...
            </span>
          </div>

          <Link
            href="/history"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.075]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
                <History className="h-4 w-4 text-blue-300" />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Completed today
                </p>

                <p className="text-sm font-semibold text-white">
                  {completedToday.toLocaleString()}
                </p>
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
          </Link>

          <button
            type="button"
            aria-label="View notifications"
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] transition hover:border-white/20 hover:bg-white/[0.075]"
          >
            <Bell className="h-5 w-5 text-slate-300" />

            {pendingTransfers > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--red)] px-1 text-[10px] font-bold text-white">
                {pendingTransfers > 99 ? "99+" : pendingTransfers}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}