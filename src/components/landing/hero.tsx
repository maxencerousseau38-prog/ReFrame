"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Globe } from "@phosphor-icons/react";
import { IslandButton } from "@/components/ui/island-button";

/**
 * Hero (spectaculaire, editorial). Monumental left-weighted headline with a
 * floating, depth-layered product card offset to the right and out of the grid.
 * Heavy negative space; one input, one CTA. No centered-SaaS cliche.
 */
export function Hero() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [url, setUrl] = React.useState("");
  const sectionRef = React.useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const cardRot = useTransform(scrollYProgress, [0, 1], [-4, -1]);

  function go(e?: React.FormEvent) {
    e?.preventDefault();
    if (!url.trim()) return;
    router.push(`/dashboard?url=${encodeURIComponent(url.trim().replace(/^https?:\/\//, ""))}`);
  }

  return (
    <section ref={sectionRef} className="relative min-h-[100dvh] overflow-hidden px-6 pt-40 pb-24">
      {/* depth: one soft top wash + ultra-faint grid, mostly negative space */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid bg-fade-b opacity-30" />
        <div className="absolute left-[-10%] top-[-15%] h-[680px] w-[680px] ambient-soft blur-[100px]" />
      </div>

      <div className="mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">
            Intelligence, applied to the web
          </span>

          {/* Monumental, tight, editorial */}
          <h1 className="mt-8 font-semibold tracking-[-0.04em] text-white [font-size:clamp(3rem,8.5vw,7rem)] [line-height:0.92]">
            Your website,
            <br />
            rebuilt by
            <span className="bg-gradient-to-r from-accent via-cyan-200 to-accent bg-clip-text text-transparent"> intelligence</span>.
          </h1>

          <p className="mt-8 max-w-md text-lg leading-relaxed text-zinc-400">
            Paste a link. ReFrame studies your site and reconstructs it into a
            faster, sharper version of itself.
          </p>

          <form
            onSubmit={go}
            className="mt-10 flex max-w-md flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur sm:flex-row sm:items-center sm:rounded-full sm:p-1.5"
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
              Reframe it
            </IslandButton>
          </form>
        </motion.div>

        {/* Floating, depth-layered product card, offset out of the grid */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 50, filter: "blur(16px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={reduce ? undefined : { y: cardY, rotate: cardRot }}
          className="relative lg:translate-x-8"
        >
          <FloatingPreview />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingPreview() {
  return (
    <div className="relative">
      {/* stacked shadow layers for soft depth */}
      <div className="absolute inset-x-6 -bottom-6 h-24 rounded-[2rem] bg-accent/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-zinc-900 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <div className="ml-3 rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-zinc-500">maisonlumen.com</div>
        </div>
        <div className="grid bg-white text-zinc-900 md:grid-cols-2">
          <div className="flex flex-col justify-center p-7">
            <span className="w-fit rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-medium text-cyan-700">Bakery and coffee</span>
            <h3 className="mt-3 text-2xl font-semibold leading-[1.05] tracking-tight">Bread worth the early alarm.</h3>
            <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">Stone-milled loaves, baked before the city wakes.</p>
            <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-[11px] font-medium text-white">
              Order ahead <ArrowRight weight="bold" className="h-3 w-3" />
            </span>
          </div>
          <div
            className="min-h-[200px] bg-cover bg-center"
            style={{ backgroundImage: "url(https://picsum.photos/seed/maison-lumen-bakery/700/800)" }}
            role="img"
            aria-label="Fresh bread"
          />
        </div>
      </div>
    </div>
  );
}
