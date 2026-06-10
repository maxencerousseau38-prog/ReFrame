"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MagnifyingGlass, MagicWand, RocketLaunch } from "@phosphor-icons/react";

const steps = [
  {
    n: "1",
    icon: MagnifyingGlass,
    title: "Analyze",
    body: "We crawl your site, detect your industry, and pull out your copy, images and structure.",
  },
  {
    n: "2",
    icon: MagicWand,
    title: "Rebuild",
    body: "A new design assembles from modular blocks chosen for your sector, not a random template.",
  },
  {
    n: "3",
    icon: RocketLaunch,
    title: "Edit and ship",
    body: "Refine anything by chatting, then publish to a fast global network in one click.",
  },
];

export function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section id="how" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Three steps from dated to done.
          </h2>
          <p className="mt-4 max-w-sm text-zinc-400">
            No designers, no developers, no months of back and forth.
          </p>
        </div>

        <ol className="relative">
          <span className="absolute left-[27px] top-2 bottom-2 w-px bg-white/10" aria-hidden />
          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex gap-6 pb-12 last:pb-0"
            >
              <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-card text-accent">
                <s.icon weight="bold" className="h-6 w-6" />
              </span>
              <div className="pt-1.5">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-sm text-zinc-600">{s.n}</span>
                  <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                </div>
                <p className="mt-2 max-w-md leading-relaxed text-zinc-400">{s.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
