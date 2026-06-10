"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BeforeAfter() {
  const [after, setAfter] = React.useState(true);

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
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
        </div>

        <div className="relative mt-10">
          <div className="absolute -inset-8 -z-10 accent-wash blur-2xl opacity-50" />
          <div className="overflow-hidden rounded-2xl border border-white/12 bg-zinc-900 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
              <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-zinc-500">
                hartleyandsons.co.uk
              </div>
            </div>
            {after ? <After /> : <Before />}
          </div>
        </div>
      </div>
    </section>
  );
}

function Before() {
  return (
    <div className="bg-[#eceae3] p-8 font-serif text-[#2b2b2b] sm:p-10">
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
      <div className="flex flex-col justify-center p-8 sm:p-10">
        <span className="inline-flex w-fit items-center rounded-full bg-lime-100 px-2.5 py-1 text-[11px] font-medium text-lime-700">
          Trusted since 1994
        </span>
        <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">
          Plumbing done right, the first time.
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">
          Family-run experts for bathrooms, boilers and 24/7 emergencies.
          Upfront pricing and work guaranteed in writing.
        </p>
        <div className="mt-5 flex gap-3">
          <span className="rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-medium text-white">
            Get a free quote
          </span>
          <span className="rounded-full border border-zinc-300 px-5 py-2.5 text-xs font-medium text-zinc-700">
            See our work
          </span>
        </div>
      </div>
      <div
        className="min-h-[220px] bg-cover bg-center"
        style={{
          backgroundImage: "url(https://picsum.photos/seed/hartley-plumbing-kitchen/700/700)",
        }}
        role="img"
        aria-label="A newly fitted modern kitchen"
      />
    </div>
  );
}
