"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Globe, ArrowDown } from "@phosphor-icons/react";
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
            Your old website,
            <br />
            <span className="text-accent">transformed</span> by AI.
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

/** A literal before -> after of one real site. */
function HeroTransform() {
  return (
    <div className="relative mx-auto max-w-md lg:max-w-none">
      <div className="pointer-events-none absolute -inset-10 -z-10 ambient-soft blur-[70px] opacity-60" />

      {/* BEFORE — dated, small, set back */}
      <div className="ml-auto w-[72%] -rotate-2 overflow-hidden rounded-xl border border-white/10 opacity-70 grayscale">
        <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-zinc-700" />
          <span className="h-2 w-2 rounded-full bg-zinc-700" />
          <span className="ml-2 font-mono text-[10px] text-zinc-600">hartleyandsons.co.uk</span>
        </div>
        <div className="bg-[#eceae3] p-4 font-serif text-[#2b2b2b]">
          <div className="mb-2 flex items-center justify-between border-b border-[#9a9a8e] pb-1.5">
            <span className="text-[11px] font-bold text-[#1f4e79]">HARTLEY &amp; SONS</span>
            <span className="text-[8px] text-[#1f4e79] underline">Home · Contact</span>
          </div>
          <div className="mb-2 h-12 w-full bg-[#c9c7bb]" />
          <div className="text-[10px] font-bold">Welcome to our website</div>
          <div className="mt-1 h-1.5 w-3/4 bg-[#cfcdc2]" />
          <div className="mt-1 h-1.5 w-2/3 bg-[#cfcdc2]" />
        </div>
      </div>

      {/* transform indicator */}
      <div className="relative z-10 mx-auto -my-4 flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-background px-3.5 py-1.5 text-xs font-medium text-accent shadow-lg">
        <ArrowDown weight="bold" className="h-3.5 w-3.5" />
        Reframed by AI
      </div>

      {/* AFTER — modern, front, full */}
      <div className="relative z-0 mt-[-1.25rem] w-[92%] overflow-hidden rounded-2xl border border-white/12 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.85)]">
        <div className="flex items-center gap-1.5 border-b border-white/8 bg-zinc-900 px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="ml-2 rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-500">hartleyandsons.co.uk</span>
        </div>
        <div className="relative overflow-hidden bg-white px-6 py-7 text-zinc-900">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl from-cyan-100 via-white to-white" />
          <div className="relative">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
              <span className="h-4 w-4 rounded bg-zinc-900" /> Hartley &amp; Sons
            </span>
            <h3 className="mt-4 max-w-[14ch] text-[26px] font-semibold leading-[0.98] tracking-tight">
              Plumbing done right, the first time.
            </h3>
            <p className="mt-2 max-w-[26ch] text-[12px] leading-relaxed text-zinc-500">
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
