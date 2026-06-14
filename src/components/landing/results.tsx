"use client";

import { Star } from "@phosphor-icons/react";
import { BlurReveal } from "@/components/ui/blur-reveal";

type Review = {
  quote: string;
  name: string;
  role: string;
  initials: string;
};

const reviews: Review[] = [
  {
    quote:
      "I pasted our old URL and had a modern site the same afternoon. It finally looks like the restaurant we actually run — and reservations now come straight through it.",
    name: "Camille Forestier",
    role: "Owner · Maison Forestier",
    initials: "CF",
  },
  {
    quote:
      "I'm not a designer and never will be. I refined the copy just by chatting, and we went live that day with a contact form that genuinely reaches us. No agency, no wait.",
    name: "Thomas Brandt",
    role: "Founder · Brandt Plumbing & Heating",
    initials: "TB",
  },
  {
    quote:
      "We manage sites for a dozen local clients. ReFrame turns a two-week build into a same-day first draft we just polish. The time it saves goes straight to our margin.",
    name: "Sofia Marchetti",
    role: "Director · Northlight Studio",
    initials: "SM",
  },
];

export function Results() {
  return (
    <section id="customers" className="px-6 py-32 sm:py-40">
      <div className="mx-auto max-w-[1100px]">
        <BlurReveal className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">In their words</p>
          <h2 className="mt-4 font-semibold leading-[1.04] tracking-[-0.03em] text-white [font-size:clamp(2.25rem,5.5vw,3.75rem)]">
            The people behind the websites.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
            Owners and studios who replaced a site they had outgrown — without
            touching a builder.
          </p>
        </BlurReveal>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {reviews.map((r, i) => (
            <BlurReveal key={r.name} delay={i * 0.08}>
              <figure className="panel flex h-full flex-col rounded-[1.5rem] p-7 ring-1 ring-inset ring-white/10">
                <div className="flex gap-1" aria-label="Five out of five stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} weight="fill" className="h-4 w-4 text-accent" />
                  ))}
                </div>

                <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-zinc-200">
                  “{r.quote}”
                </blockquote>

                <figcaption className="mt-7 flex items-center gap-3 border-t border-white/8 pt-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[13px] font-semibold text-accent ring-1 ring-inset ring-accent/25">
                    {r.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium text-white">{r.name}</span>
                    <span className="block truncate text-[13px] text-zinc-500">{r.role}</span>
                  </span>
                </figcaption>
              </figure>
            </BlurReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
