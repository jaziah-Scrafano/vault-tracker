"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Archive,
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  Home,
  PackageSearch,
  Settings,
  ShieldCheck,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Inventory Explorer",
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
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-panel sticky top-5 flex h-[calc(100vh-40px)] w-[255px] flex-col rounded-[32px] p-5">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(184,255,57,0.3)] bg-[rgba(184,255,57,0.1)]">
          <ShieldCheck
            size={30}
            className="text-[var(--lime)]"
          />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Vault Tracker
          </h1>

          <p className="text-xs text-slate-500">
            Broad St Buds
          </p>
        </div>
      </div>

      <nav className="space-y-2">
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
              className={`flex items-center gap-4 rounded-2xl border px-4 py-3 transition-all duration-200 ${
                active
                  ? "border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.12)] text-[var(--lime)] shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
                  : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <Icon size={20} />

              <span className="font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="glass-card rounded-3xl p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Store status
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-[var(--lime)] shadow-[0_0_18px_rgba(184,255,57,0.8)]" />

            <span className="font-medium text-white">
              System online
            </span>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Version
              </span>

              <span className="text-slate-300">
                0.5.0
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Store
              </span>

              <span className="text-slate-300">
                Phillipsburg
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}