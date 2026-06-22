"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, Tray, ArrowSquareOut, Sparkle, TrendUp, Globe } from "@phosphor-icons/react";

interface SiteRow {
  slug: string;
  brand: string;
  domain: string | null;
  domainVerified: boolean;
  views: { total: number; last7: number };
  leads: { total: number; last7: number };
  suggestion: string | null;
}
interface ValueData {
  signedIn: boolean;
  sites: SiteRow[];
  totals: { sites: number; views7: number; leads7: number };
}

/**
 * Recurring-value panel — the subscription-justification surface. Shows, for a
 * signed-in owner with published site(s), what their live site did this week
 * (views, leads) and the next concrete improvement. Self-hides when there's no
 * published site, so it never clutters first-run.
 */
export function ValueSummary() {
  const [data, setData] = React.useState<ValueData | null>(null);

  React.useEffect(() => {
    let active = true;
    fetch("/api/dashboard/value")
      .then((r) => r.json())
      .then((d: ValueData) => active && setData(d))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!data?.signedIn || data.sites.length === 0) return null;
  const liveHost = (s: SiteRow) => (s.domain && s.domainVerified ? s.domain : null);

  return (
    <section className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <TrendUp weight="bold" className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold text-white">This week on ReFrame</h2>
        <span className="text-[12px] text-zinc-500">· what your live site is doing for you</span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { icon: Globe, label: data.totals.sites > 1 ? "Sites live" : "Site live", value: data.totals.sites },
          { icon: Eye, label: "Views · 7d", value: data.totals.views7 },
          { icon: Tray, label: "New leads · 7d", value: data.totals.leads7, accent: true },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-white/8 bg-black/20 p-4">
            <m.icon weight="bold" className={`h-4 w-4 ${m.accent ? "text-accent" : "text-zinc-400"}`} />
            <div className="mt-2 text-2xl font-semibold tabular-nums text-white">{m.value.toLocaleString()}</div>
            <div className="text-[12px] text-zinc-500">{m.label}</div>
          </div>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {data.sites.map((s) => {
          const host = liveHost(s);
          const href = host ? `https://${host}` : `/s/${s.slug}`;
          return (
            <li key={s.slug} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-white/8 bg-black/20 px-4 py-3">
              <a href={href} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-1.5 font-medium text-white hover:underline">
                <span className="truncate">{s.brand}</span>
                <ArrowSquareOut weight="bold" className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
              </a>
              <span className="text-[12px] text-zinc-500">{host ?? `${s.slug} · reframe.site`}</span>
              <div className="ml-auto flex items-center gap-4 text-[13px]">
                <span className="flex items-center gap-1.5 text-zinc-300" title="Views (7 days)">
                  <Eye weight="bold" className="h-3.5 w-3.5 text-zinc-500" /> {s.views.last7}
                </span>
                <span className="flex items-center gap-1.5 text-zinc-300" title="Leads (7 days)">
                  <Tray weight="bold" className="h-3.5 w-3.5 text-zinc-500" /> {s.leads.last7}
                </span>
              </div>
              {s.suggestion && (
                <div className="flex w-full items-center gap-1.5 border-t border-white/5 pt-2 text-[12.5px] text-zinc-400">
                  <Sparkle weight="fill" className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="min-w-0 flex-1">{s.suggestion}</span>
                  <Link href="/editor" className="shrink-0 font-medium text-accent hover:underline">
                    Improve →
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
