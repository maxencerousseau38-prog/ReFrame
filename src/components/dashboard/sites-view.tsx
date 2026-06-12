"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Trash, Plus, Globe } from "@phosphor-icons/react";

type SiteCard = {
  slug: string;
  name: string;
  tagline?: string;
  createdAt: string;
  blocks: number;
};

type PlanInfo = { label: string; limit: number };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SitesView({ sites, plan }: { sites: SiteCard[]; plan: PlanInfo }) {
  const [items, setItems] = React.useState(sites);
  const [pending, setPending] = React.useState<string | null>(null);
  const atLimit = items.length >= plan.limit;

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
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-accent-foreground transition-[transform,filter] duration-200 ease-out hover:brightness-105 active:scale-[0.98]"
          >
            <Plus weight="bold" className="h-4 w-4" /> New site
          </Link>
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
              <li
                key={s.slug}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-semibold text-white">{s.name}</h3>
                    <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">
                      {s.blocks} blocks
                    </span>
                  </div>
                  {s.tagline && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{s.tagline}</p>
                  )}
                  <p className="mt-3 font-mono text-[11px] text-zinc-500">
                    reframe.site/{s.slug}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[12px] text-zinc-500">{formatDate(s.createdAt)}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => remove(s.slug)}
                      disabled={pending === s.slug}
                      aria-label="Delete site"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                    >
                      <Trash weight="bold" className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/s/${s.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-white/5"
                    >
                      Open <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
