"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export function BeforeAfter() {
  const [after, setAfter] = React.useState(true);

  return (
    <section className="py-24 sm:py-32">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            Before · After
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            The same content. A different league.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 flex justify-center">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
              {[
                { label: "Before", value: false },
                { label: "After", value: true },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setAfter(opt.value)}
                  className={cn(
                    "relative rounded-full px-6 py-2 text-sm font-medium transition-colors",
                    after === opt.value ? "text-white" : "text-neutral-400 hover:text-white"
                  )}
                >
                  {after === opt.value && (
                    <motion.span
                      layoutId="ba-pill"
                      className="absolute inset-0 rounded-full bg-white/10 shadow-sm"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative mx-auto mt-10 max-w-4xl">
            <div className="absolute -inset-6 -z-10 glow blur-[80px] opacity-70" />
            <div className="gradient-border overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl shadow-black/60 backdrop-blur">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <span className="h-3 w-3 rounded-full bg-green-400/80" />
                <div className="ml-4 flex-1 rounded-md bg-white/5 px-3 py-1 text-xs text-neutral-500">
                  {after ? "https://acme.com — revived" : "https://acme.com"}
                </div>
              </div>

              {after ? <AfterMock /> : <BeforeMock />}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BeforeMock() {
  return (
    <div className="bg-[#f3f3ef] p-8 font-serif text-[#333]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between border-b-2 border-[#888] pb-3">
          <span className="text-lg font-bold text-[#1d4a8a]">ACME PLUMBING</span>
          <div className="flex gap-3 text-xs text-[#1d4a8a] underline">
            <span>Home</span>
            <span>Services</span>
            <span>Contact</span>
          </div>
        </div>
        <div className="mb-4 h-32 w-full bg-[#cfcfc4]" />
        <h3 className="mb-2 text-xl font-bold">Welcome to our website!</h3>
        <p className="text-sm leading-relaxed text-[#555]">
          We are a family plumbing business since 1998. Call us today for a free
          quote. We do bathrooms, kitchens, emergencies and more.
        </p>
        <div className="mt-4 inline-block border border-[#1d4a8a] bg-[#e6e6e6] px-4 py-1 text-xs text-[#1d4a8a]">
          Click here to contact us
        </div>
      </div>
    </div>
  );
}

function AfterMock() {
  return (
    <div className="relative overflow-hidden bg-[#0a0a0f] p-10">
      <div className="absolute right-0 top-0 h-48 w-48 glow blur-[60px]" />
      <div className="relative mx-auto max-w-2xl">
        <div className="mb-10 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-white">
            Acme<span className="text-neutral-500">·Plumbing</span>
          </span>
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span>Services</span>
            <span>Work</span>
            <span className="rounded-full bg-white px-3 py-1.5 text-neutral-950">
              Book now
            </span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[11px] font-medium text-violet-200">
          Trusted since 1998
        </div>
        <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          Plumbing done right,
          <br />
          the first time.
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-400">
          Family-run experts for bathrooms, kitchens and 24/7 emergencies.
          Transparent pricing, on-time arrival, guaranteed work.
        </p>
        <div className="mt-6 flex gap-3">
          <span className="rounded-full bg-[linear-gradient(110deg,#6366f1,#d946ef)] px-5 py-2.5 text-xs font-medium text-white shadow-lg shadow-violet-600/30">
            Get a free quote
          </span>
          <span className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-medium text-white">
            View our work
          </span>
        </div>
      </div>
    </div>
  );
}
