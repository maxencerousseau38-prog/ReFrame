"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";

export function Results() {
  return (
    <section id="customers" className="px-6 py-40">
      <div className="mx-auto max-w-[1100px]">
        <BlurReveal>
          <p className="mb-12 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">In their words</p>
        </BlurReveal>

        <BlurReveal delay={0.05}>
          {/* Monumental pull-quote, editorial */}
          <blockquote className="font-semibold tracking-[-0.03em] text-white [font-size:clamp(1.75rem,4.2vw,3.25rem)] [line-height:1.08]">
            We pasted a link on a Tuesday and replaced a site we had been
            <span className="text-zinc-500"> embarrassed by for nine years</span>.
            Bookings climbed the same week.
          </blockquote>
        </BlurReveal>

        <BlurReveal delay={0.1}>
          <div className="mt-14 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://picsum.photos/seed/mara-okonkwo/96/96"
              alt="Mara Okonkwo"
              className="h-12 w-12 rounded-full object-cover ring-1 ring-white/10"
            />
            <div>
              <div className="font-medium text-white">Mara Okonkwo</div>
              <div className="text-sm text-zinc-500">Owner, Brightside Dental</div>
            </div>
          </div>
        </BlurReveal>
      </div>
    </section>
  );
}
