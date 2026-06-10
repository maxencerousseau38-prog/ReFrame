"use client";

import { Search, Wand2, Rocket } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Analyze",
    desc: "Paste your URL. We detect your industry, extract your content, images and structure, and audit performance & SEO.",
  },
  {
    icon: Wand2,
    step: "02",
    title: "Redesign",
    desc: "Our engine assembles a coherent, premium site from modular blocks — tailored to your sector, not a random template.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Edit & Publish",
    desc: "Refine everything with the AI editor in plain English, then publish instantly to a global edge network.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24 sm:py-32">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            How it works
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            From dated to dazzling in three steps
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            No designers, no developers, no months of back-and-forth.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.1}>
              <div className="group gradient-border relative h-full overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1">
                {/* hover glow */}
                <div className="pointer-events-none absolute -inset-px -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 glow" />
                <div className="absolute right-6 top-6 text-5xl font-bold text-white/[0.06] transition-colors group-hover:text-white/10">
                  {s.step}
                </div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6366f1,#d946ef)] text-white shadow-lg shadow-violet-600/30">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-neutral-400">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
