"use client";

import * as React from "react";
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

/** Card that tracks the cursor to reveal a soft radial spotlight. */
function FeatureCard({ f }: { f: (typeof features)[number] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0, on: false });

  function onMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, on: true });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos((p) => ({ ...p, on: false }))}
      className="group relative h-full overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] p-8 transition-colors hover:border-white/15"
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity: pos.on ? 1 : 0,
          background: `radial-gradient(220px circle at ${pos.x}px ${pos.y}px, rgba(139,92,246,0.12), transparent 70%)`,
        }}
      />
      <div className="relative">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-violet-300 transition-colors group-hover:border-violet-400/40 group-hover:text-violet-200">
          <f.icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-white">{f.title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-400">{f.desc}</p>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            Features
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Everything you need to ship a better site
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            One platform from analysis to publish — no stack to assemble.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <FeatureCard f={f} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
