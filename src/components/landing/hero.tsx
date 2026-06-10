"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import { IslandButton } from "@/components/ui/island-button";
import { Bezel } from "@/components/ui/bezel";

export function Hero() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [url, setUrl] = React.useState("");

  // Gentle parallax: the product canvas drifts up and grows slightly as the
  // hero scrolls away, giving depth without a heavy scroll-jack.
  const sectionRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const canvasY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  function go(e?: React.FormEvent) {
    e?.preventDefault();
    if (!url.trim()) return;
    router.push(`/dashboard?url=${encodeURIComponent(url.trim().replace(/^https?:\/\//, ""))}`);
  }

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 text-center"
    >
      {/* ambient cyan mesh + grid, faded into the page */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid bg-fade-b opacity-60" />
        <div className="absolute left-1/2 top-[-12rem] h-[640px] w-[1100px] -translate-x-1/2 ambient blur-[80px]" />
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex max-w-5xl flex-col items-center"
      >
        <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-300">
          <Sparkle weight="fill" className="h-3 w-3 text-accent" />
          AI website rebuilder
        </span>

        {/* 2-line iron rule: wide container, clamp size */}
        <h1 className="text-balance font-semibold leading-[0.98] tracking-tight text-white [font-size:clamp(2.75rem,7vw,5.25rem)]">
          Reframe any website into
          <br className="hidden sm:block" /> something worth visiting.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
          Paste a link. ReFrame rebuilds your site into a fast, modern version
          you edit just by chatting.
        </p>

        {/* dual CTA, Framer-style */}
        <form onSubmit={go} className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <IslandButton onClick={() => go()} variant="accent">
            Start for free
          </IslandButton>
          <IslandButton href="/dashboard" variant="glass">
            Rebuild with AI
          </IslandButton>
        </form>
      </motion.div>

      {/* Product canvas: a real rendered "after" site in a double-bezel frame */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 60, filter: "blur(16px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={reduce ? undefined : { y: canvasY, scale: canvasScale }}
        className="relative mt-16 w-full max-w-5xl"
      >
        <div className="absolute -inset-10 -z-10 ambient-soft blur-[60px]" />
        <Bezel innerClassName="overflow-hidden">
          <ProductCanvas />
        </Bezel>
      </motion.div>
    </section>
  );
}

/** A genuine miniature "after" site (real component preview, not a fake-div mock). */
function ProductCanvas() {
  return (
    <div className="overflow-hidden rounded-[1.5rem]">
      <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.02] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <div className="ml-3 rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-zinc-500">maisonlumen.com</div>
      </div>
      <div className="grid bg-white text-zinc-900 md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 text-left md:p-12">
          <span className="inline-flex w-fit items-center rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-medium text-cyan-700">
            Bakery and coffee
          </span>
          <h3 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-tight md:text-4xl">
            Bread worth the early alarm.
          </h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">
            Stone-milled loaves and single-origin coffee, baked fresh before the
            city wakes up.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-[13px] font-medium text-white">
              Order ahead <ArrowRight weight="bold" className="h-3.5 w-3.5" />
            </span>
            <span className="text-[13px] font-medium text-zinc-500">See the menu</span>
          </div>
        </div>
        <div
          className="min-h-[260px] bg-cover bg-center"
          style={{ backgroundImage: "url(https://picsum.photos/seed/maison-lumen-bakery/900/900)" }}
          role="img"
          aria-label="Fresh bread on a wooden counter"
        />
      </div>
    </div>
  );
}
