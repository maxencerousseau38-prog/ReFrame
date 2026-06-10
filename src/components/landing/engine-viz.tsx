"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Eye, Brain, SquaresFour, RocketLaunch } from "@phosphor-icons/react";
import { BlurReveal } from "@/components/ui/blur-reveal";

const stages = [
  { icon: Eye, label: "Read", body: "Crawl the live site: copy, media, structure, brand." },
  { icon: Brain, label: "Understand", body: "Infer the sector, the intent and what converts." },
  { icon: SquaresFour, label: "Compose", body: "Assemble vetted blocks into a coherent system." },
  { icon: RocketLaunch, label: "Ship", body: "Render a fast, editable site, ready to publish." },
];

export function EngineViz() {
  const reduce = useReducedMotion();
  return (
    <section id="engine" className="relative overflow-hidden px-6 py-40">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[460px] w-[900px] -translate-x-1/2 -translate-y-1/2 ambient blur-[110px] opacity-60" />

      <div className="mx-auto max-w-[1200px]">
        <BlurReveal className="mx-auto mb-20 max-w-3xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">The engine</p>
          <h2 className="mt-4 font-semibold tracking-[-0.03em] text-white [font-size:clamp(2.25rem,5.5vw,4rem)] [line-height:0.98]">
            It understands your site
            <br /> before it rebuilds it.
          </h2>
        </BlurReveal>

        <div className="relative">
          {/* connecting rail with a travelling pulse */}
          <div className="absolute left-0 right-0 top-[34px] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block">
            {!reduce && (
              <motion.span
                className="absolute top-1/2 h-1.5 w-24 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent blur-[1px]"
                animate={{ left: ["-10%", "100%"] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>

          <div className="grid gap-10 lg:grid-cols-4 lg:gap-6">
            {stages.map((s, i) => (
              <BlurReveal key={s.label} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                  <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
                    <div className="bezel-core flex h-full w-full items-center justify-center rounded-2xl bg-card text-accent">
                      <s.icon weight="bold" className="h-7 w-7" />
                    </div>
                  </div>
                  <span className="mt-6 font-mono text-xs text-zinc-600">0{i + 1}</span>
                  <h3 className="mt-1 text-xl font-semibold text-white">{s.label}</h3>
                  <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-zinc-400">{s.body}</p>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
