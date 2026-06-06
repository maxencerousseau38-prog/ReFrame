"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

const VEHICLES = [
  { name: "Peugeot 308 GT", year: "2022", km: "28 400 km", fuel: "Diesel", price: "21 990 €", status: "Disponible" },
  { name: "Renault Clio V", year: "2021", km: "34 100 km", fuel: "Essence", price: "15 490 €", status: "Disponible" },
  { name: "BMW Série 3", year: "2020", km: "52 000 km", fuel: "Diesel", price: "27 900 €", status: "Réservé" },
  { name: "Volkswagen Golf 8", year: "2022", km: "19 800 km", fuel: "Hybride", price: "24 500 €", status: "Disponible" },
];

function CarGlyph() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-beige-dark transition-transform duration-500 group-hover:scale-110"
    >
      <path d="M5 11l1.5-4.5h11L19 11M4 16h16M5 16v2M19 16v2" />
      <path d="M4 11h16v5H4zM7.5 13.5h.01M16.5 13.5h.01" />
    </svg>
  );
}

export default function Inventory() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".veh-card", {
          autoAlpha: 0,
          y: 28,
          rotateX: -16,
          transformOrigin: "center top",
          transformPerspective: 900,
          duration: 0.7,
          stagger: 0.1,
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
      id="stock"
      ref={root}
      className="relative scroll-mt-20 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted">
            Stock véhicules
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tightest text-ink sm:text-4xl">
            Tout votre parc, toujours à jour
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted">
            Photos, prix, kilométrage et disponibilité : votre stock est
            centralisé et synchronisé avec vos annonces.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VEHICLES.map((v) => (
            <article
              key={v.name}
              className="veh-card group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="relative grid h-36 place-items-center overflow-hidden bg-gradient-to-br from-beige-light to-beige">
                <CarGlyph />
                <span
                  className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    v.status === "Disponible"
                      ? "bg-white text-ink"
                      : "bg-ink text-paper"
                  }`}
                >
                  {v.status}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-ink">{v.name}</h3>
                <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted">
                  <span>{v.year}</span>
                  <span>·</span>
                  <span>{v.km}</span>
                  <span>·</span>
                  <span>{v.fuel}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-semibold tracking-tight text-ink">
                    {v.price}
                  </span>
                  <span className="text-xs font-medium text-muted transition-colors group-hover:text-ink">
                    Voir →
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
