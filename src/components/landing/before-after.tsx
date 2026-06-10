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
          <p className="text-sm font-medium uppercase tracking-widest text-violet-600">
            Before · After
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            The same content. A different league.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 flex justify-center">
            <div className="inline-flex rounded-full border border-border bg-secondary p-1">
              {[
                { label: "Before", value: false },
                { label: "After", value: true },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setAfter(opt.value)}
                  className={cn(
                    "relative rounded-full px-6 py-2 text-sm font-medium transition-colors",
                    after === opt.value
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {after === opt.value && (
                    <motion.span
                      layoutId="ba-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-sm"
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
            <div className="absolute -inset-4 -z-10 glow blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <div className="ml-4 flex-1 rounded-md bg-white px-3 py-1 text-xs text-muted-foreground">
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
    <div className="relative overflow-hidden bg-white p-10">
      <div className="absolute right-0 top-0 h-40 w-40 glow blur-2xl" />
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">
            Acme<span className="text-muted-foreground">·Plumbing</span>
          </span>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Services</span>
            <span>Work</span>
            <span className="rounded-full bg-foreground px-3 py-1.5 text-white">
              Book now
            </span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700">
          Trusted since 1998
        </div>
        <h3 className="mt-4 text-3xl font-semibold tracking-tight">
          Plumbing done right,
          <br />
          the first time.
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Family-run experts for bathrooms, kitchens and 24/7 emergencies.
          Transparent pricing, on-time arrival, guaranteed work.
        </p>
        <div className="mt-6 flex gap-3">
          <span className="rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-xs font-medium text-white shadow-lg shadow-violet-600/20">
            Get a free quote
          </span>
          <span className="rounded-lg border border-border px-5 py-2.5 text-xs font-medium">
            View our work
          </span>
        </div>
      </div>
    </div>
  );
}
