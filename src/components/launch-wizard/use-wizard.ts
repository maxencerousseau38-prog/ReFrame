"use client";

import * as React from "react";
import type { SiteSchema, SiteAnalysis } from "@/lib/generation/types";
import type { StepId, StepState, CheckItem } from "./types";
import {
  runSeoChecks,
  runPerformanceChecks,
  runAccessibilityChecks,
  runFormChecks,
  runAnalyticsChecks,
  runIntegrationChecks,
  runPaymentChecks,
  runDomainChecks,
  runSslChecks,
  computeLaunchScore,
} from "./checks";

const STEP_ORDER: { id: StepId; label: string }[] = [
  { id: "domain", label: "Domain" },
  { id: "ssl", label: "SSL" },
  { id: "integrations", label: "Integrations" },
  { id: "payments", label: "Payments" },
  { id: "forms", label: "Forms" },
  { id: "analytics", label: "Analytics" },
  { id: "seo", label: "SEO" },
  { id: "performance", label: "Performance" },
  { id: "accessibility", label: "Accessibility" },
  { id: "review", label: "Review" },
];

export { STEP_ORDER };

function deriveStatus(checks: CheckItem[]): StepState["status"] {
  if (!checks.length) return "idle";
  if (checks.some((c) => c.status === "fail")) return "error";
  if (checks.some((c) => c.status === "warn")) return "warning";
  return "complete";
}

function runChecks(
  stepId: StepId,
  schema: SiteSchema,
  analysis: SiteAnalysis | null
): CheckItem[] {
  switch (stepId) {
    case "domain":
      return runDomainChecks();
    case "ssl":
      return runSslChecks();
    case "integrations":
      return runIntegrationChecks(schema, analysis);
    case "payments":
      return runPaymentChecks(schema, analysis);
    case "forms":
      return runFormChecks(schema, analysis);
    case "analytics":
      return runAnalyticsChecks(schema, analysis);
    case "seo":
      return runSeoChecks(schema, analysis);
    case "performance":
      return runPerformanceChecks(schema);
    case "accessibility":
      return runAccessibilityChecks(schema, analysis);
    case "review":
      return [];
  }
}

export function useWizard(schema: SiteSchema, analysis: SiteAnalysis | null) {
  const [activeStep, setActiveStep] = React.useState<StepId>("seo");
  const [steps, setSteps] = React.useState<StepState[]>(() =>
    STEP_ORDER.map(({ id, label }) => ({
      id,
      label,
      status: "idle" as const,
      checks: [],
    }))
  );

  React.useEffect(() => {
    setSteps(
      STEP_ORDER.map(({ id, label }) => {
        const checks = runChecks(id, schema, analysis);
        return { id, label, status: deriveStatus(checks), checks };
      })
    );
  }, [schema, analysis]);

  const activeIndex = STEP_ORDER.findIndex((s) => s.id === activeStep);

  const goNext = React.useCallback(() => {
    const idx = STEP_ORDER.findIndex((s) => s.id === activeStep);
    if (idx < STEP_ORDER.length - 1) setActiveStep(STEP_ORDER[idx + 1].id);
  }, [activeStep]);

  const goBack = React.useCallback(() => {
    const idx = STEP_ORDER.findIndex((s) => s.id === activeStep);
    if (idx > 0) setActiveStep(STEP_ORDER[idx - 1].id);
  }, [activeStep]);

  const updateStep = React.useCallback(
    (id: StepId, checks: CheckItem[]) => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, checks, status: deriveStatus(checks) } : s
        )
      );
    },
    []
  );

  const allChecks = steps.flatMap((s) => s.checks);
  const launchScore = computeLaunchScore(allChecks);
  const hasBlockingErrors = steps.some(
    (s) => s.status === "error" && s.id !== "review"
  );

  return {
    steps,
    activeStep,
    activeIndex,
    setActiveStep,
    goNext,
    goBack,
    updateStep,
    launchScore,
    canPublish: !hasBlockingErrors,
    isFirstStep: activeIndex === 0,
    isLastStep: activeIndex === STEP_ORDER.length - 1,
  };
}
