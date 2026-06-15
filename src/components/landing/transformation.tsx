"use client";

import * as React from "react";
import { motion, useReducedMotion, useTransform, useMotionValue, animate } from "framer-motion";
import { ArrowRight, Lightning, ShieldCheck, Star, Sparkle } from "@phosphor-icons/react";
import { BrowserFrame } from "@/components/ui/browser-frame";

/**
 * Standalone transformation section: one large browser comparing the SAME
 * business like-for-like, with a luminous seam that auto-sweeps on a loop to
 * reveal the dated site becoming the Reframed one. No drag, no scroll hijack —
 * it plays itself. Reduced-motion shows the finished "after".
 */
export function Transformation() {
  const reduce = useReducedMotion();
  const seam = useMotionValue(reduce ? 100 : 50);

  React.useEffect(() => {
    if (reduce) {
      seam.set(100);
      return;
    }
    const controls = animate(seam, [18, 82, 18], {
      duration: 10,
      ease: [0.65, 0, 0.35, 1],
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [reduce, seam]);

  const afterClip = useTransform(seam, (v) => `inset(0px ${100 - v}% 0px 0px)`);
  const seamLeft = useTransform(seam, (v) => `${v}%`);

  return (
    <section id="transformation" className="px-6 py-32 sm:py-40">
      <div className="mx-auto max-w-[1140px]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 max-w-3xl"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">See the transformation</p>
          <h2 className="mt-4 font-semibold tracking-[-0.03em] text-white [font-size:clamp(2.25rem,5.5vw,4rem)] [line-height:0.98]">
            The same business.
            <br /> Customers who don&apos;t hesitate.
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            Watch the seam sweep: on one side, the page quietly turning customers
            away; on the other, the one they trust before they&apos;ve even scrolled.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="pointer-events-none absolute -inset-16 -z-10 ambient-soft blur-[110px] opacity-60" />
          <BrowserFrame url="brightside.com → reframe.site/brightside" className="border-accent/20">
            <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9]">
              {/* BEFORE — dated, light, serif (base) */}
              <div className="absolute inset-0 bg-[#efece4] text-[#2b2a27]">
                <div className="flex items-center justify-between border-b border-black/10 px-8 py-5 sm:px-12">
                  <span className="font-serif text-lg font-bold tracking-tight sm:text-xl">Brightside Plumbing</span>
                  <span className="hidden gap-5 font-serif text-[13px] underline underline-offset-2 sm:flex">
                    <span>Home</span><span>Services</span><span>Contact</span>
                  </span>
                </div>
                <div className="px-8 pt-10 sm:px-12">
                  <h4 className="font-serif font-bold leading-tight text-[#3a3935] [font-size:clamp(1.6rem,4vw,2.6rem)]">
                    Welcome to Our<br />Plumbing Website
                  </h4>
                  <div className="mt-6 space-y-3">
                    <div className="h-2.5 w-3/4 rounded bg-[#cfccc2]" />
                    <div className="h-2.5 w-2/3 rounded bg-[#cfccc2]" />
                    <div className="h-2.5 w-1/2 rounded bg-[#cfccc2]" />
                  </div>
                  <span className="mt-7 inline-block rounded border border-[#3a3935]/40 px-5 py-2 font-serif text-sm">
                    Contact Us
                  </span>
                </div>
                <span className="absolute bottom-5 left-8 font-mono text-[11px] uppercase tracking-[0.2em] text-[#9a968a] sm:left-12">Before</span>
              </div>

              {/* AFTER — modern, dark, lime (revealed by the seam) */}
              <motion.div className="absolute inset-0 bg-[#0e0e10]" style={{ clipPath: afterClip }}>
                <div className="flex items-center justify-between border-b border-white/8 px-8 py-5 sm:px-12">
                  <span className="flex items-center gap-2.5 text-[15px] font-semibold text-white sm:text-base">
                    <span className="h-6 w-6 rounded-md bg-accent" /> Brightside
                  </span>
                  <span className="hidden gap-5 text-[13px] text-zinc-400 sm:flex">
                    <span>Work</span><span>Pricing</span><span>Contact</span>
                  </span>
                </div>
                <div className="px-8 pt-10 sm:px-12">
                  <h3 className="max-w-[15ch] font-semibold leading-[1.03] tracking-tight text-white [font-size:clamp(1.8rem,4.4vw,3.1rem)]">
                    Plumbing done right, the first time.
                  </h3>
                  <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
                    Upfront pricing, work guaranteed in writing, 24/7 for the ones
                    that cannot wait.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground">
                    Get a free quote <ArrowRight weight="bold" className="h-4 w-4" />
                  </span>
                  <div className="mt-7 flex max-w-md flex-wrap gap-2.5">
                    {[
                      { icon: Lightning, label: "Same day" },
                      { icon: ShieldCheck, label: "Guaranteed" },
                      { icon: Star, label: "4.9 ★ rated" },
                    ].map((f) => (
                      <div key={f.label} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
                        <f.icon weight="bold" className="h-4 w-4 shrink-0 text-accent" />
                        <span className="text-[12px] text-zinc-300">{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <span className="absolute bottom-5 right-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-accent sm:right-12">
                  <Sparkle weight="fill" className="h-3 w-3" /> After
                </span>
              </motion.div>

              {/* luminous seam + handle */}
              <motion.div className="pointer-events-none absolute inset-y-0 z-20 w-px bg-accent shadow-[0_0_30px_5px_rgba(159,222,63,0.45)]" style={{ left: seamLeft }}>
                <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/50 bg-[#0e0e10]/80 backdrop-blur">
                  <ArrowRight weight="bold" className="h-4 w-4 text-accent" />
                </span>
              </motion.div>
            </div>
          </BrowserFrame>
        </motion.div>
      </div>
    </section>
  );
}
