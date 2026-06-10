"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "/forever",
    desc: "Revive your first site and see the magic.",
    features: ["1 site redesign", "AI analysis & audit", "Basic AI editor", "siterevive.app subdomain"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    desc: "For founders and freelancers shipping real sites.",
    features: ["Unlimited redesigns", "Full AI editor", "Custom domain + SSL", "Instant edge publishing", "SEO optimization", "Remove branding"],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Agency",
    price: "$99",
    period: "/month",
    desc: "For studios reviving sites at scale.",
    features: ["Everything in Pro", "10 team seats", "White-label exports", "Client workspaces", "Priority support", "API access"],
    cta: "Talk to sales",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            Pricing
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Simple pricing that scales with you
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Start free. Upgrade when you publish. Cancel anytime.
          </p>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.08}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-8 transition-all",
                  tier.featured
                    ? "gradient-border border-white/10 bg-white/[0.04]"
                    : "border-white/8 bg-white/[0.02] hover:border-white/15"
                )}
              >
                {tier.featured && (
                  <>
                    <div className="pointer-events-none absolute -inset-px -z-10 rounded-2xl opacity-60 blur-2xl glow" />
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[linear-gradient(110deg,#6366f1,#d946ef)] px-3 py-1 text-xs font-medium text-white shadow-lg shadow-violet-600/30">
                      Most popular
                    </span>
                  </>
                )}
                <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                <p className="mt-1 text-sm text-neutral-400">{tier.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-white">{tier.price}</span>
                  <span className="text-sm text-neutral-500">{tier.period}</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-neutral-300">
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full",
                          tier.featured ? "bg-violet-500/20 text-violet-300" : "bg-white/8 text-neutral-300"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-2">
                  <Link href="/dashboard" className="block">
                    <Button className="w-full" variant={tier.featured ? "gradient" : "outline"}>
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
