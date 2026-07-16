"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Archive,
  ClipboardCheck,
  ClipboardList,
  Home,
  Menu,
  PackageSearch,
  X,
} from "lucide-react";

import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: PackageSearch,
  },
  {
    name: "Transfers",
    href: "/transfers",
    icon: ClipboardList,
  },
  {
    name: "Count",
    href: "/count",
    icon: ClipboardCheck,
  },
  {
    name: "History",
    href: "/history",
    icon: Archive,
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="glass-panel sticky top-3 z-40 flex items-center justify-between rounded-[24px] px-4 py-3 lg:hidden">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(184,255,57,0.25)] bg-[rgba(184,255,57,0.1)] text-sm font-bold text-[var(--lime)]">
            VT
          </div>

          <div>
            <p className="font-semibold text-white">
              Vault Tracker
            </p>

            <p className="text-xs text-slate-500">
              Broad St Buds
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-200"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <aside className="glass-panel absolute right-3 top-3 w-[min(88vw,340px)] rounded-[28px] p-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <p className="font-semibold text-white">
                  Vault Tracker
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Navigation
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;

                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-4 rounded-2xl border px-4 py-3 transition ${
                      active
                        ? "border-[rgba(184,255,57,0.22)] bg-[rgba(184,255,57,0.1)] text-[var(--lime)]"
                        : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />

                    <span className="font-medium">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <nav className="glass-panel fixed bottom-3 left-3 right-3 z-40 grid grid-cols-5 rounded-[24px] p-2 lg:hidden">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold transition ${
                active
                  ? "bg-[rgba(184,255,57,0.1)] text-[var(--lime)]"
                  : "text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5" />

              <span className="max-w-full truncate">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}