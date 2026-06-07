"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Lock } from "lucide-react";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/plan";
import { cn } from "@/lib/utils";

const REASONS: Record<string, { title: string; sub: string }> = {
  quota: {
    title: "Vous avez utilisé vos analyses gratuites",
    sub: "Passez à un plan supérieur pour continuer à analyser sans limite mensuelle.",
  },
  pdfExport: {
    title: "L'export PDF est une fonction Pro",
    sub: "Exportez vos fiches d'investissement en un clic avec le plan Pro.",
  },
  comparisons: {
    title: "Les comparaisons sont une fonction Pro",
    sub: "Comparez automatiquement une entreprise à ses concurrents avec le plan Pro.",
  },
  default: {
    title: "Débloquez tout le potentiel de Valoryx",
    sub: "Analyses, comparaisons, exports et alertes IA — choisissez votre plan.",
  },
};

export function Paywall({
  open,
  reason,
  currentPlan,
  onClose,
  onChoose,
}: {
  open: boolean;
  reason?: string;
  currentPlan: PlanId;
  onClose: () => void;
  onChoose: (id: PlanId) => void;
}) {
  const copy = REASONS[reason ?? "default"] ?? REASONS.default;
  const offered = PLAN_ORDER.filter((p) => p !== "free");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/[0.1] bg-ink-850 shadow-elev"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[560px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg text-mist-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative px-6 pt-8 text-center sm:px-10">
              <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-accent/25 bg-accent/[0.08] px-3 py-1 text-2xs font-medium text-accent-soft">
                <Lock className="h-3 w-3" />
                Passez à la vitesse supérieure
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">{copy.title}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-mist-300">{copy.sub}</p>
            </div>

            <div className="relative grid gap-3 px-6 py-7 sm:grid-cols-3 sm:px-10">
              {offered.map((id) => {
                const plan = PLANS[id];
                const highlight = id === "pro";
                return (
                  <div
                    key={id}
                    className={cn(
                      "flex flex-col rounded-2xl border p-4",
                      highlight ? "border-accent/35 bg-accent/[0.07] shadow-glow" : "border-white/[0.08] bg-white/[0.02]",
                    )}
                  >
                    {highlight && (
                      <span className="mb-1.5 flex items-center gap-1 text-2xs font-semibold text-accent-soft">
                        <Sparkles className="h-3 w-3" /> Recommandé
                      </span>
                    )}
                    <p className="text-sm font-semibold text-white">{plan.label}</p>
                    <p className="num mt-1 text-2xl font-semibold text-white">
                      {plan.price}€<span className="text-xs font-normal text-mist-400">/mois</span>
                    </p>
                    <p className="mt-1 text-2xs text-mist-400">
                      {plan.quota === Infinity ? "Analyses illimitées" : `${plan.quota} analyses/mois`}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {featureList(id).map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-2xs text-mist-200">
                          <Check className="mt-px h-3 w-3 shrink-0 text-accent-soft" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => onChoose(id)}
                      disabled={id === currentPlan}
                      className={cn(
                        "mt-4 rounded-xl py-2 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40",
                        highlight ? "bg-white text-ink-950 hover:scale-[1.02]" : "border border-white/[0.12] bg-white/[0.03] text-white hover:bg-white/[0.07]",
                      )}
                    >
                      {id === currentPlan ? "Plan actuel" : `Choisir ${plan.label}`}
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="relative px-10 pb-6 text-center text-2xs text-mist-500">
              Démo : la sélection active le plan localement. En production, le paiement passe par Stripe.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function featureList(id: PlanId): string[] {
  switch (id) {
    case "starter":
      return ["10 analyses / mois", "Investment Score™ complet", "Résumé exécutif & analyse IA"];
    case "pro":
      return ["100 analyses / mois", "Comparaisons concurrents", "Exports PDF", "Alertes financements & résultats"];
    case "investor":
      return ["Analyses illimitées", "Watchlists illimitées", "Alertes IA avancées", "Valorisations avancées"];
    default:
      return [];
  }
}
