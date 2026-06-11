"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Eye, Brain, SquaresFour, RocketLaunch, ArrowRight } from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * GSAP scrollytelling: the engine, dramatized.
 *
 * The section pins and a single browser scrubs through the four pipeline
 * phases as the user scrolls (Read, Understand, Compose, Ship). Each phase
 * cross-fades the mock to its next state and lights its step in the left rail.
 *
 * This is an isolated GSAP leaf: it owns its own scroll context and shares no
 * tree with the page's framer-motion components (the two animation engines are
 * never mixed in one subtree). Reduced-motion collapses to the final state.
 */

const STEPS = [
  { icon: Eye, label: "Read", body: "Crawl the live site: copy, media, structure, brand." },
  { icon: Brain, label: "Understand", body: "Infer the sector, the intent and what converts." },
  { icon: SquaresFour, label: "Compose", body: "Assemble vetted blocks into a coherent system." },
  { icon: RocketLaunch, label: "Ship", body: "Render a fast, editable site, ready to publish." },
];

export function TransformScroll() {
  const root = React.useRef<HTMLElement>(null);
  const pin = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".state-1, .state-2, .state-3", { autoAlpha: 0 });
        gsap.set(".state-0", { autoAlpha: 1 });
        gsap.set(".tag", { autoAlpha: 0, y: 8, scale: 0.9 });
        gsap.set(".block", { autoAlpha: 0, y: 26, scale: 0.96 });
        gsap.set(".step", { autoAlpha: 0.4 });
        gsap.set(".step-0", { autoAlpha: 1 });
        gsap.set(".scan", { yPercent: -110 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=3200",
            pin: pin.current,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        // Progress rail fills across the whole sequence.
        tl.to(".progress-fill", { scaleY: 1, duration: 4 }, 0);

        // Phase 0 — Read: a lime scan line sweeps the wireframe.
        tl.to(".scan", { yPercent: 460, duration: 1 }, 0);

        // 0 -> 1 Understand
        tl.to(".state-0", { autoAlpha: 0, duration: 0.35 }, 1)
          .to(".state-1", { autoAlpha: 1, duration: 0.35 }, 1)
          .to(".step-0", { autoAlpha: 0.7, duration: 0.2 }, 1)
          .to(".step-1", { autoAlpha: 1, duration: 0.2 }, 1)
          .to(".tag", { autoAlpha: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.5 }, 1.2);

        // 1 -> 2 Compose
        tl.to(".state-1", { autoAlpha: 0, duration: 0.35 }, 2)
          .to(".state-2", { autoAlpha: 1, duration: 0.35 }, 2)
          .to(".step-1", { autoAlpha: 0.7, duration: 0.2 }, 2)
          .to(".step-2", { autoAlpha: 1, duration: 0.2 }, 2)
          .to(".block", { autoAlpha: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.5 }, 2.2);

        // 2 -> 3 Ship
        tl.to(".state-2", { autoAlpha: 0, duration: 0.35 }, 3)
          .to(".state-3", { autoAlpha: 1, scale: 1, duration: 0.4 }, 3)
          .from(".state-3", { scale: 0.97, duration: 0.4 }, 3)
          .to(".step-2", { autoAlpha: 0.7, duration: 0.2 }, 3)
          .to(".step-3", { autoAlpha: 1, duration: 0.2 }, 3)
          .from(".ship-cta", { scale: 0.92, duration: 0.3 }, 3.3);
      });

      // Reduced motion: no pin, no scrub. Show the shipped state and all steps.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".state-0, .state-1, .state-2", { autoAlpha: 0 });
        gsap.set(".state-3", { autoAlpha: 1 });
        gsap.set(".tag, .block", { autoAlpha: 1, y: 0, scale: 1 });
        gsap.set(".step", { autoAlpha: 1 });
        gsap.set(".scan", { autoAlpha: 0 });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative px-6">
      <div ref={pin} className="flex min-h-[100dvh] items-center py-16">
        <div className="mx-auto grid w-full max-w-[1300px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left rail: heading + scrubbed step list */}
          <div>
            <h2 className="max-w-md font-semibold leading-[1.02] tracking-[-0.03em] text-white [font-size:clamp(2.1rem,4.6vw,3.5rem)]">
              It understands your site before it rebuilds it.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-zinc-400">
              Scroll to watch the engine work. Four passes turn a tired page into
              a site that earns attention.
            </p>

            <div className="relative mt-10 pl-6">
              <span className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px bg-white/10" />
              <span className="progress-fill absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px origin-top scale-y-0 bg-accent" />
              <ul className="space-y-7">
                {STEPS.map((s, i) => (
                  <li key={s.label} className={`step step-${i} flex items-start gap-4`}>
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
                      <s.icon weight="bold" className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white">{s.label}</h3>
                      <p className="mt-1 max-w-xs text-sm leading-relaxed text-zinc-400">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: one browser, four scrubbed states */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-10 -z-10 ambient-soft blur-[90px] opacity-60" />
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f11] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-1.5 border-b border-white/8 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="ml-3 truncate rounded-md bg-white/5 px-3 py-1 text-[11px] text-zinc-500">
                  reframe.site/yourbusiness
                </span>
              </div>

              <div className="relative h-[420px] overflow-hidden">
                {/* STATE 0 — Read: wireframe under a lime scan */}
                <div className="state-0 absolute inset-0 p-6">
                  <div className="scan pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-accent/0 via-accent/25 to-accent/0" />
                  <div className="space-y-3 opacity-50">
                    <div className="h-5 w-1/3 rounded bg-zinc-700" />
                    <div className="h-24 w-full rounded-lg bg-zinc-800" />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-16 rounded bg-zinc-800" />
                      <div className="h-16 rounded bg-zinc-800" />
                      <div className="h-16 rounded bg-zinc-800" />
                    </div>
                    <div className="h-3 w-2/3 rounded bg-zinc-800" />
                    <div className="h-3 w-1/2 rounded bg-zinc-800" />
                  </div>
                </div>

                {/* STATE 1 — Understand: tags label the sections */}
                <div className="state-1 absolute inset-0 p-6">
                  <div className="space-y-3 opacity-30">
                    <div className="h-5 w-1/3 rounded bg-zinc-700" />
                    <div className="h-24 w-full rounded-lg bg-zinc-800" />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-16 rounded bg-zinc-800" />
                      <div className="h-16 rounded bg-zinc-800" />
                      <div className="h-16 rounded bg-zinc-800" />
                    </div>
                  </div>
                  {["Hero", "Services", "Reviews", "Contact"].map((t, i) => (
                    <span
                      key={t}
                      className="tag absolute rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent backdrop-blur"
                      style={{
                        top: [`16%`, `52%`, `52%`, `78%`][i],
                        left: [`12%`, `16%`, `58%`, `40%`][i],
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* STATE 2 — Compose: blocks assemble */}
                <div className="state-2 absolute inset-0 p-6">
                  <div className="grid h-full grid-cols-6 grid-rows-6 gap-3">
                    <div className="block col-span-6 row-span-2 rounded-lg border border-white/10 bg-white/[0.04]" />
                    <div className="block col-span-4 row-span-3 rounded-lg border border-white/10 bg-white/[0.04]" />
                    <div className="block col-span-2 row-span-3 rounded-lg border border-accent/30 bg-accent/[0.06]" />
                    <div className="block col-span-3 row-span-1 rounded-lg border border-white/10 bg-white/[0.04]" />
                    <div className="block col-span-3 row-span-1 rounded-lg border border-white/10 bg-white/[0.04]" />
                  </div>
                </div>

                {/* STATE 3 — Ship: the polished result */}
                <div className="state-3 absolute inset-0 flex flex-col">
                  <div className="flex items-center justify-between px-6 pt-6">
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-white">
                      <span className="h-5 w-5 rounded-md bg-accent" /> Brightside
                    </span>
                    <span className="hidden gap-4 text-[11px] text-zinc-400 sm:flex">
                      <span>Work</span>
                      <span>Pricing</span>
                      <span>Contact</span>
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-center px-6">
                    <h4 className="max-w-[16ch] text-[26px] font-semibold leading-[1.05] tracking-tight text-white">
                      Plumbing done right, the first time.
                    </h4>
                    <p className="mt-2 max-w-[34ch] text-[12px] leading-relaxed text-zinc-400">
                      Upfront pricing, work guaranteed in writing, 24/7 for the
                      ones that cannot wait.
                    </p>
                    <span className="ship-cta mt-5 inline-flex w-max items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[12px] font-medium text-accent-foreground">
                      Get a free quote <ArrowRight weight="bold" className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="mx-6 mb-6 h-20 rounded-lg bg-gradient-to-r from-white/[0.06] to-accent/[0.08] ring-1 ring-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
