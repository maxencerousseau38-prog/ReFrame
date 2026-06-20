"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Trash, Plus, Globe, CircleNotch, CheckCircle, Warning, Copy, Check, DownloadSimple, Sparkle } from "@phosphor-icons/react";

/** One-click copy for fiddly DNS values, so connecting a domain is paste-only. */
function CopyCell({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          /* clipboard blocked; the value is still visible to copy manually */
        }
      }}
      title={`Copy: ${value}`}
      className="flex min-w-0 items-center gap-1.5 text-left transition-colors hover:text-white"
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <Check weight="bold" className="h-3 w-3 shrink-0 text-accent" />
      ) : (
        <Copy weight="bold" className="h-3 w-3 shrink-0 text-zinc-500" />
      )}
    </button>
  );
}

type SiteCard = {
  slug: string;
  name: string;
  tagline?: string;
  createdAt: string;
  blocks: number;
  domain?: string | null;
  domainVerified?: boolean;
  views7?: number;
  viewsTotal?: number;
  suggestions?: string[];
};

/** DNS record the customer adds at their registrar (mirrors the API response). */
type DnsRecord = { type: "A" | "CNAME" | "TXT"; name: string; value: string; reason?: string };

type PlanInfo = { id: "free" | "pro" | "studio"; label: string; limit: number };

function formatDate(iso: string): string {
  // Fixed locale AND timezone so the server (UTC) and the client (local tz)
  // render the exact same string. Otherwise the day can flip across the date
  // boundary and React throws a hydration mismatch (#425).
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function SitesView({
  sites,
  plan,
  upgraded,
  rootDomain,
  canCustomDomain,
}: {
  sites: SiteCard[];
  plan: PlanInfo;
  upgraded?: boolean;
  rootDomain: string | null;
  canCustomDomain: boolean;
}) {
  const [items, setItems] = React.useState(sites);
  const [pending, setPending] = React.useState<string | null>(null);
  const [portalBusy, setPortalBusy] = React.useState(false);
  const atLimit = items.length >= plan.limit;

  async function manageBilling() {
    setPortalBusy(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) window.location.href = data.url;
      else alert(data.error || "Billing portal is unavailable.");
    } finally {
      setPortalBusy(false);
    }
  }

  async function remove(slug: string) {
    if (!confirm("Delete this site? This cannot be undone.")) return;
    setPending(slug);
    try {
      const res = await fetch(`/api/sites/${slug}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((s) => s.slug !== slug));
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-4xl">
        {upgraded && (
          <div className="mb-6 rounded-xl border border-accent/30 bg-accent/[0.06] px-4 py-3 text-[13px] text-zinc-200">
            You are on the <span className="font-medium text-accent">{plan.label}</span> plan. Thanks for the upgrade.
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Your sites</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[12px] font-medium text-accent">
                {plan.label}
              </span>
              {items.length} of {plan.limit} published
            </p>
          </div>
          <div className="flex items-center gap-2">
            {plan.id !== "free" && (
              <button
                onClick={manageBilling}
                disabled={portalBusy}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-60"
              >
                {portalBusy ? <CircleNotch weight="bold" className="h-4 w-4 animate-spin" /> : "Manage billing"}
              </button>
            )}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-accent-foreground transition-[transform,filter] duration-200 ease-out hover:brightness-105 active:scale-[0.98]"
            >
              <Plus weight="bold" className="h-4 w-4" /> New site
            </Link>
          </div>
        </div>

        {atLimit && items.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/[0.06] px-4 py-3">
            <p className="text-[13px] text-zinc-300">
              You have reached your {plan.label} plan limit of {plan.limit}.
            </p>
            <Link
              href="/#pricing"
              className="rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-medium text-accent-foreground transition-[transform,filter] hover:brightness-105 active:scale-[0.98]"
            >
              Upgrade plan
            </Link>
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
              <Globe weight="bold" className="h-5 w-5" />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-white">No sites yet</h2>
            <p className="mt-1 max-w-xs text-sm text-zinc-400">
              Paste a link, let ReFrame rebuild it, and publish. It will show up here.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-accent-foreground transition-[transform,filter] duration-200 ease-out hover:brightness-105 active:scale-[0.98]"
            >
              Transform a site <ArrowUpRight weight="bold" className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {items.map((s) => (
              <SiteRow
                key={s.slug}
                site={s}
                rootDomain={rootDomain}
                canCustomDomain={canCustomDomain}
                deleting={pending === s.slug}
                onDelete={() => remove(s.slug)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SiteRow({
  site,
  rootDomain,
  canCustomDomain,
  deleting,
  onDelete,
}: {
  site: SiteCard;
  rootDomain: string | null;
  canCustomDomain: boolean;
  deleting: boolean;
  onDelete: () => void;
}) {
  const liveHost = rootDomain ? `${site.slug}.${rootDomain}` : `reframe.site/${site.slug}`;
  const liveHref = rootDomain ? `https://${liveHost}` : `/s/${site.slug}`;

  const [domain, setDomain] = React.useState(site.domain ?? "");
  const [verified, setVerified] = React.useState(Boolean(site.domainVerified));
  const [connected, setConnected] = React.useState(Boolean(site.domain));
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [records, setRecords] = React.useState<DnsRecord[]>([]);

  async function connect() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/sites/${site.slug}/domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Could not connect the domain.");
        return;
      }
      setConnected(true);
      setVerified(Boolean(data.verified));
      setRecords(Array.isArray(data.records) ? data.records : []);
      setMsg(data.message);
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    try {
      await fetch(`/api/sites/${site.slug}/domain`, { method: "DELETE" });
      setConnected(false);
      setVerified(false);
      setDomain("");
      setRecords([]);
      setMsg(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-white">{site.name}</h3>
          <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">
            {site.blocks} blocks
          </span>
        </div>
        {site.tagline && <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{site.tagline}</p>}

        {/* Recurring-value signals: real traffic + the next best move. */}
        {(site.views7 !== undefined || site.suggestions?.length) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-zinc-400">
            <span>
              <span className="font-semibold text-white">{site.views7 ?? 0}</span> visits this week
            </span>
            <span className="text-zinc-600">·</span>
            <span>
              <span className="font-semibold text-white">{site.viewsTotal ?? 0}</span> all-time
            </span>
          </div>
        )}
        {site.suggestions && site.suggestions.length > 0 && (
          <div className="mt-3 rounded-lg border border-accent/20 bg-accent/[0.05] p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-accent">
              <Sparkle weight="fill" className="h-3 w-3" /> AI webmaster
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-300">{site.suggestions[0]}</p>
          </div>
        )}

        <p className="mt-3 font-mono text-[11px] text-zinc-500">{liveHost}</p>

        {connected && (
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px]">
            {verified ? (
              <CheckCircle weight="fill" className="h-3.5 w-3.5 text-accent" />
            ) : (
              <Warning weight="fill" className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span className={verified ? "text-zinc-300" : "text-amber-300/90"}>
              {domain || site.domain} {verified ? "" : "(pending DNS)"}
            </span>
          </p>
        )}

        {canCustomDomain && open && (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="www.yoursite.com"
                className="h-9 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[13px] text-white placeholder:text-zinc-600 focus:border-accent/50 focus:outline-none"
              />
              <button
                onClick={connect}
                disabled={busy || !domain}
                className="rounded-lg bg-accent px-3 text-[12px] font-medium text-accent-foreground disabled:opacity-50"
              >
                {busy ? <CircleNotch weight="bold" className="h-4 w-4 animate-spin" /> : connected ? "Re-verify" : "Connect"}
              </button>
            </div>
            {msg && <p className="text-[11px] leading-relaxed text-zinc-400">{msg}</p>}
            {records.length > 0 && !verified && (
              <div className="overflow-hidden rounded-lg border border-white/10">
                <div className="grid grid-cols-[auto_1fr_2fr] gap-x-3 bg-white/[0.03] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  <span>Type</span>
                  <span>Name</span>
                  <span>Value</span>
                </div>
                {records.map((r, i) => (
                  <div
                    key={`${r.type}-${r.name}-${i}`}
                    className="grid grid-cols-[auto_1fr_2fr] gap-x-3 border-t border-white/5 px-3 py-1.5 font-mono text-[11px] text-zinc-300"
                  >
                    <span className="text-accent">{r.type}</span>
                    <CopyCell value={r.name} />
                    <CopyCell value={r.value} />
                  </div>
                ))}
                <p className="border-t border-white/5 px-3 py-2 font-sans text-[11px] leading-relaxed text-zinc-500">
                  Add this at your domain registrar (where you bought the domain). HTTPS turns on
                  automatically once DNS propagates, then click Re-verify.
                </p>
              </div>
            )}
            {connected && (
              <button onClick={disconnect} disabled={busy} className="text-[11px] text-zinc-500 hover:text-red-300">
                Disconnect domain
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-[12px] text-zinc-500">{formatDate(site.createdAt)}</span>
        <div className="flex items-center gap-1.5">
          {canCustomDomain && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Connect domain"
              title="Connect a custom domain"
            >
              <Globe weight="bold" className="h-4 w-4" />
            </button>
          )}
          <a
            href={`/api/sites/${site.slug}/export`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Export site"
            title="Export your full site (HTML, CSS, images) — yours to host anywhere"
          >
            <DownloadSimple weight="bold" className="h-4 w-4" />
          </a>
          <button
            onClick={onDelete}
            disabled={deleting}
            aria-label="Delete site"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
          >
            <Trash weight="bold" className="h-4 w-4" />
          </button>
          <Link
            href={liveHref}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-white/5"
          >
            Open <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </li>
  );
}
