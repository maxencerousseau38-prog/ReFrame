"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  useTransform,
  useMotionValue,
  animate,
  type AnimationPlaybackControls,
} from "framer-motion";
import { ArrowRight, ArrowsLeftRight, Lightning, ShieldCheck, Star, Sparkle } from "@phosphor-icons/react";
import { BrowserFrame } from "@/components/ui/browser-frame";

/**
 * Before / after, the centrepiece of the landing. One browser compares the SAME
 * business like-for-like behind a luminous seam. It auto-sweeps on a gentle
 * loop, but the visitor can grab the handle and drag to compare themselves; the
 * auto-sweep pauses while dragging and resumes when idle. Reduced-motion shows
 * the finished "after". All motion is transform / clip-path only (no layout).
 */
export function Transformation() {
  const reduce = useReducedMotion();
  const trackRef = React.useRef<HTMLDivElement>(null);
  const seam = useMotionValue(reduce ? 100 : 50);
  const dragging = React.useRef(false);
  const controls = React.useRef<AnimationPlaybackControls | null>(null);

  const startAuto = React.useCallback(() => {
    if (reduce) {
      seam.set(100);
      return;
    }
    controls.current?.stop();
    controls.current = animate(seam, [24, 78, 24], {
      duration: 9,
      ease: [0.65, 0, 0.35, 1],
      repeat: Infinity,
    });
  }, [reduce, seam]);

  React.useEffect(() => {
    startAuto();
    return () => controls.current?.stop();
  }, [startAuto]);

  const setFromX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    seam.set(Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100)));
  };
  const onDown = (e: React.PointerEvent) => {
    dragging.current = true;
    controls.current?.stop();
    setFromX(e.clientX);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => dragging.current && setFromX(e.clientX);
  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    startAuto();
  };

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
            Same content, same brand. Drag the handle to compare the page quietly
            turning customers away with the one they trust before they&apos;ve even scrolled.
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
            <div
              ref={trackRef}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              className="relative aspect-[16/10] w-full cursor-ew-resize touch-none select-none overflow-hidden sm:aspect-[16/9]"
            >
              {/* BEFORE — genuinely dated: serif, cramped, low-contrast, clip-art */}
              <div className="absolute inset-0 bg-[#eceae2] text-[#2b2a27]">
                <div className="flex items-center justify-between border-b border-black/10 bg-[#e3e0d6] px-6 py-3 sm:px-10">
                  <span className="font-serif text-base font-bold italic tracking-tight sm:text-lg">Brightside Plumbing Co.</span>
                  <span className="hidden gap-4 font-serif text-[12px] text-[#1c4587] underline underline-offset-2 sm:flex">
                    <span>Home</span><span>About Us</span><span>Services</span><span>Contact</span>
                  </span>
                </div>
                <div className="grid grid-cols-[1.3fr_0.7fr] gap-5 px-6 pt-7 sm:px-10">
                  <div>
                    <h4 className="font-serif text-xl font-bold leading-tight text-[#3a3935] underline decoration-[#b9b4a6] sm:text-2xl">
                      Welcome To Our Website!
                    </h4>
                    <div className="mt-4 space-y-2">
                      <div className="h-2 w-full rounded-none bg-[#cfccc2]" />
                      <div className="h-2 w-[92%] rounded-none bg-[#cfccc2]" />
                      <div className="h-2 w-[80%] rounded-none bg-[#cfccc2]" />
                      <div className="h-2 w-[88%] rounded-none bg-[#cfccc2]" />
                    </div>
                    <span className="mt-5 inline-block border border-[#8a8578] bg-gradient-to-b from-[#f4f2ea] to-[#d9d5c8] px-4 py-1.5 font-serif text-[13px] text-[#3a3935] shadow-[inset_0_1px_0_#fff]">
                      Submit
                    </span>
                  </div>
                  {/* clip-art-ish placeholder image */}
                  <div className="flex items-center justify-center border border-[#c3bfb1] bg-[#dcd8cc]">
                    <span className="font-serif text-[11px] italic text-[#9a968a]">[ photo ]</span>
                  </div>
                </div>
                <span className="absolute bottom-4 left-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9a968a] sm:left-10">Before</span>
              </div>

              {/* AFTER — modern, dark, accent (revealed by the seam) */}
              <motion.div className="absolute inset-0 bg-[#0e0e10]" style={{ clipPath: afterClip }}>
                <div className="flex items-center justify-between border-b border-white/8 px-6 py-3.5 sm:px-10">
                  <span className="flex items-center gap-2.5 text-[15px] font-semibold text-white">
                    <span className="h-6 w-6 rounded-md bg-accent" /> Brightside
                  </span>
                  <span className="hidden gap-5 text-[13px] text-zinc-400 sm:flex">
                    <span>Work</span><span>Pricing</span><span>Contact</span>
                  </span>
                </div>
                <div className="px-6 pt-9 sm:px-10">
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
                <span className="absolute bottom-4 right-6 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent sm:right-10">
                  <Sparkle weight="fill" className="h-3 w-3" /> After
                </span>
              </motion.div>

              {/* luminous seam + draggable handle */}
              <motion.div className="absolute inset-y-0 z-20 w-px bg-accent shadow-[0_0_30px_5px_rgba(159,222,63,0.45)]" style={{ left: seamLeft }}>
                <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/60 bg-[#0e0e10]/85 backdrop-blur transition-transform hover:scale-105">
                  <ArrowsLeftRight weight="bold" className="h-4 w-4 text-accent" />
                </span>
              </motion.div>

              {/* drag hint */}
              <span className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur">
                Drag to compare
              </span>
            </div>
          </BrowserFrame>

          {/* truthful capability chips (no fabricated metrics) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {["Modern & fast", "Mobile-perfect", "SEO-ready", "Built to convert", "Your content kept"].map((c) => (
              <span key={c} className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[12px] text-zinc-300">
                {c}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
