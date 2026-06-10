"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Bezel } from "@/components/ui/bezel";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { cn } from "@/lib/utils";

export function BeforeAfter() {
  const [after, setAfter] = React.useState(true);

  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-[1100px]">
        <BlurReveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <h2 className="max-w-xl font-semibold leading-[1.05] tracking-tight text-white [font-size:clamp(2rem,4.5vw,3.25rem)]">
            The same business. A site that finally sells.
          </h2>
          <div className="inline-flex shrink-0 rounded-full border border-white/10 bg-white/5 p-1">
            {[
              { label: "Before", value: false },
              { label: "After", value: true },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setAfter(opt.value)}
                className={cn(
                  "relative rounded-full px-5 py-2 text-sm font-medium transition-colors",
                  after === opt.value ? "text-accent-foreground" : "text-zinc-400 hover:text-white"
                )}
              >
                {after === opt.value && (
                  <motion.span
                    layoutId="ba-pill"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{opt.label}</span>
              </button>
            ))}
          </div>
        </BlurReveal>

        <BlurReveal delay={0.1} className="relative mt-10">
          <div className="absolute -inset-10 -z-10 ambient-soft blur-[70px]" />
          <Bezel innerClassName="overflow-hidden">
            <div className="overflow-hidden rounded-[1.5rem]">
              <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.02] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="ml-3 rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-zinc-500">
                  hartleyandsons.co.uk
                </div>
              </div>
              {after ? <After /> : <Before />}
            </div>
          </Bezel>
        </BlurReveal>
      </div>
    </section>
  );
}

function Before() {
  return (
    <div className="bg-[#eceae3] p-8 font-serif text-[#2b2b2b] sm:p-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between border-b-2 border-[#9a9a8e] pb-3">
          <span className="text-lg font-bold text-[#1f4e79]">HARTLEY &amp; SONS PLUMBING</span>
          <div className="hidden gap-3 text-xs text-[#1f4e79] underline sm:flex">
            <span>Home</span>
            <span>Services</span>
            <span>Contact</span>
          </div>
        </div>
        <div className="mb-4 h-28 w-full bg-[#c9c7bb]" />
        <h3 className="mb-2 text-xl font-bold">Welcome to our website</h3>
        <p className="text-sm leading-relaxed text-[#555]">
          Family plumbing business serving the area since 1994. We do bathrooms,
          kitchens, boilers and emergency callouts. Phone for a quote today.
        </p>
        <div className="mt-4 inline-block border border-[#1f4e79] bg-[#dcdcd2] px-4 py-1 text-xs text-[#1f4e79]">
          Click here to contact us
        </div>
      </div>
    </div>
  );
}

function After() {
  return (
    <div className="grid bg-white text-zinc-900 sm:grid-cols-2">
      <div className="flex flex-col justify-center p-8 sm:p-12">
        <span className="inline-flex w-fit items-center rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-medium text-cyan-700">
          Trusted since 1994
        </span>
        <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">
          Plumbing done right, the first time.
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">
          Family-run experts for bathrooms, boilers and 24/7 emergencies. Upfront
          pricing and work guaranteed in writing.
        </p>
        <div className="mt-5 flex gap-3">
          <span className="rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-medium text-white">Get a free quote</span>
          <span className="rounded-full border border-zinc-300 px-5 py-2.5 text-xs font-medium text-zinc-700">See our work</span>
        </div>
      </div>
      <div
        className="min-h-[240px] bg-cover bg-center"
        style={{ backgroundImage: "url(https://picsum.photos/seed/hartley-plumbing-kitchen/800/800)" }}
        role="img"
        aria-label="A newly fitted modern kitchen"
      />
    </div>
  );
}
