"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Sparkles, AlertCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { AnalyzeLoader } from "@/components/dashboard/analyze-loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveAnalysis, saveSchema } from "@/lib/store";
import type { SiteAnalysis, SiteSchema } from "@/lib/generation/types";

type Phase = "idle" | "analyzing" | "result" | "generating";

function DashboardInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [url, setUrl] = React.useState("");
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [analysis, setAnalysis] = React.useState<SiteAnalysis | null>(null);
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
        body: JSON.stringify({ analysis }),
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
          <Badge variant="glow" className="mb-3">
            <Sparkles className="h-3 w-3" /> New project
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Revive a website</h1>
          <p className="mt-2 text-muted-foreground">
            Paste any URL. We&apos;ll analyze it and rebuild it into a premium site.
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
            <Globe className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
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
            variant="gradient"
            disabled={phase === "analyzing" || phase === "generating" || !url.trim()}
          >
            Analyze <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {/* States */}
        {(phase === "analyzing" || phase === "generating") && (
          <div className="mt-16">
            <AnalyzeLoader done={phase === "generating"} />
          </div>
        )}

        {phase === "result" && analysis && (
          <AnalysisResult analysis={analysis} onGenerate={runGenerate} />
        )}
      </div>
    </DashboardShell>
  );
}

function AnalysisResult({
  analysis,
  onGenerate,
}: {
  analysis: SiteAnalysis;
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
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline">{analysis.industryLabel}</Badge>
        <span className="text-sm text-muted-foreground">
          Analyzed <span className="font-medium text-foreground">{analysis.url}</span>
        </span>
      </div>

      {/* Scores */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {scores.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-semibold">{value}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={value < 50 ? "h-full bg-red-400" : value < 75 ? "h-full bg-amber-400" : "h-full bg-emerald-400"}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Extracted content */}
        <div className="rounded-2xl border border-border bg-card p-6">
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
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold">What we&apos;ll fix</h3>
          <ul className="mt-4 space-y-2.5">
            {analysis.issues.map((issue) => (
              <li key={issue} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg" variant="gradient" onClick={onGenerate}>
          Generate premium site <Sparkles className="h-4 w-4" />
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
