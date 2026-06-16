"use client";

import * as React from "react";
import { CircleNotch, CheckCircle, XCircle, WarningCircle } from "@phosphor-icons/react";

/**
 * Admin-only "is this deploy sellable?" panel. Renders nothing unless the
 * signed-in account is on the ADMIN_EMAILS allowlist. Reads /api/health and
 * shows each integration green/red so the founder can confirm a deploy is
 * fully wired before charging customers.
 */

type Health = {
  durable: boolean;
  stripe: boolean;
  email: boolean;
  render: boolean;
  blob: boolean;
  customDomains: boolean;
  authSecret: boolean;
  llm: boolean;
  storage: string;
  rootDomain: string | null;
};

// severity: "critical" — blocks selling/security; "recommended" — quality/scope.
const CHECKS: { key: keyof Health; label: string; hint: string; severity: "critical" | "recommended" }[] = [
  { key: "authSecret", label: "Session secret", hint: "AUTH_SECRET set (sessions not forgeable)", severity: "critical" },
  { key: "durable", label: "Durable storage", hint: "Vercel KV (not the local filesystem)", severity: "critical" },
  { key: "stripe", label: "Payments", hint: "Stripe keys + price IDs + webhook", severity: "critical" },
  { key: "llm", label: "AI copywriting", hint: "ANTHROPIC_API_KEY (rebuild quality)", severity: "recommended" },
  { key: "email", label: "Email delivery", hint: "RESEND_API_KEY (verification, reset, contact)", severity: "recommended" },
  { key: "customDomains", label: "Custom domains", hint: "Vercel domains token (Pro feature)", severity: "recommended" },
  { key: "render", label: "Headless render", hint: "Browserless (local browser used otherwise)", severity: "recommended" },
  { key: "blob", label: "Asset storage", hint: "Vercel Blob (uploaded logos/images)", severity: "recommended" },
];

export function AdminReadiness() {
  const [show, setShow] = React.useState(false);
  const [health, setHealth] = React.useState<Health | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setShow(!!d?.user?.comped))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => {
    if (!show) return;
    let alive = true;
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => alive && setHealth(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [show]);

  if (!show) return null;

  const blockers = health
    ? CHECKS.filter((c) => c.severity === "critical" && !health[c.key]).length
    : 0;

  return (
    <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-white">Admin · deploy readiness</span>
        {health &&
          (blockers === 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[12px] font-medium text-emerald-400">
              <CheckCircle weight="fill" className="h-4 w-4" /> Sellable
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[12px] font-medium text-red-400">
              <XCircle weight="fill" className="h-4 w-4" /> {blockers} blocker{blockers > 1 ? "s" : ""}
            </span>
          ))}
      </div>

      {!health && !error && (
        <div className="mt-3 flex items-center gap-2 text-muted-foreground">
          <CircleNotch weight="bold" className="h-4 w-4 animate-spin" /> Checking…
        </div>
      )}
      {error && <div className="mt-3 text-amber-400">Couldn&apos;t load /api/health.</div>}

      {health && (
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {CHECKS.map((c) => {
            const ok = health[c.key];
            return (
              <li key={c.key} className="flex items-start gap-2.5 rounded-lg bg-white/[0.02] px-3 py-2">
                {ok ? (
                  <CheckCircle weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                ) : c.severity === "critical" ? (
                  <XCircle weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                ) : (
                  <WarningCircle weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                )}
                <span className="min-w-0">
                  <span className="block font-medium text-zinc-200">{c.label}</span>
                  <span className="block text-[12px] text-muted-foreground">{c.hint}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {health && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-muted-foreground">
          <span>Storage: <span className="text-zinc-300">{health.storage}</span></span>
          <span>Root domain: <span className="text-zinc-300">{health.rootDomain || "— (set NEXT_PUBLIC_ROOT_DOMAIN)"}</span></span>
        </div>
      )}
    </div>
  );
}
