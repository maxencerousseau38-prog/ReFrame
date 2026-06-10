"use client";

import * as React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { BlurReveal } from "@/components/ui/blur-reveal";

/**
 * Immersive before/after: a single frame with a draggable divider that wipes
 * between the old site and the rebuilt one (clip-path). More tactile and
 * convincing than a toggle; the user controls the reveal.
 */
export function Compare() {
  const [pos, setPos] = React.useState(42);
  const ref = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const set = React.useCallback((clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(4, Math.min(96, p)));
  }, []);

  React.useEffect(() => {
    const move = (e: PointerEvent) => dragging.current && set(e.clientX);
    const up = () => (dragging.current = false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [set]);

  return (
    <section id="compare" className="px-6 py-40">
      <div className="mx-auto max-w-[1200px]">
        <BlurReveal className="mb-12 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Before, then after</p>
          <h2 className="mt-4 font-semibold tracking-[-0.03em] text-white [font-size:clamp(2.25rem,5.5vw,4rem)] [line-height:0.98]">
            Drag to watch a decade
            <br /> disappear.
          </h2>
        </BlurReveal>

        <BlurReveal delay={0.1}>
          <div
            ref={ref}
            onPointerDown={(e) => {
              dragging.current = true;
              set(e.clientX);
            }}
            className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-[1.75rem] border border-white/12 shadow-[0_50px_140px_-40px_rgba(0,0,0,0.85)] sm:aspect-[16/9]"
          >
            {/* AFTER (base) */}
            <div className="absolute inset-0"><AfterSite /></div>

            {/* BEFORE (clipped overlay from the left) */}
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <BeforeSite />
            </div>

            {/* labels */}
            <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">Before</span>
            <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-foreground">After</span>

            {/* handle */}
            <div className="absolute inset-y-0 z-10 w-px bg-white/70" style={{ left: `${pos}%` }}>
              <div className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg">
                <CaretLeft weight="bold" className="h-3.5 w-3.5" />
                <CaretRight weight="bold" className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </BlurReveal>
      </div>
    </section>
  );
}

function BeforeSite() {
  return (
    <div className="h-full w-full bg-[#eceae3] p-8 font-serif text-[#2b2b2b] sm:p-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between border-b-2 border-[#9a9a8e] pb-3">
          <span className="text-lg font-bold text-[#1f4e79]">HARTLEY &amp; SONS PLUMBING</span>
          <div className="hidden gap-3 text-xs text-[#1f4e79] underline sm:flex">
            <span>Home</span><span>Services</span><span>Contact</span>
          </div>
        </div>
        <div className="mb-4 h-32 w-full bg-[#c9c7bb]" />
        <h3 className="mb-2 text-xl font-bold">Welcome to our website</h3>
        <p className="max-w-md text-sm leading-relaxed text-[#555]">
          Family plumbing business serving the area since 1994. Bathrooms,
          boilers and emergency callouts. Phone for a quote today.
        </p>
        <div className="mt-4 inline-block border border-[#1f4e79] bg-[#dcdcd2] px-4 py-1 text-xs text-[#1f4e79]">Click here to contact us</div>
      </div>
    </div>
  );
}

function AfterSite() {
  // Full-bleed composition so any vertical slice the divider exposes is strong,
  // and impact does not depend on an external image loading.
  return (
    <div className="relative h-full w-full overflow-hidden bg-white text-zinc-900">
      <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl from-cyan-100 via-white to-white" />
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-200/50 blur-3xl" />
      <div className="relative flex h-full flex-col justify-center px-8 sm:px-16">
        <span className="flex items-center gap-2 text-xs font-medium tracking-tight text-zinc-500">
          <span className="h-5 w-5 rounded-md bg-zinc-900" /> Hartley &amp; Sons
        </span>
        <h3 className="mt-6 max-w-2xl font-semibold leading-[0.98] tracking-[-0.03em] [font-size:clamp(2rem,5vw,3.75rem)]">
          Plumbing done right, the first time.
        </h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-500 sm:text-base">
          Bathrooms, boilers and 24/7 emergencies. Upfront pricing, work
          guaranteed in writing.
        </p>
        <div className="mt-7 flex gap-3">
          <span className="rounded-full bg-zinc-900 px-5 py-2.5 text-[13px] font-medium text-white">Get a free quote</span>
          <span className="rounded-full border border-zinc-300 px-5 py-2.5 text-[13px] font-medium text-zinc-700">Our work</span>
        </div>
      </div>
    </div>
  );
}
