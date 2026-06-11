"use client";

import Link from "next/link";
import { Check } from "@phosphor-icons/react";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Transform your first site and see it for yourself.",
    features: ["1 transformation", "Full AI analysis", "Basic AI editor", "Download as HTML"],
    cta: "Transform a site",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    desc: "For founders and freelancers shipping real sites.",
    features: ["Unlimited transformations", "Full AI editor", "Custom domain and SSL", "One-click publishing", "SEO tuning", "No ReFrame branding"],
    cta: "Start trial",
    featured: true,
  },
  {
    name: "Studio",
    price: "$99",
    period: "per month",
    desc: "For agencies reframing client sites at volume.",
    features: ["Everything in Pro", "10 seats", "White-label exports", "Client workspaces", "Priority support", "API access"],
    cta: "Talk to sales",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-32">
      <div className="mx-auto max-w-[1100px]">
        <BlurReveal className="max-w-2xl">
          <h2 className="font-semibold leading-[1.02] tracking-[-0.03em] text-white [font-size:clamp(2.25rem,5.5vw,4rem)]">
            Pricing that scales when you do.
          </h2>
          <p className="mt-4 text-zinc-400">Start free. Upgrade when you publish. Cancel anytime.</p>
        </BlurReveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <BlurReveal key={tier.name} delay={i * 0.08}>
              <div
                className={cn(
                  "h-full rounded-[1.75rem] p-1.5 ring-1 ring-inset",
                  tier.featured ? "bg-accent/10 ring-accent/30" : "bg-white/[0.04] ring-white/10"
                )}
              >
                <div className="bezel-core flex h-full flex-col rounded-[1.4rem] bg-card p-7">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                    {tier.featured && (
                      <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">Popular</span>
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
                  <Link
                    href="/dashboard"
                    className={cn(
                      "mt-8 inline-flex h-11 items-center justify-center rounded-full text-sm font-medium transition-transform duration-200 ease-out active:scale-[0.98]",
                      tier.featured
                        ? "bg-accent text-accent-foreground hover:brightness-105"
                        : "bg-white/5 text-white ring-1 ring-inset ring-white/15 hover:bg-white/10"
                    )}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            </BlurReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
