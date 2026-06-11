"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";

type Ex = { brand: string; sector: string; title: string; img: string };

const examples: Ex[] = [
  { brand: "Komorebi", sector: "Restaurant", title: "A table you'll remember.", img: "/brand/scene-1.jpg" },
  { brand: "Field Studio", sector: "Agency", title: "Work that earns attention.", img: "/brand/scene-2.jpg" },
  { brand: "Crest Homes", sector: "Real estate", title: "The place you pictured.", img: "/brand/scene-3.jpg" },
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
    <div className="group overflow-hidden rounded-[1.5rem] border border-accent/15 bg-[#16140f] shadow-[0_30px_90px_-40px_rgba(0,0,0,0.85)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5">
      {/* elevated visual: grayscale landscape under a warm gold wash */}
      <div className="relative h-56 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${e.img})` }}
          role="img"
          aria-label={`${e.brand} reframed`}
        />
        <div className="pointer-events-none absolute inset-0 bg-accent/20 mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#16140f] via-[#16140f]/40 to-transparent" />

        {/* before thumbnail, telling the transformation story */}
        <div className="absolute left-4 top-4 w-16 -rotate-3 overflow-hidden rounded-md bg-[#f3f1ec] p-1.5 shadow ring-1 ring-black/10">
          <div className="h-1 w-3/4 rounded bg-[#1f4e79]" />
          <div className="mt-1 h-5 w-full rounded-sm bg-[#c9c7bb] grayscale" />
          <div className="mt-1 h-0.5 w-2/3 rounded bg-[#cfcdc2]" />
        </div>
        <span className="absolute left-[5.5rem] top-4 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur">
          before
        </span>

        {/* brand + title over the image */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
            <span className="h-3.5 w-3.5 rounded bg-accent" /> {e.brand}
          </span>
          <h3 className="mt-1.5 max-w-[18ch] text-xl font-semibold leading-tight tracking-tight text-white">{e.title}</h3>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-4">
        <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent">{e.sector}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Transformed</span>
      </div>
    </div>
  );
}
