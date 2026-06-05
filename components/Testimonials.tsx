"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

const QUOTES = [
  {
    quote:
      "DriveOS a remplacé mon Excel et mes carnets. Je ne perds plus une seule relance, et mes clients le ressentent.",
    name: "Karim B.",
    role: "Garage indépendant · Lyon",
  },
  {
    quote:
      "L’import automatique des emails dans le CRM m’a fait gagner près de 5 heures par semaine. Bluffant.",
    name: "Sophie L.",
    role: "Concession · Bordeaux",
  },
  {
    quote:
      "Les relances automatiques ont réveillé des clients que j’avais oubliés. +12 % de ventes en trois mois.",
    name: "Marc D.",
    role: "Mandataire · Lille",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-ink">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="m12 2 2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2Z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".quote-card", {
          autoAlpha: 0,
          y: 24,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
        });
        return () => {
          ScrollTrigger.getAll().forEach((s) => {
            if (s.trigger === root.current) s.kill();
          });
        };
      });
    },
    { scope: root }
  );

  return (
    <section
      id="temoignages"
      ref={root}
      className="relative scroll-mt-20 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted">
            Témoignages
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tightest text-ink sm:text-4xl">
            Ils vendent plus avec DriveOS
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {QUOTES.map((q) => (
            <figure
              key={q.name}
              className="quote-card flex flex-col rounded-2xl border border-line bg-white p-7 shadow-card"
            >
              <Stars />
              <blockquote className="mt-4 flex-1 text-pretty text-[15px] leading-relaxed text-ink">
                « {q.quote} »
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-beige text-sm font-semibold text-ink">
                  {q.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink">
                    {q.name}
                  </span>
                  <span className="block text-xs text-muted">{q.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
