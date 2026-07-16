"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (signInError) {
        throw signInError;
      }

      const nextPath =
        searchParams.get("next") || "/";

      router.replace(nextPath);
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5"
    >
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Email
        </span>

        <div className="glass-input mt-2 flex items-center gap-3 rounded-2xl px-4 py-3">
          <Mail className="h-5 w-5 text-slate-500" />

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            autoComplete="email"
            required
            placeholder="employee@broadstreetbudsnj.com"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Password
        </span>

        <div className="glass-input mt-2 flex items-center gap-3 rounded-2xl px-4 py-3">
          <LockKeyhole className="h-5 w-5 text-slate-500" />

          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((current) => !current)
            }
            className="text-slate-500 transition hover:text-white"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </label>

      {error && (
        <div className="rounded-2xl border border-[rgba(255,100,127,0.22)] bg-[rgba(255,100,127,0.08)] px-4 py-3 text-sm text-[var(--red)]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(184,255,57,0.28)] bg-[var(--lime)] px-5 py-4 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Sign in
          </>
        )}
      </button>

      <p className="text-center text-xs leading-5 text-slate-500">
        Access is restricted to approved Broad St Buds staff.
      </p>
    </form>
  );
}