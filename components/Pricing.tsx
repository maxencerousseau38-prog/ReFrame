"use client";

import { useRef, useState, Fragment } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

type Plan = {
  id: string;
  name: string;
  target: string;
  promise: string;
  monthly: number;
  annual: number; // prix mensuel facturé annuellement (-20 %)
  ia: string;
  cta: string;
  featured: boolean;
  includes: string | null;
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    target: "Pour le vendeur indépendant qui démarre",
    promise: "Ne perdez plus un seul client.",
    monthly: 29,
    annual: 23,
    ia: "IA Rédaction",
    cta: "Démarrer",
    featured: false,
    includes: null,
    features: [
      "Ajout manuel des clients",
      "CRM simple",
      "Gestion du stock de véhicules",
      "Agenda basique",
      "IA : emails, SMS & résumés clients",
      "Documents basiques",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    target: "Pour le garage qui veut arrêter de perdre des leads",
    promise: "Vos emails deviennent des prospects, automatiquement.",
    monthly: 79,
    annual: 63,
    ia: "IA Priorisation",
    cta: "Essayer gratuitement",
    featured: true,
    includes: "Tout Starter, plus",
    features: [
      "Connexion Gmail / Outlook",
      "Import automatique des emails clients",
      "Création automatique de prospects",
      "Synchronisation de l’historique des échanges",
      "IA de priorisation des prospects",
      "Suggestions intelligentes de relance",
      "Documents complets + reporting standard",
      "Marges visibles",
    ],
  },
  {
    id: "business",
    name: "Business",
    target: "Pour les équipes qui veulent automatiser leur cycle de vente",
    promise: "Vendez en pilote automatique.",
    monthly: 149,
    annual: 119,
    ia: "IA Pilote",
    cta: "Demander une démo",
    featured: false,
    includes: "Tout Pro, plus",
    features: [
      "Relances automatiques SMS & WhatsApp",
      "Détection des prospects inactifs ou perdus",
      "Automatisation des relances commerciales",
      "Assistant IA Pilote — il prépare, vous validez",
      "Reporting avancé (marges, vendeurs, leads)",
      "Insights IA",
    ],
  },
];

type Cell = boolean | string;
type Group = { title: string; rows: [string, Cell, Cell, Cell][] };

const COMPARISON: Group[] = [
  {
    title: "CRM & clients",
    rows: [
      ["Ajout manuel des clients", true, true, true],
      ["CRM", "Simple", "Complet", "Complet"],
      ["Gestion du stock de véhicules", true, true, true],
      ["Agenda", "Basique", "Standard", "Avancé"],
    ],
  },
  {
    title: "Communications & intégrations",
    rows: [
      ["Connexion Gmail / Outlook", false, true, true],
      ["Import automatique des emails", false, true, true],
      ["Création automatique de prospects", false, true, true],
      ["Synchronisation de l’historique", false, true, true],
      ["Multi-canal email, SMS & WhatsApp", false, false, true],
      ["Relances automatiques SMS & WhatsApp", false, false, true],
    ],
  },
  {
    title: "Intelligence (IA)",
    rows: [
      ["IA rédaction (emails, SMS, résumés)", true, true, true],
      ["IA de priorisation des prospects", false, true, true],
      ["Suggestions de relance", false, true, true],
      ["Détection des prospects inactifs", false, false, true],
      ["Assistant IA Pilote", false, false, true],
      ["Insights IA", false, false, true],
    ],
  },
  {
    title: "Documents & reporting",
    rows: [
      ["Documents clients", "Basiques", "Complets", "Complets"],
      ["Reporting", false, "Standard", "Avancé"],
      ["Marges", "Simples", "Visibles", "Détaillées"],
      ["Performance vendeurs", false, false, true],
      ["Analyse des leads", false, false, true],
    ],
  },
  {
    title: "Automatisation",
    rows: [["Automatisation des relances", false, false, true]],
  },
];

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="m5 12 4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Pricing() {
  const root = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [annual, setAnnual] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  // Reveal cards on scroll (runs once).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".price-card", { autoAlpha: 0, y: 28 });
        gsap.to(".price-card", {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
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

  // Animate prices when the billing period toggles.
  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>("[data-price]");
      const setVal = (el: HTMLElement, v: number) =>
        (el.textContent = String(Math.round(v)));
      const targetOf = (el: HTMLElement) =>
        annual ? +el.dataset.annual! : +el.dataset.monthly!;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        els.forEach((el) => {
          const obj = { v: parseInt(el.textContent || "0", 10) || 0 };
          gsap.to(obj, {
            v: targetOf(el),
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => setVal(el, obj.v),
          });
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        els.forEach((el) => setVal(el, targetOf(el)));
      });
    },
    { dependencies: [annual], scope: root }
  );

  // Smoothly expand / collapse the comparison table.
  useGSAP(
    () => {
      const el = tableRef.current;
      if (!el) return;
      const open = showCompare;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(el, {
          height: open ? "auto" : 0,
          autoAlpha: open ? 1 : 0,
          duration: 0.5,
          ease: "power2.inOut",
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { height: open ? "auto" : 0, autoAlpha: open ? 1 : 0 });
      });
    },
    { dependencies: [showCompare], scope: root }
  );

  const renderCell = (cell: Cell, featured = false) => {
    if (cell === true)
      return (
        <CheckIcon
          className={`mx-auto ${featured ? "text-ink" : "text-ink"}`}
        />
      );
    if (cell === false)
      return <span className="text-beige-dark">—</span>;
    return <span className="text-sm text-ink">{cell}</span>;
  };

  return (
    <section
      id="pricing"
      ref={root}
      className="relative scroll-mt-20 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted">
            Tarifs
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tightest text-ink sm:text-4xl">
            Un plan pour chaque étape de votre croissance
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted">
            Commencez simplement, automatisez quand vous êtes prêt.
            7 jours gratuits à l’inscription, sans engagement.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-8 flex items-center justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-line bg-white p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !annual ? "bg-ink text-paper" : "text-muted hover:text-ink"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                annual ? "bg-ink text-paper" : "text-muted hover:text-ink"
              }`}
            >
              Annuel
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                  annual ? "bg-paper/20 text-paper" : "bg-beige-light text-ink"
                }`}
              >
                −20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          {PLANS.map((plan) => {
            const featured = plan.featured;
            return (
              <div
                key={plan.id}
                className={`price-card group relative flex flex-col rounded-2xl border p-7 transition-transform duration-300 will-change-transform hover:-translate-y-1.5 ${
                  featured
                    ? "border-ink bg-ink text-paper shadow-glass lg:-mt-4 lg:mb-4 lg:scale-[1.03]"
                    : "border-line bg-white text-ink shadow-card"
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-beige px-3 py-1 text-xs font-semibold text-ink">
                    Recommandé
                  </span>
                )}

                {/* IA badge */}
                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    featured
                      ? "bg-paper/10 text-paper"
                      : "bg-beige-light text-ink"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {plan.ia}
                </span>

                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  {plan.name}
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    featured ? "text-paper/60" : "text-muted"
                  }`}
                >
                  {plan.target}
                </p>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">
                    €
                    <span data-price data-monthly={plan.monthly} data-annual={plan.annual}>
                      {plan.monthly}
                    </span>
                  </span>
                  <span
                    className={`text-sm ${
                      featured ? "text-paper/60" : "text-muted"
                    }`}
                  >
                    /mois
                  </span>
                </div>
                <p
                  className={`mt-1 text-xs ${
                    featured ? "text-paper/50" : "text-muted"
                  }`}
                >
                  {annual ? "facturé annuellement" : "facturé mensuellement"}
                </p>

                {/* Promise */}
                <p
                  className={`mt-5 text-sm font-medium ${
                    featured ? "text-paper" : "text-ink"
                  }`}
                >
                  {plan.promise}
                </p>

                {/* CTA */}
                <a
                  href="#"
                  className={`mt-5 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-95 ${
                    featured
                      ? "bg-paper text-ink"
                      : "bg-ink text-paper"
                  }`}
                >
                  {plan.cta}
                </a>
                <p
                  className={`mt-2 text-center text-xs ${
                    featured ? "text-paper/50" : "text-muted"
                  }`}
                >
                  7 jours gratuits à l’inscription
                </p>

                {/* Features */}
                <div
                  className={`mt-7 border-t pt-6 ${
                    featured ? "border-paper/15" : "border-line"
                  }`}
                >
                  {plan.includes && (
                    <p
                      className={`mb-4 text-xs font-semibold uppercase tracking-wider ${
                        featured ? "text-paper/60" : "text-muted"
                      }`}
                    >
                      {plan.includes}
                    </p>
                  )}
                  <ul className="space-y-3 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckIcon
                          className={`mt-0.5 shrink-0 ${
                            featured ? "text-paper" : "text-ink"
                          }`}
                        />
                        <span
                          className={featured ? "text-paper/90" : "text-ink/80"}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassurance + compare toggle */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-sm text-muted">
            7 jours gratuits après inscription · Sans carte bancaire · Sans
            engagement
          </p>
          <button
            onClick={() => setShowCompare((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-muted"
            aria-expanded={showCompare}
          >
            {showCompare ? "Masquer le comparatif" : "Comparer les plans en détail"}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className={`transition-transform duration-300 ${
                showCompare ? "rotate-180" : ""
              }`}
            >
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Comparison table (collapsible) */}
        <div
          ref={tableRef}
          className="overflow-hidden"
          style={{ height: 0, opacity: 0 }}
        >
          <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="p-4 text-sm font-medium text-muted">
                    Fonctionnalités
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      className={`p-4 text-center text-sm font-semibold ${
                        p.featured ? "bg-beige-light text-ink" : "text-ink"
                      }`}
                    >
                      {p.name}
                      <span className="block text-xs font-normal text-muted">
                        €{annual ? p.annual : p.monthly}/mois
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((group) => (
                  <Fragment key={group.title}>
                    <tr className="bg-paper/60">
                      <td
                        colSpan={4}
                        className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted"
                      >
                        {group.title}
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr
                        key={row[0]}
                        className="border-b border-line/60 last:border-0"
                      >
                        <td className="p-4 text-sm text-ink/80">{row[0]}</td>
                        <td className="p-4 text-center">{renderCell(row[1])}</td>
                        <td className="bg-beige-light/40 p-4 text-center">
                          {renderCell(row[2], true)}
                        </td>
                        <td className="p-4 text-center">{renderCell(row[3])}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enterprise line */}
        <p className="mt-10 text-center text-sm text-muted">
          Vous gérez un groupe ou un réseau de concessions ?{" "}
          <a href="#" className="font-medium text-ink underline-offset-4 hover:underline">
            Parlons de votre projet
          </a>
        </p>
      </div>
    </section>
  );
}
