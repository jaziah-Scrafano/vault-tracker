import { Suspense } from "react";

import {
  Boxes,
  ClipboardCheck,
  ShieldCheck,
  Warehouse,
} from "lucide-react";

import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 text-white">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[34px] border border-white/10 bg-black/30 shadow-2xl backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden min-h-[650px] border-r border-white/[0.08] bg-white/[0.025] p-10 lg:flex lg:flex-col">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(184,255,57,0.28)] bg-[rgba(184,255,57,0.1)]">
              <ShieldCheck className="h-7 w-7 text-[var(--lime)]" />
            </div>

            <div>
              <p className="text-xl font-bold text-white">
                Vault Tracker
              </p>

              <p className="text-sm text-slate-500">
                Broad St Buds
              </p>
            </div>
          </div>

          <div className="my-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lime)]">
              Inventory operations
            </p>

            <h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-tight text-white">
              One shared workspace for the entire store.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
              Review inventory, complete transfers, run cycle
              counts, and keep every authorized employee working
              from the same data.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <FeatureCard
                icon={Boxes}
                title="Inventory"
                description="Shared package data"
              />

              <FeatureCard
                icon={Warehouse}
                title="Transfers"
                description="Vault replenishment"
              />

              <FeatureCard
                icon={ClipboardCheck}
                title="Counts"
                description="Live discrepancies"
              />
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Authorized Broad St Buds staff only
          </p>
        </section>

        <section className="flex min-h-[650px] items-center p-5 sm:p-8 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="lg:hidden">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(184,255,57,0.28)] bg-[rgba(184,255,57,0.1)]">
                <ShieldCheck className="h-7 w-7 text-[var(--lime)]" />
              </div>

              <p className="mt-4 text-xl font-bold text-white">
                Vault Tracker
              </p>

              <p className="text-sm text-slate-500">
                Broad St Buds
              </p>
            </div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lime)] lg:mt-0">
              Secure access
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Sign in to continue
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Use the email and password associated with your
              approved employee account.
            </p>

            <Suspense
              fallback={
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 text-sm text-slate-500">
                  Loading sign-in form...
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}

type FeatureCardProps = {
  icon: typeof Boxes;
  title: string;
  description: string;
};

function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-black/20 p-4">
      <Icon className="h-5 w-5 text-[var(--lime)]" />

      <p className="mt-4 font-semibold text-white">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}