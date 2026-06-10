"use client";

const testimonials = [
  {
    quote: "We pasted our 2014 site and had something that looks like Linear by lunch. Calls went up the same week.",
    name: "Mara Okonkwo",
    role: "Owner, Brightside Dental",
    seed: "mara-okonkwo",
  },
  {
    quote: "I typed make it more premium and add a gallery. It just did it. No ticket, no agency invoice.",
    name: "Tomás Vidal",
    role: "Founder, Vidal Joinery",
    seed: "tomas-vidal",
  },
  {
    quote: "Our studio rebuilds client sites in an afternoon now instead of three weeks. It paid for itself on day one.",
    name: "Priya Nair",
    role: "Creative Director, Field Studio",
    seed: "priya-nair",
  },
  {
    quote: "The rebuild kept our wording but fixed the layout and speed. Conversions on the booking page roughly doubled.",
    name: "Daniel Frey",
    role: "Growth Lead, Loop Fitness",
    seed: "daniel-frey",
  },
  {
    quote: "It read our menu and built a reservations flow that actually fits a restaurant. Not a generic template in sight.",
    name: "Yuki Tanaka",
    role: "Owner, Komorebi Izakaya",
    seed: "yuki-tanaka",
  },
  {
    quote: "No code, no designer, no dev. Just our link and ten minutes. The result is genuinely beautiful.",
    name: "Claire Beaumont",
    role: "Realtor, Crest Homes",
    seed: "claire-beaumont",
  },
];

function Card({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <figure className="w-[360px] shrink-0 rounded-2xl border border-white/10 bg-card p-6">
      <blockquote className="text-[15px] leading-relaxed text-zinc-200">{t.quote}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${t.seed}/80/80`}
          alt={t.name}
          width={36}
          height={36}
          className="h-9 w-9 rounded-full object-cover"
        />
        <div>
          <div className="text-sm font-medium text-white">{t.name}</div>
          <div className="text-xs text-zinc-500">{t.role}</div>
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const row = [...testimonials, ...testimonials];
  return (
    <section id="customers" className="overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Teams that stopped dreading their website.
        </h2>
      </div>

      <div className="relative mt-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max gap-5 animate-marquee hover:[animation-play-state:paused]">
          {row.map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
