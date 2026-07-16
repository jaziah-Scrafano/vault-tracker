"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BarChart3,
  Boxes,
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
    name: "Inventory",
    href: "/inventory",
    icon: PackageSearch,
  },
  {
    name: "Backstock",
    href: "/backstock",
    icon: Boxes,
  },
  {
    name: "Transfers",
    href: "/",
    icon: ClipboardList,
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
      {/* Logo */}
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10">
          <ShieldCheck
            size={30}
            className="text-lime-300"
          />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Vault Tracker
          </h1>

          <p className="text-xs text-slate-500">
            Broad St Buds
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-200 ${
                active
                  ? "bg-lime-400/15 border border-lime-400/20 text-lime-300 shadow-lg"
                  : "border border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
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

      {/* Bottom Card */}
      <div className="mt-auto">
        <div className="glass-card rounded-3xl p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Store Status
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-lime-400 shadow-[0_0_18px_rgba(163,230,53,.9)]" />

            <span className="font-medium">
              System Online
            </span>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">
                Version
              </span>

              <span>0.3.0</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                Store
              </span>

              <span>Phillipsburg</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}