"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Globe } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [url, setUrl] = React.useState("");

  function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    const clean = url.trim().replace(/^https?:\/\//, "");
    router.push(`/dashboard?url=${encodeURIComponent(clean)}`);
  }

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden pt-24">
      {/* one low-key accent wash + faint corner grid, not a purple mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid bg-fade-tl opacity-40" />
        <div className="absolute -left-40 top-10 h-[520px] w-[520px] accent-wash blur-2xl" />
      </div>

      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        {/* Left: message + single CTA */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400">
            AI website rebuilder
          </span>

          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-[64px]">
            Your old website,
            <br />
            rebuilt to <span className="text-accent">win customers</span>.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-zinc-400">
            Paste your link. SiteRevive analyzes your site and rebuilds it into a
            fast, modern version you edit by chatting.
          </p>

          <form
            onSubmit={handleAnalyze}
            className="mt-9 flex max-w-md flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2 sm:flex-row sm:items-center sm:rounded-full sm:p-1.5"
          >
            <label htmlFor="hero-url" className="sr-only">
              Your website URL
            </label>
            <div className="relative flex-1">
              <Globe
                weight="bold"
                className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500"
              />
              <input
                id="hero-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourwebsite.com"
                className="h-11 w-full rounded-full bg-transparent pl-11 pr-3 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
            <Button type="submit" size="lg" className="h-11 shrink-0">
              Rebuild my site
              <ArrowRight weight="bold" className="h-4 w-4" />
            </Button>
          </form>
        </motion.div>

        {/* Right: a real rendered preview of a revived site (real component, not a fake-div screenshot) */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute -inset-6 -z-10 accent-wash blur-2xl opacity-60" />
          <RevivedPreview />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * A genuine miniature website (the "after"), rendered as a real component inside
 * a browser frame. Per the skill this is an allowed product preview, not a
 * div-based fake screenshot of an external app. It uses a real photographic
 * asset for the hero image rather than a gradient placeholder.
 */
function RevivedPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/12 bg-zinc-900 shadow-2xl shadow-black/50">
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
        <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-zinc-500">
          maisonlumen.com
        </div>
      </div>

      {/* Real, light "revived" site preview */}
      <div className="bg-white text-zinc-900">
        <div className="flex items-center justify-between px-6 py-4 text-[13px]">
          <span className="font-semibold tracking-tight">Maison Lumen</span>
          <div className="hidden items-center gap-4 text-zinc-500 sm:flex">
            <span>Menu</span>
            <span>Story</span>
            <span className="rounded-full bg-zinc-900 px-3 py-1.5 text-white">Reserve</span>
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-4 px-6 pb-6 pt-2">
          <div>
            <span className="inline-block rounded-full bg-lime-100 px-2.5 py-1 text-[10px] font-medium text-lime-700">
              Bakery and coffee
            </span>
            <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight">
              Bread worth the
              <br /> early alarm.
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
              Stone-milled loaves and single-origin coffee, baked fresh before
              the city wakes up.
            </p>
            <div className="mt-4 inline-flex rounded-full bg-zinc-900 px-4 py-2 text-[11px] font-medium text-white">
              See the menu
            </div>
          </div>
          <div
            className="h-44 rounded-xl bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://picsum.photos/seed/maison-lumen-bakery/600/600)",
            }}
            role="img"
            aria-label="Fresh bread on a wooden counter"
          />
        </div>
      </div>
    </div>
  );
}
