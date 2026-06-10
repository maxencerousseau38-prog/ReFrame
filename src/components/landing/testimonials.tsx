"use client";

import { Reveal } from "@/components/ui/reveal";

const testimonials = [
  { quote: "We pasted our 2014 website and had a site that looks like Linear by lunch. Bounce rate dropped 40%.", name: "Sarah Chen", role: "Founder, Northwind Studio" },
  { quote: "The AI editor is unreal. I typed “make it more premium and add testimonials” and it just did it.", name: "Marcus Webb", role: "Owner, Webb Plumbing" },
  { quote: "Our agency now revives client sites in an afternoon instead of three weeks. It pays for itself instantly.", name: "Léa Dubois", role: "Creative Director, Atelier21" },
  { quote: "Honestly thought it was too good to be true. The redesign converted 2.3x better in our A/B test.", name: "Daniel Park", role: "Growth Lead, Loop" },
  { quote: "No code, no designer, no dev. Just our URL and ten minutes. The output is genuinely beautiful.", name: "Amira Hassan", role: "Restaurant owner" },
  { quote: "It detected our industry and picked layouts that actually fit. Not a generic template in sight.", name: "Tom Rivera", role: "Realtor, Crest Homes" },
];

function Card({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <figure className="w-[340px] shrink-0 rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm">
      <blockquote className="text-[15px] leading-relaxed text-neutral-200">“{t.quote}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1,#d946ef)] text-xs font-semibold text-white">
          {t.name.split(" ").map((n) => n[0]).join("")}
        </span>
        <div>
          <div className="text-sm font-medium text-white">{t.name}</div>
          <div className="text-xs text-neutral-500">{t.role}</div>
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const row = [...testimonials, ...testimonials];
  return (
    <section id="testimonials" className="overflow-hidden py-24 sm:py-32">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            Loved by builders
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Teams shipping sites they’re proud of
          </h2>
        </Reveal>
      </div>

      {/* Infinite marquee */}
      <div className="relative mt-16">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max gap-5 animate-marquee hover:[animation-play-state:paused]">
          {row.map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
