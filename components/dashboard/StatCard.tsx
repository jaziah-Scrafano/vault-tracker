"use client";

import type { LucideIcon } from "lucide-react";

type StatCardTone = "lime" | "blue" | "orange" | "red";

type StatCardProps = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone?: StatCardTone;
  onClick?: () => void;
};

const toneStyles: Record<
  StatCardTone,
  {
    text: string;
    surface: string;
    icon: string;
  }
> = {
  lime: {
    text: "text-[var(--lime)]",
    surface: "border-[rgba(184,255,57,0.18)] bg-[rgba(184,255,57,0.07)]",
    icon: "text-[var(--lime)]",
  },
  blue: {
    text: "text-[var(--blue)]",
    surface: "border-[rgba(126,162,255,0.18)] bg-[rgba(126,162,255,0.07)]",
    icon: "text-[var(--blue)]",
  },
  orange: {
    text: "text-[var(--orange)]",
    surface: "border-[rgba(255,154,77,0.18)] bg-[rgba(255,154,77,0.07)]",
    icon: "text-[var(--orange)]",
  },
  red: {
    text: "text-[var(--red)]",
    surface: "border-[rgba(255,100,127,0.18)] bg-[rgba(255,100,127,0.07)]",
    icon: "text-[var(--red)]",
  },
};

export default function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "blue",
  onClick,
}: StatCardProps) {
  const selectedTone = toneStyles[tone];

  const className = `
    glass-card group w-full rounded-[26px] p-5 text-left
    transition duration-200
    ${
      onClick
        ? "cursor-pointer hover:-translate-y-0.5 hover:border-white/20"
        : ""
    }
  `;

  const content = (
    <div className="flex items-start justify-between gap-5">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>

        <p
          className={`metric-number mt-5 text-4xl font-semibold ${selectedTone.text}`}
        >
          {value.toLocaleString()}
        </p>

        <p className="mt-2 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${selectedTone.surface}`}
      >
        <Icon className={`h-5 w-5 ${selectedTone.icon}`} />
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}