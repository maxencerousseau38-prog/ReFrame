"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { cn } from "@/lib/utils";

type Ex = {
  brand: string;
  sector: string;
  title: string;
  grad: string;
  tint: string;
};

const examples: Ex[] = [
  {
    brand: "Komorebi",
    sector: "Restaurant",
    title: "A table you'll remember.",
    grad: "from-amber-100 via-white to-white",
    tint: "bg-amber-100 text-amber-700",
  },
  {
    brand: "Field Studio",
    sector: "Agency",
    title: "Work that earns attention.",
    grad: "from-stone-200 via-white to-white",
    tint: "bg-stone-200 text-stone-700",
  },
  {
    brand: "Crest Homes",
    sector: "Real estate",
    title: "The place you pictured.",
    grad: "from-emerald-100 via-white to-white",
    tint: "bg-emerald-100 text-emerald-700",
  },
];

export function Examples() {
  return (
    <section id="examples" className="px-6 py-32">
      <div className="mx-auto max-w-[1300px]">
        <BlurReveal className="mb-16 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <h2 className="max-w-2xl font-semibold leading-[1.02] tracking-[-0.03em] text-white [font-size:clamp(2.25rem,5.5vw,4rem)]">
            Real sites, reframed.
          </h2>
          <p className="max-w-xs text-zinc-400">
            Every transformation keeps the business&apos;s own content and brand.
            Same company, a site that finally sells.
          </p>
        </BlurReveal>

        <div className="grid gap-6 lg:grid-cols-3">
          {examples.map((e, i) => (
            <BlurReveal key={e.brand} delay={i * 0.1}>
              <Card e={e} />
            </BlurReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ e }: { e: Ex }) {
  return (
    <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/12 bg-zinc-900 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.85)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5">
      {/* after preview */}
      <div className="relative h-52 overflow-hidden bg-white text-zinc-900">
        <div className={cn("absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl", e.grad)} />
        <div className="relative flex h-full flex-col justify-center px-6">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <span className="h-4 w-4 rounded bg-zinc-900" /> {e.brand}
          </span>
          <h3 className="mt-3 max-w-[16ch] text-xl font-semibold leading-tight tracking-tight">{e.title}</h3>
          <span className="mt-4 w-fit rounded-full bg-zinc-900 px-3.5 py-1.5 text-[11px] font-medium text-white">Get started</span>
        </div>

        {/* before thumbnail, telling the transformation story */}
        <div className="absolute bottom-3 left-3 w-20 -rotate-3 overflow-hidden rounded-md border border-zinc-300 opacity-90 shadow">
          <div className="bg-[#eceae3] p-1.5 font-serif text-[#2b2b2b]">
            <div className="h-1.5 w-3/4 bg-[#1f4e79]" />
            <div className="mt-1 h-5 w-full bg-[#c9c7bb]" />
            <div className="mt-1 h-1 w-2/3 bg-[#cfcdc2]" />
          </div>
        </div>
        <span className="absolute bottom-3 left-24 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur">
          before
        </span>
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", e.tint)}>{e.sector}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Transformed</span>
      </div>
    </div>
  );
}
