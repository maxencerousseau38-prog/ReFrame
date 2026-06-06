"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import UpsellButton from "@/components/UpsellButton";

type Feature = {
  id: string;
  icon: keyof typeof ICONS;
  title: string;
  desc: string;
  big?: boolean;
};

const FEATURES: Feature[] = [
  {
    id: "crm",
    icon: "users",
    title: "Gérez tous vos prospects",
    desc: "Centralisez chaque contact, suivez l’avancement de vos opportunités et ne laissez plus aucune relance vous échapper.",
    big: true,
  },
  {
    id: "ia",
    icon: "sparkles",
    title: "Votre assistant commercial IA",
    desc: "L’IA rédige vos emails et SMS, résume l’historique d’un client et vous suggère les prochaines actions à mener.",
    big: true,
  },
  {
    id: "ventes",
    icon: "trending",
    title: "Suivez vos ventes",
    desc: "Visualisez votre pipeline et vos ventes réalisées en temps réel.",
  },
  {
    id: "stock",
    icon: "car",
    title: "Gérez votre stock",
    desc: "Tout votre parc de véhicules à jour : photos, prix et disponibilité.",
  },
  {
    id: "agenda",
    icon: "calendar",
    title: "Organisez vos rendez-vous",
    desc: "Planifiez essais, livraisons et rappels sans rien oublier.",
  },
  {
    id: "marges",
    icon: "percent",
    title: "Pilotez vos marges",
    desc: "Suivez marges et commissions sur chaque vente, automatiquement.",
  },
  {
    id: "documents",
    icon: "file",
    title: "Centralisez vos documents",
    desc: "Bons de commande, factures et documents clients réunis au même endroit.",
  },
  {
    id: "reporting",
    icon: "chart",
    title: "Analysez vos performances",
    desc: "Des statistiques claires pour décider vite et vendre plus.",
  },
];

const ICONS = {
  users: (
    <>
      <path d="M16 19a4 4 0 0 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5.5 19a3 3 0 0 1 4-2.8M18.5 19a3 3 0 0 0-4-2.8" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3v4M12 17v4M5 12H1M23 12h-4M6.3 6.3 4 4M20 20l-2.3-2.3M17.7 6.3 20 4M4 20l2.3-2.3" />
      <path d="M12 9.5 13 12l2.5 1-2.5 1-1 2.5-1-2.5L8.5 13 11 12l1-2.5Z" />
    </>
  ),
  trending: (
    <>
      <path d="M3 17l6-6 4 4 7-7M21 8h-5M21 8v5" />
    </>
  ),
  car: (
    <>
      <path d="M5 11l1.5-4.5h11L19 11M4 16h16M5 16v2M19 16v2" />
      <path d="M4 11h16v5H4zM7.5 13.5h.01M16.5 13.5h.01" />
    </>
  ),
  calendar: (
    <>
      <path d="M4 6h16v14H4zM4 9h16M8 4v3M16 4v3M8 13h3M8 16h3" />
    </>
  ),
  percent: (
    <>
      <path d="M19 5 5 19M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM16.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h16M7 20v-6M12 20V8M17 20v-9" />
    </>
  ),
};

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

export default function Features() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".feat-card", {
          autoAlpha: 0,
          y: 28,
          rotateX: -12,
          transformOrigin: "center top",
          transformPerspective: 1000,
        });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
        });

        // Intelligent stagger across the bento grid (with a subtle 3D tilt).
        tl.to(".feat-card", {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
        });

        // Narrative detail inside the big cards.
        tl.from(
          ".kanban-card",
          { y: 12, autoAlpha: 0, stagger: 0.06, duration: 0.5, ease: "power2.out" },
          "-=0.35"
        ).from(
          ".ai-line",
          {
            scaleX: 0,
            transformOrigin: "left center",
            stagger: 0.1,
            duration: 0.45,
            ease: "power2.out",
          },
          "<"
        );

        // Subtle, slow pulse on the AI spark (decorative, paused for reduced motion).
        gsap.to(".ai-spark", {
          scale: 1.12,
          repeat: -1,
          yoyo: true,
          duration: 1.4,
          ease: "sine.inOut",
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
      id="features"
      ref={root}
      className="relative scroll-mt-20 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted">
            Fonctionnalités
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tightest text-ink sm:text-4xl">
            Tout ce qu’il faut pour vendre, au même endroit
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted">
            Fini Excel, WhatsApp et les notes papier. DriveOS réunit toute votre
            activité commerciale dans une seule plateforme pensée pour
            l’automobile.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {FEATURES.map((f) => (
            <article
              key={f.id}
              className={`feat-card group relative flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition-transform duration-300 will-change-transform hover:-translate-y-1 ${
                f.big ? "sm:col-span-2 lg:col-span-3" : "lg:col-span-2"
              }`}
            >
              <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-beige-light text-ink transition-colors group-hover:bg-ink group-hover:text-paper">
                <Icon name={f.icon} />
              </span>
              <h3 className="text-base font-semibold tracking-tight text-ink">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>

              {/* Narrative visual — CRM mini pipeline */}
              {f.id === "crm" && (
                <div className="mt-6 grid grid-cols-3 gap-2.5">
                  {[
                    { label: "Nouveau", n: 2, tone: "bg-beige-light" },
                    { label: "En cours", n: 2, tone: "bg-beige" },
                    { label: "Gagné", n: 1, tone: "bg-ink" },
                  ].map((col) => (
                    <div key={col.label} className="rounded-xl bg-paper p-2.5">
                      <div className="mb-2 flex items-center justify-between text-[11px] text-muted">
                        <span>{col.label}</span>
                        <span>{col.n}</span>
                      </div>
                      <div className="space-y-1.5">
                        {Array.from({ length: col.n }).map((_, i) => (
                          <div
                            key={i}
                            className="kanban-card rounded-md border border-line bg-white p-1.5"
                          >
                            <div className="mb-1 h-1.5 w-3/4 rounded-full bg-beige-dark/60" />
                            <div className={`h-1.5 w-1/2 rounded-full ${col.tone}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {f.id === "crm" && (
                <div className="mt-5">
                  <UpsellButton
                    label="Créer mes prospects en automatique"
                    plan="Pro"
                    icon="mail"
                  />
                </div>
              )}

              {/* Narrative visual — AI compose teaser */}
              {f.id === "ia" && (
                <div className="mt-6 rounded-xl bg-paper p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-medium text-ink">
                    <span className="ai-spark text-ink">
                      <Icon name="sparkles" />
                    </span>
                    Relance générée — Client Dupont
                  </div>
                  <div className="space-y-2">
                    <div className="ai-line h-2 w-[92%] rounded-full bg-beige" />
                    <div className="ai-line h-2 w-[78%] rounded-full bg-beige" />
                    <div className="ai-line h-2 w-[85%] rounded-full bg-beige" />
                    <div className="ai-line h-2 w-[40%] rounded-full bg-ink" />
                  </div>
                  <div className="mt-4">
                    <UpsellButton
                      label="Automatiser mes emails"
                      plan="Pro"
                      icon="bolt"
                    />
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Premium capability teasers — "traps to subscribe" */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-muted">Passez à la vitesse supérieure :</span>
          <UpsellButton
            label="Automatisation des emails"
            plan="Pro"
            icon="mail"
          />
          <UpsellButton
            label="Relances SMS & WhatsApp"
            plan="Business"
            icon="chat"
          />
          <UpsellButton
            label="IA de priorisation des prospects"
            plan="Pro"
            icon="target"
          />
        </div>
      </div>
    </section>
  );
}
