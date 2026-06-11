"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Globe, Sparkle } from "@phosphor-icons/react";
import { IslandButton } from "@/components/ui/island-button";

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

/** Two stacked frames: the old site and the Reframed-by-AI result. */
function HeroTransform() {
  return (
    <div className="relative mx-auto max-w-md pt-6 lg:max-w-none">
      <div className="pointer-events-none absolute -inset-10 -z-10 ambient-soft blur-[70px] opacity-70" />

      {/* BEFORE — set back, top-right */}
      <div className="absolute right-0 top-0 z-0 w-[60%] rotate-3 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 opacity-90 shadow-xl">
        <div className="flex items-center gap-1.5 px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
          <span className="ml-1.5 font-mono text-[9px] text-zinc-600">hartleyandsons.co.uk</span>
          <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[8px] font-medium text-zinc-400">Before</span>
        </div>
        <div className="bg-[#eceae3] p-3 font-serif text-[#2b2b2b] grayscale">
          <div className="mb-1.5 flex items-center justify-between border-b border-[#9a9a8e] pb-1">
            <span className="text-[9px] font-bold text-[#1f4e79]">HARTLEY &amp; SONS</span>
            <span className="text-[7px] text-[#1f4e79] underline">Home · Contact</span>
          </div>
          <div className="mb-1.5 h-9 w-full bg-[#c9c7bb]" />
          <div className="text-[8px] font-bold">Welcome to our website</div>
          <div className="mt-1 h-1 w-3/4 bg-[#cfcdc2]" />
        </div>
      </div>

      {/* AFTER — Reframed by AI, prominent, front */}
      <div className="relative z-10 mt-16 w-[94%] overflow-hidden rounded-2xl border border-white/12 bg-zinc-900 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.85)]">
        <div className="flex items-center gap-1.5 border-b border-white/8 px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="ml-2 rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-500">hartleyandsons.co.uk</span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-medium text-accent-foreground">
            <Sparkle weight="fill" className="h-2.5 w-2.5" /> Reframed by AI
          </span>
        </div>
        <div className="relative overflow-hidden bg-white px-6 py-7 text-zinc-900">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl from-amber-100 via-white to-white" />
          <div className="relative">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
              <span className="h-4 w-4 rounded bg-zinc-900" /> Hartley &amp; Sons
            </span>
            <h3 className="mt-4 max-w-[14ch] text-[26px] font-semibold leading-[0.98] tracking-tight">
              Plumbing done right, the first time.
            </h3>
            <p className="mt-2 max-w-[28ch] text-[12px] leading-relaxed text-zinc-500">
              Upfront pricing, on-time arrival, guaranteed work.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-zinc-900 px-3.5 py-1.5 text-[11px] font-medium text-white">Get a free quote</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-3.5 py-1.5 text-[11px] font-medium text-zinc-700">
                Our work <ArrowRight weight="bold" className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

