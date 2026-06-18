"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, CircleNotch } from "@phosphor-icons/react";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type Tier = {
  name: string;
  plan: "free" | "pro" | "studio";
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  featured: boolean;
};

export function Pricing() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const p = t.pricing;
  const tiers: Tier[] = [
    { plan: "free", price: "$0", period: p.forever, featured: false, ...p.tiers.free },
    { plan: "pro", price: "$29", period: p.perMonth, featured: true, ...p.tiers.pro },
    { plan: "studio", price: "$99", period: p.perMonth, featured: false, ...p.tiers.studio },
  ];

  async function choose(tier: Tier) {
    if (tier.plan === "free") {
      router.push("/dashboard");
      return;
    }
    setLoading(tier.plan);
    setNotice(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: tier.plan }),
      });
      if (res.status === 401) {
        router.push("/login?next=/%23pricing");
        return;
      }
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setNotice(data.error || "Could not start checkout.");
    } catch {
      setNotice("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section id="pricing" className="px-6 py-32">
      <div className="mx-auto max-w-[1100px]">
        <BlurReveal className="max-w-2xl">
          <h2 className="font-semibold leading-[1.02] tracking-[-0.03em] text-white [font-size:clamp(2.25rem,5.5vw,4rem)]">
            {p.title}
          </h2>
          <p className="mt-4 text-zinc-400">{p.sub}</p>
          <p className="mt-2 text-[13px] text-zinc-500">{p.ownership}</p>
          {notice && (
            <p className="mt-4 inline-block rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-2 text-[13px] text-zinc-200">
              {notice}
            </p>
          )}
        </BlurReveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <BlurReveal key={tier.name} delay={i * 0.08}>
              <div
                className={cn(
                  "group h-full rounded-[1.75rem] p-1.5 ring-1 ring-inset transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5",
                  tier.featured
                    ? "bg-accent/10 ring-accent/30 hover:shadow-[0_36px_90px_-32px_rgba(159,222,63,0.45)]"
                    : "bg-white/[0.04] ring-white/10 hover:ring-white/20 hover:shadow-[0_36px_80px_-36px_rgba(0,0,0,0.95)]"
                )}
              >
                <div className="bezel-core flex h-full flex-col rounded-[1.4rem] panel p-7">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                    {tier.featured && (
                      <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">{p.popular}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{tier.desc}</p>
                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-4xl font-semibold tracking-tight text-white">{tier.price}</span>
                    <span className="text-sm text-zinc-500">/ {tier.period}</span>
                  </div>
                  <ul className="mt-7 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                        <Check weight="bold" className="h-4 w-4 shrink-0 text-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => choose(tier)}
                    disabled={loading === tier.plan}
                    className={cn(
                      "mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium transition-transform duration-200 ease-out active:scale-[0.98] disabled:opacity-70",
                      tier.featured
                        ? "bg-accent text-accent-foreground hover:brightness-105"
                        : "bg-white/5 text-white ring-1 ring-inset ring-white/15 hover:bg-white/10"
                    )}
                  >
                    {loading === tier.plan ? (
                      <CircleNotch weight="bold" className="h-4 w-4 animate-spin" />
                    ) : (
                      tier.cta
                    )}
                  </button>
                </div>
              </div>
            </BlurReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
