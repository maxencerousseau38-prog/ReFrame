"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Sparkle, Warning } from "@phosphor-icons/react";
import { DashboardShell } from "@/components/dashboard/shell";
import { AnalyzeLoader } from "@/components/dashboard/analyze-loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveAnalysis, saveSchema } from "@/lib/store";
import type { SiteAnalysis, SiteSchema, GenerationMode } from "@/lib/generation/types";

type Phase = "idle" | "analyzing" | "result" | "generating";

const MODES: { id: GenerationMode; label: string; desc: string }[] = [
  { id: "smart", label: "Smart", desc: "Keep the structure, then optimize it for conversion." },
  { id: "preserve", label: "Preserve", desc: "Keep the exact architecture, upgrade the design." },
  { id: "classic", label: "Classic", desc: "Rebuild the best possible site from scratch." },
];

function DashboardInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [url, setUrl] = React.useState("");
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [analysis, setAnalysis] = React.useState<SiteAnalysis | null>(null);
  const [mode, setMode] = React.useState<GenerationMode>("smart");
  const [error, setError] = React.useState<string | null>(null);

  // Auto-run if the landing page handed us a ?url=
  React.useEffect(() => {
    const incoming = params.get("url");
    if (incoming) {
      setUrl(incoming);
      void runAnalyze(incoming);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAnalyze(target: string) {
    setError(null);
    setPhase("analyzing");
    try {
      const res = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      // keep the loader visible long enough to feel intentional
      await new Promise((r) => setTimeout(r, 1200));
      setAnalysis(data.analysis);
      saveAnalysis(data.analysis);
      setPhase("result");
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
      setPhase("idle");
    }
  }

  async function runGenerate() {
    if (!analysis) return;
    setPhase("generating");
    try {
      const res = await fetch("/api/generate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      await new Promise((r) => setTimeout(r, 1400));
      saveSchema(data.schema as SiteSchema);
      router.push("/result");
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
      setPhase("result");
    }
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-16">
        <div className="mb-10">
          <Badge variant="outline" className="mb-3">
            <Sparkle weight="fill" className="h-3 w-3" /> New project
          </Badge>
          <h1 className="text-4xl font-semibold tracking-[-0.02em]">Transform a website</h1>
          <p className="mt-3 text-muted-foreground">
            Paste your URL. ReFrame analyzes your existing site and rebuilds it into a modern version.
          </p>
        </div>

        {/* URL input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (url.trim()) void runAnalyze(url.trim());
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Globe weight="bold" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yourwebsite.com"
              disabled={phase === "analyzing" || phase === "generating"}
              className="h-12 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-[15px] shadow-sm transition-all focus:border-foreground/20 focus:outline-none focus:ring-4 focus:ring-foreground/5"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            variant="light"
            disabled={phase === "analyzing" || phase === "generating" || !url.trim()}
          >
            Analyze <ArrowRight weight="bold" className="h-4 w-4" />
          </Button>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <Warning weight="bold" className="h-4 w-4" /> {error}
          </div>
        )}

        {/* States */}
        {(phase === "analyzing" || phase === "generating") && (
          <div className="mt-16">
            <AnalyzeLoader done={phase === "generating"} />
          </div>
        )}

        {phase === "result" && analysis && (
          <AnalysisResult
            analysis={analysis}
            mode={mode}
            onMode={setMode}
            onGenerate={runGenerate}
          />
        )}
      </div>
    </DashboardShell>
  );
}

function AnalysisResult({
  analysis,
  mode,
  onMode,
  onGenerate,
}: {
  analysis: SiteAnalysis;
  mode: GenerationMode;
  onMode: (m: GenerationMode) => void;
  onGenerate: () => void;
}) {
  const scores = Object.entries(analysis.scores) as [string, number][];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12 space-y-8"
    >
      {/* Brand row: logo, name, accent, crawl status */}
      <div className="flex flex-wrap items-center gap-3">
        {analysis.brand?.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={analysis.brand.logoUrl}
            alt={`${analysis.brandName} logo`}
            className="h-9 w-9 rounded-lg border border-border bg-white object-contain p-1"
          />
        )}
        <span className="text-base font-semibold">{analysis.brandName}</span>
        <Badge variant="outline">{analysis.industryLabel}</Badge>
        {analysis.brand?.accentColor && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
            <span className="h-3 w-3 rounded-full" style={{ background: analysis.brand.accentColor }} />
            {analysis.brand.accentColor}
          </span>
        )}
        <Badge variant="outline">
          {analysis.fetched ? "Live crawl" : "Estimated (could not fetch)"}
        </Badge>
      </div>

      {/* Extracted images */}
      {analysis.extractedContent.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {analysis.extractedContent.images.slice(0, 5).map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className="h-24 w-36 shrink-0 rounded-xl border border-border object-cover"
            />
          ))}
        </div>
      )}

      {/* Scores */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {scores.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)]">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight">{value}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-white/85"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Extracted content */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)]">
          <h3 className="text-sm font-semibold">Extracted content</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Headline</dt>
              <dd className="font-medium">{analysis.extractedContent.headline}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Description</dt>
              <dd>{analysis.extractedContent.description}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Detected services</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {analysis.extractedContent.services.map((s) => (
                  <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-xs">{s}</span>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        {/* Issues */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)]">
          <h3 className="text-sm font-semibold">What we fix</h3>
          <ul className="mt-4 space-y-2.5">
            {analysis.issues.map((issue) => (
              <li key={issue} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Warning weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Generation mode */}
      <div>
        <h3 className="text-sm font-semibold">How should ReFrame rebuild it?</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {MODES.map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onMode(m.id)}
                aria-pressed={active}
                className={
                  "rounded-2xl border p-4 text-left transition-colors " +
                  (active
                    ? "border-accent/50 bg-accent/[0.06] ring-1 ring-inset ring-accent/30"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20")
                }
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{m.label}</span>
                  <span
                    className={
                      "h-3.5 w-3.5 rounded-full border " +
                      (active ? "border-accent bg-accent" : "border-white/25")
                    }
                  />
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg" variant="light" onClick={onGenerate}>
          Transform my site <Sparkle weight="fill" className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardInner />
    </Suspense>
  );
}
