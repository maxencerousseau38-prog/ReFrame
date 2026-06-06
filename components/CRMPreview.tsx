"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, Flip } from "@/lib/gsap";

const COLUMNS = [
  { id: "new", label: "Nouveau" },
  { id: "contact", label: "En contact" },
  { id: "won", label: "Gagné" },
];

const CARDS = [
  { id: "c1", name: "M. Dupont", car: "Peugeot 308 GT", value: "21 990 €", col: 0, hot: true },
  { id: "c2", name: "Mme Leroy", car: "Renault Clio V", value: "15 490 €", col: 0 },
  { id: "c3", name: "M. Bernard", car: "BMW Série 3", value: "27 900 €", col: 1 },
  { id: "c4", name: "Mme Petit", car: "VW Golf 8", value: "24 500 €", col: 2 },
];

export default function CRMPreview() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".crm-reveal", {
          autoAlpha: 0,
          y: 24,
          rotateX: -14,
          transformOrigin: "center top",
          transformPerspective: 1000,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
        });

        // Loop: move the "hot" prospect card through the pipeline with Flip.
        const hot = root.current!.querySelector<HTMLElement>('[data-hot="true"]')!;
        const cols = gsap.utils.toArray<HTMLElement>("[data-coldrop]");
        let idx = 0;
        const interval = window.setInterval(() => {
          const state = Flip.getState(".crm-card");
          idx = (idx + 1) % cols.length;
          cols[idx].appendChild(hot);
          Flip.from(state, {
            duration: 0.7,
            ease: "power2.inOut",
            absolute: true,
          });
        }, 2600);

        return () => {
          clearInterval(interval);
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
      id="crm"
      ref={root}
      className="relative scroll-mt-20 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="crm-reveal mb-3 text-sm font-medium uppercase tracking-wider text-muted">
            CRM
          </p>
          <h2 className="crm-reveal text-balance text-3xl font-semibold tracking-tightest text-ink sm:text-4xl">
            Votre pipeline de prospects, vivant
          </h2>
          <p className="crm-reveal mt-4 text-pretty text-lg text-muted">
            Faites avancer chaque opportunité d’une étape à l’autre. DriveOS
            garde le fil et vous rappelle qui relancer, et quand.
          </p>
        </div>

        <div className="crm-reveal mt-14 grid grid-cols-3 gap-3 rounded-2xl border border-line bg-paper p-3 sm:gap-4 sm:p-5">
          {COLUMNS.map((col, ci) => (
            <div key={col.id} className="rounded-xl bg-white/60 p-2.5 sm:p-3">
              <div className="mb-3 flex items-center justify-between px-1 text-xs font-medium text-muted">
                <span>{col.label}</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    ci === 2 ? "bg-ink" : ci === 1 ? "bg-beige-dark" : "bg-beige"
                  }`}
                />
              </div>
              <div
                data-coldrop
                className="flex min-h-[180px] flex-col gap-2.5"
              >
                {CARDS.filter((c) => c.col === ci).map((c) => (
                  <article
                    key={c.id}
                    data-hot={c.hot ? "true" : undefined}
                    className="crm-card rounded-lg border border-line bg-white p-3 shadow-card"
                  >
                    <div className="text-sm font-medium text-ink">{c.name}</div>
                    <div className="mt-0.5 text-xs text-muted">{c.car}</div>
                    <div className="mt-2 text-xs font-semibold text-ink">
                      {c.value}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
