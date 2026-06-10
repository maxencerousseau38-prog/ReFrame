"use client";

import { Reveal } from "@/components/ui/reveal";

const testimonials = [
  {
    quote:
      "We pasted our 2014 website and had a site that looks like Linear by lunch. Bounce rate dropped 40%.",
    name: "Sarah Chen",
    role: "Founder, Northwind Studio",
  },
  {
    quote:
      "The AI editor is unreal. I typed “make it more premium and add testimonials” and it just did it.",
    name: "Marcus Webb",
    role: "Owner, Webb Plumbing",
  },
  {
    quote:
      "Our agency now revives client sites in an afternoon instead of three weeks. It pays for itself instantly.",
    name: "Léa Dubois",
    role: "Creative Director, Atelier21",
  },
  {
    quote:
      "Honestly thought it was too good to be true. The redesign converted 2.3x better in our A/B test.",
    name: "Daniel Park",
    role: "Growth Lead, Loop",
  },
  {
    quote:
      "No code, no designer, no dev. Just our URL and ten minutes. The output is genuinely beautiful.",
    name: "Amira Hassan",
    role: "Restaurant owner",
  },
  {
    quote:
      "It detected our industry and picked layouts that actually fit. Not a generic template in sight.",
    name: "Tom Rivera",
    role: "Realtor, Crest Homes",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 sm:py-32">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-600">
            Loved by builders
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Teams shipping sites they’re proud of
          </h2>
        </Reveal>

        <div className="mt-16 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.08}>
              <figure className="break-inside-avoid rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
                <blockquote className="text-[15px] leading-relaxed text-foreground">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold text-white">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
