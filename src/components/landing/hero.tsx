"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  animate,
} from "framer-motion";
import { ArrowRight, Globe, Sparkle, Lightning, ShieldCheck, Star } from "@phosphor-icons/react";
import { IslandButton } from "@/components/ui/island-button";
import { BrowserFrame } from "@/components/ui/browser-frame";

/**
 * Hero. Monumental, high-contrast, minimal. The promise is unmistakable in
 * under three seconds: paste your link, your existing site is transformed.
 * The right side is a literal before -> after of one real site, not a template.
 */
export function Hero() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [url, setUrl] = React.useState("");
  const sectionRef = React.useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);

  function go(e?: React.FormEvent) {
    e?.preventDefault();
    if (!url.trim()) return;
    router.push(`/dashboard?url=${encodeURIComponent(url.trim().replace(/^https?:\/\//, ""))}`);
  }

  return (
    <section ref={sectionRef} className="relative min-h-[100dvh] overflow-hidden px-6 pt-36 pb-24 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid bg-fade-b opacity-30" />
        <div className="absolute left-[-10%] top-[-12%] h-[640px] w-[640px] ambient-soft blur-[100px]" />
      </div>

      <div className="mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 22, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">
            Website transformation engine
          </span>

          <h1 className="mt-8 font-semibold tracking-[-0.04em] text-white [font-size:clamp(2.9rem,8vw,6.5rem)] [line-height:0.94]">
            Your website,
            <br />
            rebuilt by
            <br />
            <span className="text-accent">intelligence.</span>
          </h1>

          <p className="mt-7 max-w-md text-lg leading-relaxed text-zinc-400">
            Paste your link. ReFrame analyzes your existing site and rebuilds it
            into a faster, modern version. No builder, no blank page.
          </p>

          <form
            onSubmit={go}
            className="mt-9 flex max-w-md flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur sm:flex-row sm:items-center sm:rounded-full sm:p-1.5"
          >
            <label htmlFor="hero-url" className="sr-only">Your website URL</label>
            <div className="relative flex-1">
              <Globe weight="bold" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500" />
              <input
                id="hero-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourwebsite.com"
                className="h-11 w-full rounded-full bg-transparent pl-11 pr-3 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
            <IslandButton onClick={() => go()} variant="accent" className="shrink-0">
              Transform my website
            </IslandButton>
          </form>
          <p className="mt-4 text-[13px] text-zinc-500">Free first transformation. No credit card.</p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 50, filter: "blur(16px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={reduce ? undefined : { y }}
          className="relative"
        >
          <HeroTransform />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * The hero centerpiece: one browser, the SAME business, with a luminous seam
 * that auto-sweeps to reveal the dated site morphing into the Reframed one.
 * Comparing like-for-like in place is the whole pitch in a single glance.
 */
function HeroTransform() {
  const reduce = useReducedMotion();
  const seam = useMotionValue(reduce ? 100 : 50);

  React.useEffect(() => {
    if (reduce) {
      seam.set(100);
      return;
    }
    const controls = animate(seam, [20, 80, 20], {
      duration: 9,
      ease: [0.65, 0, 0.35, 1],
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [reduce, seam]);

  const afterClip = useTransform(seam, (v) => `inset(0px ${100 - v}% 0px 0px)`);
  const beforeDim = useTransform(seam, (v) => Math.max(0, (v - 30) / 140)); // dim "before" as after takes over
  const seamLeft = useTransform(seam, (v) => `${v}%`);

  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto lg:max-w-[580px]">
      <div className="pointer-events-none absolute -inset-12 -z-10 ambient-soft blur-[90px] opacity-70" />

      <BrowserFrame url="brightside.com → reframe.site/brightside" className="border-accent/20">
        <div className="relative h-[340px] overflow-hidden sm:h-[400px]">
          {/* BEFORE — dated, light, serif (the base layer) */}
          <div className="absolute inset-0 bg-[#efece4] text-[#2b2a27]">
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
              <span className="font-serif text-[15px] font-bold tracking-tight">Brightside Plumbing</span>
              <span className="hidden gap-4 font-serif text-[11px] underline underline-offset-2 sm:flex">
                <span>Home</span><span>Services</span><span>Contact</span>
              </span>
            </div>
            <div className="px-6 pt-7">
              <h4 className="font-serif text-[26px] font-bold leading-tight text-[#3a3935]">
                Welcome to Our<br />Plumbing Website
              </h4>
              <div className="mt-4 space-y-2">
                <div className="h-2 w-3/4 rounded bg-[#cfccc2]" />
                <div className="h-2 w-2/3 rounded bg-[#cfccc2]" />
                <div className="h-2 w-1/2 rounded bg-[#cfccc2]" />
              </div>
              <span className="mt-5 inline-block rounded border border-[#3a3935]/40 px-4 py-1.5 font-serif text-[12px]">
                Contact Us
              </span>
              <div className="mt-5 h-24 w-full rounded bg-[#d8d4c8]" />
            </div>
            <span className="absolute bottom-3 left-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9a968a]">Before</span>
          </div>
          <motion.div className="absolute inset-0 bg-black" style={{ opacity: beforeDim }} />

          {/* AFTER — modern, dark, lime (revealed by the seam) */}
          <motion.div className="absolute inset-0 bg-[#0e0e10]" style={{ clipPath: afterClip }}>
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <span className="flex items-center gap-2 text-[14px] font-semibold text-white">
                <span className="h-5 w-5 rounded-md bg-accent" /> Brightside
              </span>
              <span className="hidden gap-4 text-[11px] text-zinc-400 sm:flex">
                <span>Work</span><span>Pricing</span><span>Contact</span>
              </span>
            </div>
            <div className="px-6 pt-7">
              <h3 className="max-w-[15ch] text-[28px] font-semibold leading-[1.04] tracking-tight text-white">
                Plumbing done right, the first time.
              </h3>
              <p className="mt-3 max-w-[32ch] text-[12px] leading-relaxed text-zinc-400">
                Upfront pricing, work guaranteed in writing, 24/7 for the ones
                that cannot wait.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[12px] font-medium text-accent-foreground">
                Get a free quote <ArrowRight weight="bold" className="h-3.5 w-3.5" />
              </span>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { icon: Lightning, label: "Same day" },
                  { icon: ShieldCheck, label: "Guaranteed" },
                  { icon: Star, label: "4.9 ★ rated" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2">
                    <f.icon weight="bold" className="h-3.5 w-3.5 shrink-0 text-accent" />
                    <span className="truncate text-[10px] text-zinc-300">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <span className="absolute bottom-3 right-6 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              <Sparkle weight="fill" className="h-2.5 w-2.5" /> After
            </span>
          </motion.div>

          {/* luminous seam + handle */}
          <motion.div className="pointer-events-none absolute inset-y-0 z-20 w-px bg-accent shadow-[0_0_24px_4px_rgba(159,222,63,0.45)]" style={{ left: seamLeft }}>
            <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/50 bg-[#0e0e10]/80 backdrop-blur">
              <ArrowRight weight="bold" className="h-3.5 w-3.5 text-accent" />
            </span>
          </motion.div>
        </div>
      </BrowserFrame>
    </div>
  );
}

