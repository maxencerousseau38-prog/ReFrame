"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Eye, Brain, SquaresFour, RocketLaunch, ArrowRight } from "@phosphor-icons/react";
import { BrowserFrame } from "@/components/ui/browser-frame";
import { useI18n } from "@/lib/i18n";

/**
 * The engine, dramatized — without hijacking the scroll.
 *
 * A single browser auto-plays through the four pipeline phases (Read,
 * Understand, Compose, Ship) on a loop; the step rail fills in sync and any
 * step can be clicked to jump. The section sits in normal flow and simply
 * reveals on view. Reduced-motion shows the shipped state and stops the loop.
 */

const ICONS = [Eye, Brain, SquaresFour, RocketLaunch];
const PHASE_MS = 3000;

export function TransformScroll() {
  const reduce = useReducedMotion();
  const { t } = useI18n();
  const STEPS = t.engine.steps.map((s, i) => ({ ...s, icon: ICONS[i] }));
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (reduce) {
      setActive(3);
      return;
    }
    if (paused) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % ICONS.length), PHASE_MS);
    return () => window.clearInterval(id);
  }, [reduce, paused]);

  return (
    <section className="relative px-6 py-28 sm:py-36">
      <div className="mx-auto grid w-full max-w-[1300px] items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left rail */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
              {t.engine.badge}
            </span>
            <h2 className="mt-5 max-w-md font-semibold leading-[1.02] tracking-[-0.03em] text-white [font-size:clamp(2.1rem,4.6vw,3.5rem)]">
              {t.engine.title}
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-zinc-400">
              {t.engine.sub}
            </p>
          </motion.div>

          <div
            className="mt-12 flex flex-col gap-2"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {STEPS.map((s, i) => {
              const isActive = i === active;
              return (
                <button
                  key={s.label}
                  onClick={() => setActive(i)}
                  className={`group relative flex items-start gap-4 rounded-2xl border p-4 text-left transition-colors duration-300 ${
                    isActive ? "border-white/10 bg-white/[0.04]" : "border-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  {/* progress bar (fills over the phase when active) */}
                  <span className="absolute inset-x-4 bottom-0 h-px overflow-hidden rounded-full bg-white/8">
                    {isActive && !reduce && (
                      <motion.span
                        key={active}
                        className="block h-full bg-accent"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: paused ? 0.001 : 1 }}
                        transition={{ duration: paused ? 0 : PHASE_MS / 1000, ease: "linear" }}
                        style={{ transformOrigin: "left" }}
                      />
                    )}
                  </span>

                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${
                      isActive
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-white/10 bg-white/5 text-zinc-500"
                    }`}
                  >
                    <s.icon weight="bold" className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <h3 className={`text-[15px] font-semibold transition-colors ${isActive ? "text-white" : "text-zinc-300"}`}>
                      <span className="mr-2 font-mono text-[11px] text-accent/70">0{i + 1}</span>
                      {s.label}
                    </h3>
                    <p className="mt-1 max-w-xs text-sm leading-relaxed text-zinc-400">{s.body}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: one browser, four cross-faded states */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="pointer-events-none absolute -inset-12 -z-10 ambient-soft blur-[90px] opacity-60" />
          <BrowserFrame url="reframe.site/yourbusiness">
            <div className="relative h-[440px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Phase index={active} />
                </motion.div>
              </AnimatePresence>
            </div>
          </BrowserFrame>
        </motion.div>
      </div>
    </section>
  );
}

function Phase({ index }: { index: number }) {
  if (index === 0) return <ReadState />;
  if (index === 1) return <UnderstandState />;
  if (index === 2) return <ComposeState />;
  return <ShipState />;
}

/** 0 — Read: wireframe under a sweeping lime scan. */
function ReadState() {
  const reduce = useReducedMotion();
  return (
    <div className="absolute inset-0 p-6">
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-accent/0 via-accent/25 to-accent/0"
          initial={{ y: -120 }}
          animate={{ y: 460 }}
          transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
        />
      )}
      <div className="space-y-3 opacity-50">
        <div className="h-5 w-1/3 rounded bg-zinc-700" />
        <div className="h-24 w-full rounded-lg bg-zinc-800" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 rounded bg-zinc-800" />
          <div className="h-16 rounded bg-zinc-800" />
          <div className="h-16 rounded bg-zinc-800" />
        </div>
        <div className="h-3 w-2/3 rounded bg-zinc-800" />
        <div className="h-3 w-1/2 rounded bg-zinc-800" />
      </div>
    </div>
  );
}

/** 1 — Understand: tags label the detected sections. */
function UnderstandState() {
  const tags = [
    { t: "Hero", top: "16%", left: "12%" },
    { t: "Services", top: "52%", left: "16%" },
    { t: "Reviews", top: "52%", left: "58%" },
    { t: "Contact", top: "78%", left: "40%" },
  ];
  return (
    <div className="absolute inset-0 p-6">
      <div className="space-y-3 opacity-30">
        <div className="h-5 w-1/3 rounded bg-zinc-700" />
        <div className="h-24 w-full rounded-lg bg-zinc-800" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 rounded bg-zinc-800" />
          <div className="h-16 rounded bg-zinc-800" />
          <div className="h-16 rounded bg-zinc-800" />
        </div>
      </div>
      {tags.map((tag, i) => (
        <motion.span
          key={tag.t}
          className="absolute rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent backdrop-blur"
          style={{ top: tag.top, left: tag.left }}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1 + i * 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {tag.t}
        </motion.span>
      ))}
    </div>
  );
}

/** 2 — Compose: vetted blocks assemble into a grid. */
function ComposeState() {
  const blocks = [
    "col-span-6 row-span-2 border-white/10 bg-white/[0.04]",
    "col-span-4 row-span-3 border-white/10 bg-white/[0.04]",
    "col-span-2 row-span-3 border-accent/30 bg-accent/[0.06]",
    "col-span-3 row-span-1 border-white/10 bg-white/[0.04]",
    "col-span-3 row-span-1 border-white/10 bg-white/[0.04]",
  ];
  return (
    <div className="absolute inset-0 p-6">
      <div className="grid h-full grid-cols-6 grid-rows-6 gap-3">
        {blocks.map((b, i) => (
          <motion.div
            key={i}
            className={`rounded-lg border ${b}`}
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.08 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
    </div>
  );
}

/** 3 — Ship: the polished, live result. */
function ShipState() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      initial={{ scale: 0.97 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between px-6 pt-6">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-white">
          <span className="h-5 w-5 rounded-md bg-accent" /> Brightside
        </span>
        <span className="hidden gap-4 text-[11px] text-zinc-400 sm:flex">
          <span>Work</span>
          <span>Pricing</span>
          <span>Contact</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center px-6">
        <h4 className="max-w-[16ch] text-[26px] font-semibold leading-[1.05] tracking-tight text-white">
          Plumbing done right, the first time.
        </h4>
        <p className="mt-2 max-w-[34ch] text-[12px] leading-relaxed text-zinc-400">
          Upfront pricing, work guaranteed in writing, 24/7 for the ones that
          cannot wait.
        </p>
        <span className="mt-5 inline-flex w-max items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[12px] font-medium text-accent-foreground">
          Get a free quote <ArrowRight weight="bold" className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mx-6 mb-6 h-20 rounded-lg bg-gradient-to-r from-white/[0.06] to-accent/[0.08] ring-1 ring-white/10" />
    </motion.div>
  );
}
