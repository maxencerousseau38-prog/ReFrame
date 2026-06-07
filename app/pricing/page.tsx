import { Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Reveal } from "@/components/ui/Reveal";
import { PlanCTA } from "@/components/app/PlanCTA";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "starter" as const,
    name: "Starter",
    price: 29,
    tagline: "Pour explorer et tester des opportunités.",
    cta: "Choisir Starter",
    features: [
      "10 analyses par mois",
      "Investment Score™ complet",
      "Résumé exécutif & analyse IA",
      "Visualisations financières",
      "1 watchlist",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 99,
    tagline: "Pour les investisseurs actifs et business angels.",
    cta: "Choisir Pro",
    highlight: true,
    features: [
      "100 analyses par mois",
      "Comparaisons concurrentielles",
      "Exports PDF illimités",
      "5 watchlists",
      "Alertes financements & résultats",
      "Historique complet",
    ],
  },
  {
    id: "investor" as const,
    name: "Investor",
    price: 299,
    tagline: "Pour les fonds et family offices exigeants.",
    cta: "Choisir Investor",
    features: [
      "Analyses illimitées",
      "Watchlists illimitées",
      "Alertes IA avancées en temps réel",
      "Valorisations avancées (DCF, multiples)",
      "Détection d'opportunités proactive",
      "Accès API & exports data",
      "Support prioritaire dédié",
    ],
  },
];

export default function PricingPage() {
  return (
    <AppShell title="Abonnement">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent-soft" />
            Tarifs
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Un plan pour chaque thèse d'investissement
          </h1>
          <p className="mt-3 text-mist-300">
            De l'exploration ponctuelle au déploiement de plusieurs millions. Changez ou annulez à tout moment.
          </p>
        </div>
      </Reveal>

      <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-3">
        {PLANS.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 0.07}>
            <div
              className={cn(
                "relative flex h-full flex-col rounded-3xl border p-6 sm:p-7",
                plan.highlight
                  ? "border-accent/35 bg-gradient-to-b from-accent/[0.1] to-ink-850/80 shadow-glow"
                  : "border-white/[0.08] bg-ink-850/60",
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-2xs font-semibold text-white shadow-glow">
                  Le plus populaire
                </span>
              )}
              <h2 className="text-sm font-semibold uppercase tracking-wide text-mist-200">{plan.name}</h2>
              <div className="mt-3 flex items-end gap-1">
                <span className="num text-4xl font-semibold tracking-tight text-white">{plan.price}€</span>
                <span className="mb-1 text-sm text-mist-400">/mois</span>
              </div>
              <p className="mt-2 text-sm text-mist-300">{plan.tagline}</p>

              <PlanCTA id={plan.id} label={plan.cta} highlight={plan.highlight} />

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-mist-200">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent/15">
                      <Check className="h-2.5 w-2.5 text-accent-soft" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <p className="mx-auto mt-10 max-w-xl text-center text-2xs text-mist-500">
          Paiement sécurisé · Facturation mensuelle ou annuelle (-20%) · TVA applicable. Valoryx fournit des analyses à titre informatif et ne constitue pas un conseil en investissement réglementé.
        </p>
      </Reveal>
    </AppShell>
  );
}
