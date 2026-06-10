"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { cn } from "@/lib/utils";

const templates = [
  { brand: "Komorebi", kind: "Restaurant", tint: "bg-amber-100 text-amber-700", title: "A room made for long evenings.", seed: "komorebi-izakaya", rot: "lg:-rotate-3 lg:translate-y-4" },
  { brand: "Field Studio", kind: "Agency", tint: "bg-cyan-100 text-cyan-700", title: "Work that earns attention.", seed: "field-studio-agency", rot: "lg:rotate-2 lg:-translate-y-3" },
  { brand: "Crest Homes", kind: "Real estate", tint: "bg-emerald-100 text-emerald-700", title: "The place you pictured.", seed: "crest-homes-house", rot: "lg:-rotate-2 lg:translate-y-2" },
];

export function Templates() {
  return (
    <section id="templates" className="px-6 py-40">
      <div className="mx-auto max-w-[1300px]">
        <BlurReveal className="mb-20 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <h2 className="max-w-2xl font-semibold tracking-[-0.03em] text-white [font-size:clamp(2.25rem,5.5vw,4rem)] [line-height:0.98]">
            Every sector, its own
            <br /> sense of taste.
          </h2>
          <p className="max-w-xs text-zinc-400">
            ReFrame composes from a curated library, so a bakery never looks like
            a law firm.
          </p>
        </BlurReveal>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
          {templates.map((t, i) => (
            <BlurReveal key={t.brand} delay={i * 0.1}>
              <div
                className={cn(
                  "group relative transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform hover:!translate-y-0 hover:!rotate-0",
                  t.rot
                )}
              >
                <div className="overflow-hidden rounded-[1.5rem] border border-white/12 bg-zinc-900 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.8)] transition-shadow duration-500 group-hover:shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]">
                  <div
                    className="h-44 bg-cover bg-center"
                    style={{ backgroundImage: `url(https://picsum.photos/seed/${t.seed}/700/440)` }}
                    role="img"
                    aria-label={`${t.brand} preview`}
                  />
                  <div className="bg-white p-6 text-zinc-900">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold tracking-tight">{t.brand}</span>
                      <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-medium", t.tint)}>{t.kind}</span>
                    </div>
                    <p className="mt-3 text-lg font-semibold leading-snug tracking-tight">{t.title}</p>
                  </div>
                </div>
              </div>
            </BlurReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
