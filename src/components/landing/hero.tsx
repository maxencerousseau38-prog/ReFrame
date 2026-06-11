"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Globe, Sparkle, Lightning, ShieldCheck, Star } from "@phosphor-icons/react";
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
    <div className="relative mx-auto max-w-md pt-4 lg:max-w-none">
      <div className="pointer-events-none absolute -inset-10 -z-10 ambient-soft blur-[80px] opacity-70" />

      {/* BEFORE — Traditional Experience, light, set back */}
      <div className="absolute right-0 top-0 z-0 w-[62%] rotate-2 overflow-hidden rounded-xl bg-[#f3f1ec] shadow-xl ring-1 ring-black/10">
        <div className="flex items-center gap-1.5 border-b border-black/5 px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
        </div>
        <div className="p-4 text-[#2b2a27]">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Before</p>
          <h4 className="mt-1.5 font-serif text-[15px] font-semibold leading-tight">Traditional<br />Experience</h4>
          <div className="mt-2 space-y-1">
            <div className="h-1 w-full rounded bg-zinc-300" />
            <div className="h-1 w-2/3 rounded bg-zinc-300" />
          </div>
          <div
            className="mt-3 h-16 w-full rounded bg-cover bg-center grayscale"
            style={{ backgroundImage: "url(/brand/mountain.jpg)" }}
            role="img"
            aria-label="Mountain landscape"
          />
        </div>
      </div>

      {/* AFTER — Elevated Experience, dark + gold, prominent */}
      <div className="relative z-10 mt-20 w-[94%] overflow-hidden rounded-2xl border border-accent/25 bg-[#16140f] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-1.5 border-b border-white/8 px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-medium text-accent-foreground">
            <Sparkle weight="fill" className="h-2.5 w-2.5" /> Reframed by AI
          </span>
        </div>

        <div className="grid grid-cols-[1.05fr_0.95fr] gap-4 p-5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-accent">After</p>
            <h3 className="mt-2 text-[22px] font-semibold leading-[1.02] tracking-tight text-white">
              Elevated
              <br /> Experience
            </h3>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
              The same business, reframed into a site that converts.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-[11px] font-medium text-accent-foreground">
              Explore more <ArrowRight weight="bold" className="h-3 w-3" />
            </span>
          </div>
          {/* mountain visual, grayscale with a warm gold wash */}
          <div className="relative overflow-hidden rounded-xl">
            <div
              className="h-full min-h-[120px] w-full bg-cover bg-center grayscale"
              style={{ backgroundImage: "url(/brand/mountain.jpg)" }}
              role="img"
              aria-label="Mountain landscape"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#16140f] via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0 mix-blend-overlay bg-accent/25" />
          </div>
        </div>

        {/* feature row */}
        <div className="grid grid-cols-4 gap-px border-t border-white/8 bg-white/5">
          {[
            { icon: Sparkle, label: "Modern" },
            { icon: Lightning, label: "Faster" },
            { icon: ShieldCheck, label: "Trusted" },
            { icon: Star, label: "Premium" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1 bg-[#16140f] py-3">
              <f.icon weight="bold" className="h-3.5 w-3.5 text-accent" />
              <span className="text-[9px] text-zinc-400">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

