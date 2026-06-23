"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CircleNotch, CheckCircle } from "@phosphor-icons/react";
import { Logo } from "@/components/brand/logo";

export default function ResetPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[100dvh]" />}>
      <ResetForm />
    </React.Suspense>
  );
}

function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not reset the password.");
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.push("/dashboard/sites");
        router.refresh();
      }, 1200);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[680px] -translate-x-1/2 ambient-soft blur-[120px]" />
      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-8 inline-flex">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 bezel-core">
          <h1 className="text-xl font-semibold tracking-tight text-white">Choose a new password</h1>

          {done ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
              <CheckCircle weight="fill" className="h-5 w-5 text-accent" /> Password updated. Signing you in.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-[13px] font-medium text-zinc-300">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-[15px] text-white placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/40"
                />
              </div>
              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent text-[14px] font-medium text-accent-foreground transition-[transform,filter] duration-200 ease-out hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? <CircleNotch weight="bold" className="h-4 w-4 animate-spin" /> : <>Reset password <ArrowRight weight="bold" className="h-4 w-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
