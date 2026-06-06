"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { VEHICLES } from "@/lib/appData";
import { Icon } from "./icons";

const STATUS_TONE: Record<string, string> = {
  Disponible: "bg-white text-ink border border-line",
  Réservé: "bg-beige text-ink",
  Vendu: "bg-ink text-paper",
};

export function StockView() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".v-card", {
          autoAlpha: 0,
          y: 20,
          rotateX: -12,
          transformOrigin: "center top",
          transformPerspective: 900,
          duration: 0.6,
          stagger: 0.06,
          ease: "power3.out",
        });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{VEHICLES.length} véhicules en stock</p>
        <button className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-transform hover:scale-[1.03] active:scale-95">
          <Icon name="plus" size={16} />
          Ajouter un véhicule
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {VEHICLES.map((v) => (
          <article
            key={v.name}
            className="v-card group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-transform duration-300 hover:-translate-y-1.5 will-change-transform"
          >
            <div className="relative grid h-32 place-items-center overflow-hidden bg-gradient-to-br from-beige-light to-beige">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-beige-dark transition-transform duration-500 group-hover:scale-110">
                <path d="M5 11l1.5-4.5h11L19 11M4 16h16M5 16v2M19 16v2M4 11h16v5H4zM7.5 13.5h.01M16.5 13.5h.01" />
              </svg>
              <span className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_TONE[v.status]}`}>
                {v.status}
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-ink">{v.name}</h3>
              <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted">
                <span>{v.year}</span><span>·</span><span>{v.km}</span><span>·</span><span>{v.fuel}</span>
              </div>
              <div className="mt-3 text-base font-semibold tracking-tight text-ink">
                {v.price}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
