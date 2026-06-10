"use client";

import {
  ScanSearch,
  Palette,
  MessageSquareText,
  Gauge,
  Globe2,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const features = [
  {
    icon: ScanSearch,
    title: "AI site analysis",
    desc: "We crawl your site, detect your sector, extract copy, media and structure, then audit SEO and performance.",
  },
  {
    icon: Palette,
    title: "Premium redesign",
    desc: "A coherent design system is assembled from modular blocks — typography, spacing and motion tuned for your brand.",
  },
  {
    icon: MessageSquareText,
    title: "AI editor",
    desc: "Change anything in plain English. “Make it more premium”, “add an FAQ”, “improve conversion” — done in seconds.",
  },
  {
    icon: Gauge,
    title: "Built to convert",
    desc: "Clear hierarchy, persuasive CTAs and proven layouts engineered to turn visitors into customers.",
  },
  {
    icon: Globe2,
    title: "Instant deployment",
    desc: "Publish to a global edge network with one click. Custom domains, SSL and analytics included.",
  },
  {
    icon: ShieldCheck,
    title: "SEO & accessible",
    desc: "Semantic markup, fast Core Web Vitals and accessibility baked in from the first render.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border py-24 sm:py-32">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-600">
            Features
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Everything you need to ship a better site
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            One platform from analysis to publish — no stack to assemble.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div className="group h-full bg-card p-8 transition-colors hover:bg-secondary/40">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-all group-hover:border-violet-200 group-hover:text-violet-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
