"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, X, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { runRedesignAnalysis } from "@/app/(dashboard)/actions";
import type { RedesignAnalysis } from "@/lib/ai/generate-redesign";
import { Button } from "@/components/ui/button";

const STEPS = [
  "Récupération de votre site actuel…",
  "Analyse de la structure et du contenu…",
  "Génération de la version moderne…",
  "Préparation de l'aperçu avant/après…",
];

/**
 * Flux d'analyse + génération avant/après (MOCK).
 * L'appel réel à l'IA est stubé côté serveur (lib/ai/generate-redesign).
 */
export function AnalysisFlow({ siteId }: { siteId: string }) {
  const router = useRouter();
  const [phase, setPhase] = React.useState<"idle" | "running" | "done">("idle");
  const [stepIndex, setStepIndex] = React.useState(0);
  const [analysis, setAnalysis] = React.useState<RedesignAnalysis | null>(null);

  const start = async () => {
    setPhase("running");
    setStepIndex(0);
    // Anime la progression des étapes pendant le traitement serveur.
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 500);

    const result = await runRedesignAnalysis(siteId);
    clearInterval(interval);

    if (result.success && result.analysis) {
      setStepIndex(STEPS.length - 1);
      setAnalysis(result.analysis);
      setPhase("done");
      router.refresh();
    } else {
      toast.error(!result.success ? result.error : "Échec de l'analyse.");
      setPhase("idle");
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 to-transparent p-6 sm:p-8">
      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Sparkles className="size-5" />
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">
              Votre avant/après est prêt à être généré
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Lancez l'analyse de votre site actuel. On vous prépare une version moderne en
              quelques secondes. Vous pourrez ensuite tout ajuster depuis l'éditeur.
            </p>
            <Button onClick={start} className="mt-6">
              <Sparkles className="size-4" /> Lancer l'analyse
            </Button>
          </motion.div>
        )}

        {phase === "running" && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Loader2 className="size-5 animate-spin" />
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">Analyse en cours…</h2>
            <ul className="mt-6 space-y-3">
              {STEPS.map((step, i) => (
                <li key={step} className="flex items-center gap-3 text-sm">
                  {i < stepIndex ? (
                    <Check className="size-4 text-brand" />
                  ) : i === stepIndex ? (
                    <Loader2 className="size-4 animate-spin text-brand" />
                  ) : (
                    <span className="size-4 rounded-full border border-border" />
                  )}
                  <span
                    className={i <= stepIndex ? "text-foreground" : "text-muted-foreground"}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {phase === "done" && analysis && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Check className="size-5" />
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">Votre refonte est prête</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-destructive">Avant</p>
                <p className="mt-1 text-3xl font-semibold">{analysis.scoreBefore}/100</p>
                <ul className="mt-3 space-y-1.5">
                  {analysis.issues.slice(0, 3).map((it) => (
                    <li key={it} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <X className="mt-0.5 size-3.5 shrink-0 text-destructive" /> {it}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
                <p className="text-sm font-medium text-brand">Après · Vitrio</p>
                <p className="mt-1 text-3xl font-semibold">{analysis.scoreAfter}/100</p>
                <ul className="mt-3 space-y-1.5">
                  {analysis.improvements.slice(0, 3).map((it) => (
                    <li key={it} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-brand" /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Button asChild className="mt-6">
              <a href="/dashboard/editeur">
                Personnaliser mon site <ArrowRight className="size-4" />
              </a>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
