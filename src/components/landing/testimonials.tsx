"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";

const testimonials = [
  { quote: "We pasted our 2014 site and had something that looks like Linear by lunch. Calls went up the same week.", name: "Mara Okonkwo", role: "Owner, Brightside Dental", seed: "mara-okonkwo" },
  { quote: "I typed make it more premium and add a gallery. It just did it. No ticket, no agency invoice.", name: "Tomás Vidal", role: "Founder, Vidal Joinery", seed: "tomas-vidal" },
  { quote: "Our studio reframes client sites in an afternoon now instead of three weeks. It paid for itself on day one.", name: "Priya Nair", role: "Creative Director, Field Studio", seed: "priya-nair" },
  { quote: "The rebuild kept our wording but fixed the layout and speed. Bookings roughly doubled.", name: "Daniel Frey", role: "Growth Lead, Loop Fitness", seed: "daniel-frey" },
  { quote: "It read our menu and built a reservations flow that fits a restaurant. Not a generic template in sight.", name: "Yuki Tanaka", role: "Owner, Komorebi Izakaya", seed: "yuki-tanaka" },
  { quote: "No code, no designer, no dev. Just our link and ten minutes. The result is genuinely beautiful.", name: "Claire Beaumont", role: "Realtor, Crest Homes", seed: "claire-beaumont" },
];

export function Testimonials() {
  return (
    <section id="customers" className="px-6 py-32">
      <div className="mx-auto max-w-[1200px]">
        <BlurReveal>
          <h2 className="max-w-2xl font-semibold leading-[1.05] tracking-tight text-white [font-size:clamp(2rem,4.5vw,3.25rem)]">
            Teams that stopped dreading their website.
          </h2>
        </BlurReveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <BlurReveal key={t.seed} delay={(i % 3) * 0.08}>
              <figure className="flex h-full flex-col rounded-[1.75rem] bg-white/[0.04] p-1.5 ring-1 ring-inset ring-white/10">
                <div className="bezel-core flex h-full flex-col rounded-[1.4rem] bg-card p-6">
                  <blockquote className="flex-1 text-[15px] leading-relaxed text-zinc-200">{t.quote}</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://picsum.photos/seed/${t.seed}/80/80`}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">{t.name}</div>
                      <div className="text-xs text-zinc-500">{t.role}</div>
                    </div>
                  </figcaption>
                </div>
              </figure>
            </BlurReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
