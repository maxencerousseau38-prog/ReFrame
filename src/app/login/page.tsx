"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CircleNotch } from "@phosphor-icons/react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { LabeledDivider } from "@/components/ui/labeled-divider";

type Mode = "login" | "signup";

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[100dvh]" />}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard/sites";

  const [mode, setMode] = React.useState<Mode>("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  async function forgot() {
    setError(null);
    setNotice(null);
    if (!email) {
      setError("Enter your email above first.");
      return;
    }
    await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setNotice("If that email has an account, a reset link is on its way.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      // Sign-up may require email confirmation before a session exists.
      if (mode === "signup" && data.needsConfirmation) {
        setNotice("Almost there — check your inbox to confirm your email, then sign in.");
        setMode("login");
        setPassword("");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    // AuthSplit (I-017): focused form left, quiet editorial panel right.
    // overflow-x-clip kills the ambient-halo horizontal scroll on mobile.
    <main className="grid min-h-[100dvh] overflow-x-clip lg:grid-cols-2">
      {/* Form column */}
      <section className="relative flex items-center justify-center px-6 py-16">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[min(680px,100vw)] -translate-x-1/2 ambient-soft blur-[120px]" />

        <div className="relative w-full max-w-sm">
          <Link href="/" className="mb-10 inline-flex">
            <Logo />
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to manage your published sites."
              : "Publish sites you can come back to and edit."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[13px] font-medium text-foreground/80">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[13px] font-medium text-foreground/80">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={forgot}
                    className="text-[13px] text-muted-foreground transition-colors duration-fast ease-premium hover:text-foreground"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <PasswordInput
                id="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "login" ? "Your password" : "At least 8 characters"}
              />
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-[13px] text-red-200">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-lg border border-white/12 bg-white/[0.05] px-3 py-2 text-[13px] text-foreground/90">
                {notice}
              </p>
            )}

            <Button type="submit" disabled={busy} className="h-11 w-full">
              {busy ? (
                <CircleNotch weight="bold" className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight weight="bold" className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <LabeledDivider
            className="mt-8"
            label={mode === "login" ? "New to ReFrame?" : "Already have an account?"}
          />
          <Button
            variant="secondary"
            className="mt-4 h-11 w-full"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </Button>
        </div>
      </section>

      {/* Editorial panel — real product copy only, no fabricated proof. */}
      <aside className="relative hidden overflow-hidden border-l border-white/8 lg:flex lg:items-center lg:justify-center">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid bg-fade-b opacity-50" />
        <div aria-hidden className="pointer-events-none absolute inset-0 ambient opacity-70" />
        <div className="relative max-w-md px-10">
          <LogoMark className="h-8 opacity-90" />
          <p className="mt-8 text-balance text-3xl font-semibold leading-[1.15] tracking-tight text-foreground">
            The website your customers trust.
          </p>
          <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground">
            Paste your link. ReFrame rebuilds your existing site into one that
            earns trust on sight — no builder, no blank page.
          </p>
        </div>
      </aside>
    </main>
  );
}
