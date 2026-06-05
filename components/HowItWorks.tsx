"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

const STEPS = [
  {
    n: "01",
    title: "Connectez vos outils",
    desc: "Importez vos clients et votre stock, connectez votre boîte mail. Tout est prêt en quelques minutes.",
  },
  {
    n: "02",
    title: "Laissez l’IA travailler",
    desc: "DriveOS organise vos prospects, priorise vos relances et rédige vos emails et SMS à votre place.",
  },
  {
    n: "03",
    title: "Vendez plus, plus vite",
    desc: "Suivez vos performances en temps réel et concluez davantage de ventes, sans rien oublier.",
  },
];

export default function HowItWorks() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".step-card", {
          autoAlpha: 0,
          y: 28,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
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
      id="how"
      ref={root}
      className="relative scroll-mt-20 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted">
            Comment ça marche
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tightest text-ink sm:text-4xl">
            Opérationnel en 3 étapes
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted">
            Pas de formation complexe, pas de migration interminable. DriveOS
            s’adapte à votre façon de travailler.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="step-card relative rounded-2xl border border-line bg-white p-7 shadow-card"
            >
              <span className="text-sm font-semibold text-beige-dark">
                {s.n}
              </span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
