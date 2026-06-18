"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LinkSimple, Brain, Sparkle } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";

const ICONS = [LinkSimple, Brain, Sparkle];

export function HowItWorks() {
  const reduce = useReducedMotion();
  const { t } = useI18n();
  const steps = t.how.steps.map((s, i) => ({ ...s, icon: ICONS[i], n: `0${i + 1}` }));
  return (
    <section id="how" className="px-6 py-32">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="max-w-2xl font-semibold leading-[1.02] tracking-[-0.03em] text-white [font-size:clamp(2.25rem,5.5vw,4rem)]">
          {t.how.title}
        </h2>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[1.75rem] bg-white/[0.04] p-1.5 ring-1 ring-inset ring-white/10"
            >
              <div className="bezel-core h-full rounded-[1.4rem] panel p-7">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
                    <s.icon weight="bold" className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-sm text-zinc-600">{s.n}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
