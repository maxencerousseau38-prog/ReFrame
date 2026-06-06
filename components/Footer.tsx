"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

const COLUMNS = [
  {
    title: "Produit",
    links: ["Fonctionnalités", "Tarifs", "Assistant IA", "Stock véhicules", "CRM"],
  },
  {
    title: "Entreprise",
    links: ["À propos", "Clients", "Blog", "Carrières", "Contact"],
  },
  {
    title: "Légal",
    links: ["Conditions", "Confidentialité", "Mentions légales", "RGPD"],
  },
];

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".footer-reveal", {
          autoAlpha: 0,
          y: 24,
          rotateX: -12,
          transformOrigin: "center top",
          transformPerspective: 1000,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
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
    <footer ref={root} className="px-6 pb-10 pt-24">
      <div className="mx-auto max-w-6xl">
        {/* Final CTA */}
        <div className="footer-reveal relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center text-paper md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-[640px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.12),transparent)] blur-2xl"
          />
          <h2 className="relative text-balance text-3xl font-semibold tracking-tightest sm:text-4xl">
            Prêt à vendre plus, plus vite ?
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-pretty text-paper/70">
            Rejoignez les 400+ garagistes qui pilotent leurs ventes avec
            DriveOS. 7 jours gratuits, sans carte bancaire.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3 font-medium text-ink transition-transform duration-200 hover:scale-[1.03] active:scale-95"
            >
              Démarrer gratuitement
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-paper/25 px-6 py-3 font-medium text-paper transition-colors hover:bg-paper/10"
            >
              Réserver une démo
            </a>
          </div>
        </div>

        {/* Footer links */}
        <div className="footer-reveal mt-16 grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tightest text-ink">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-paper">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M3 13.5 5 7h14l2 6.5M5.5 17.5h.01M18.5 17.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 13.5h18v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </span>
              DriveOS
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted">
              Le logiciel de gestion commerciale pensé pour les garagistes
              qui vendent des véhicules.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-ink">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-ink"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-reveal mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-sm text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} DriveOS. Tous droits réservés.</span>
          <span>Conçu pour les garagistes · Hébergé en Europe</span>
        </div>
      </div>
    </footer>
  );
}
