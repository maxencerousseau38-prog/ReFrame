"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Globe,
  Hash,
  Linkedin,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";
import { COMPANIES, searchCompanies } from "@/lib/data";
import { CRITERION_ORDER, CRITERION_META } from "@/lib/scoring";

const STEPS = [
  "Récupération des données légales (SIREN · INPI)",
  "Analyse des comptes : CA, EBITDA, résultat net",
  "Évaluation de la trésorerie et de la dette",
  "Cartographie du marché et de la concurrence",
  "Lecture des levées de fonds et de la valorisation",
  "Évaluation du management et des risques",
  "Calcul de l'Investment Score™ propriétaire",
];

export function AnalyzeFlow({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialQuery);
  const [website, setWebsite] = useState("");
  const [siren, setSiren] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [phase, setPhase] = useState<"form" | "analyzing">("form");
  const [step, setStep] = useState(0);
  const resolvedId = useRef<string | null>(null);

  const target = resolveTarget(name);

  const start = () => {
    setPhase("analyzing");
    setStep(0);
    resolvedId.current = null;
    // Kick off the real analysis in parallel with the progress animation.
    // Falls back to the fixture id if the API is unavailable.
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, website, siren, linkedin }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.id) resolvedId.current = d.id;
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (phase !== "analyzing") return;
    if (step >= STEPS.length) {
      const t = setTimeout(
        () => router.push(`/company/${resolvedId.current ?? target.id}`),
        650,
      );
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 620);
    return () => clearTimeout(t);
  }, [phase, step, router, target.id]);

  return (
    <div className="mx-auto max-w-2xl">
      <AnimatePresence mode="wait">
        {phase === "form" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center">
              <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-2xs text-mist-200">
                <Sparkles className="h-3.5 w-3.5 text-accent-soft" />
                Analyse en moins de 60 secondes
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white">
                Analyser une entreprise
              </h1>
              <p className="mt-2 text-sm text-mist-400">
                Renseignez ce que vous connaissez. Valoryx complète le reste.
              </p>
            </div>

            <div className="surface mt-8 space-y-4 p-6">
              <Field icon={Building2} label="Nom de l'entreprise" placeholder="Nimbus Energy" value={name} onChange={setName} autoFocus required />
              <Field icon={Globe} label="Site web" placeholder="nimbusenergy.io" value={website} onChange={setWebsite} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field icon={Hash} label="SIREN" placeholder="894 512 207" value={siren} onChange={setSiren} />
                <Field icon={Linkedin} label="URL LinkedIn" placeholder="linkedin.com/company/…" value={linkedin} onChange={setLinkedin} />
              </div>

              <button
                onClick={start}
                disabled={!name.trim()}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-ink-950 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                <Sparkles className="h-4 w-4" />
                Lancer l'analyse
              </button>
              <p className="text-center text-2xs text-mist-500">
                Décompte 1 analyse de votre quota mensuel · Plan Pro : 100/mois
              </p>
            </div>

            {/* Suggestions */}
            <div className="mt-6">
              <p className="eyebrow mb-2.5 text-center">Ou explorez une analyse existante</p>
              <div className="flex flex-wrap justify-center gap-2">
                {COMPANIES.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setName(c.name)}
                    className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-mist-200 transition-colors hover:border-accent/30 hover:text-white"
                  >
                    <span className="text-2xs font-semibold tracking-wide text-accent-soft">{c.logo}</span>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="surface p-8">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-ink-700 to-ink-800 text-lg font-semibold tracking-wide text-accent-soft">
                  {target.logo}
                </div>
                <div className="min-w-0">
                  <p className="eyebrow">Analyse en cours</p>
                  <h2 className="truncate text-xl font-semibold text-white">{name || target.name}</h2>
                </div>
                <div className="ml-auto">
                  <Loader2 className="h-5 w-5 animate-spin text-accent-soft" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent-soft"
                  animate={{ width: `${Math.min(100, (step / STEPS.length) * 100)}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>

              {/* Steps */}
              <ul className="mt-6 space-y-3">
                {STEPS.map((label, i) => {
                  const done = i < step;
                  const active = i === step;
                  return (
                    <li key={label} className="flex items-center gap-3">
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-2xs transition-colors ${
                          done
                            ? "border-bull/40 bg-bull/15 text-bull"
                            : active
                              ? "border-accent/40 bg-accent/15 text-accent-soft"
                              : "border-white/[0.08] text-mist-500"
                        }`}
                      >
                        {done ? <Check className="h-3 w-3" /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : i + 1}
                      </span>
                      <span className={`text-sm transition-colors ${done ? "text-mist-300" : active ? "text-white" : "text-mist-500"}`}>
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-6 text-center text-2xs text-mist-500">
                Valoryx croise données légales, financières et marché en temps réel.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  autoFocus,
  required,
}: {
  icon: any;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-mist-300">
        {label}
        {required && <span className="text-accent-soft">*</span>}
      </span>
      <div className="group relative flex items-center">
        <Icon className="pointer-events-none absolute left-3 h-4 w-4 text-mist-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-mist-500 outline-none transition-colors focus:border-accent/40 focus:bg-white/[0.05]"
        />
      </div>
    </label>
  );
}

function resolveTarget(name: string) {
  const matches = searchCompanies(name);
  return matches[0] ?? COMPANIES[0];
}
