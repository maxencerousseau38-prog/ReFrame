"use client";

import Link from "next/link";
import { Check } from "@phosphor-icons/react";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    desc: "Rebuild your first site and see it for yourself.",
    features: ["1 site rebuild", "Full audit and analysis", "Basic AI editor", "siterevive.app address"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    desc: "For founders and freelancers shipping real sites.",
    features: ["Unlimited rebuilds", "Full AI editor", "Custom domain and SSL", "One-click publishing", "SEO tuning", "No SiteRevive branding"],
    cta: "Start trial",
    featured: true,
  },
  {
    name: "Studio",
    price: "$99",
    period: "per month",
    desc: "For agencies reviving client sites at volume.",
    features: ["Everything in Pro", "10 seats", "White-label exports", "Client workspaces", "Priority support", "API access"],
    cta: "Talk to sales",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1100px] px-6">
        <Reveal className="max-w-2xl">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Pricing that scales when you do.
          </h2>
          <p className="mt-4 text-zinc-400">Start free. Upgrade when you publish. Cancel anytime.</p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.08}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-7",
                  tier.featured ? "border-accent/40 bg-accent/[0.06]" : "border-white/10 bg-card"
                )}
              >
                {tier.featured && (
                  <span className="absolute right-6 top-7 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
                    Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
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

                <div className="mt-8 pt-2">
                  <Link href="/dashboard" className="block">
                    <Button className="w-full" variant={tier.featured ? "default" : "outline"}>
                      {tier.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
