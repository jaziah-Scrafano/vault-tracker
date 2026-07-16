"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FileSpreadsheet,
  History,
  PackageSearch,
  Truck,
  Upload,
} from "lucide-react";

const actions = [
  {
    title: "Inventory Explorer",
    description: "Search products, rooms and package IDs.",
    href: "/inventory",
    icon: PackageSearch,
    color:
      "border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)] text-[var(--blue)]",
  },
  {
    title: "Cycle Count",
    description: "Start a new room or category count.",
    href: "/count",
    icon: ClipboardCheck,
    color:
      "border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)] text-[var(--lime)]",
  },
  {
    title: "Transfer Queue",
    description: "Review products needing movement.",
    href: "/",
    icon: Truck,
    color:
      "border-[rgba(255,154,77,0.2)] bg-[rgba(255,154,77,0.08)] text-[var(--orange)]",
  },
  {
    title: "History",
    description: "Completed transfer history.",
    href: "/history",
    icon: History,
    color:
      "border-white/10 bg-white/[0.05] text-slate-300",
  },
  {
    title: "Upload Inventory",
    description: "Load today's Dutchie inventory CSV.",
    href: "/",
    icon: Upload,
    color:
      "border-[rgba(126,162,255,0.2)] bg-[rgba(126,162,255,0.08)] text-[var(--blue)]",
  },
  {
    title: "Export Reports",
    description: "Download transfer and count reports.",
    href: "/count",
    icon: FileSpreadsheet,
    color:
      "border-[rgba(184,255,57,0.2)] bg-[rgba(184,255,57,0.08)] text-[var(--lime)]",
  },
];

export default function ManagerQuickActions() {
  return (
    <section className="glass-panel rounded-[30px] p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Quick actions
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Manager shortcuts
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Jump directly into the tools used most during a shift.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${action.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                {action.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {action.description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition group-hover:text-white">
                Open
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
);
}