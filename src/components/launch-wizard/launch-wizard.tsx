"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CaretRight,
  CaretLeft,
  Check,
  Warning,
  CircleNotch,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { WizardProps, StepId, StepState } from "./types";
import { useWizard, STEP_ORDER } from "./use-wizard";
import { STEP_ICONS, renderStep } from "./wizard-steps";
import { PublishSequence } from "./publish-sequence";

const STATUS_DOT: Record<StepState["status"], string> = {
  idle: "bg-white/20",
  checking: "bg-blue-400 animate-pulse",
  complete: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-red-400",
  skipped: "bg-white/10",
};

export function LaunchWizard({
  schema,
  analysis,
  open,
  onOpenChange,
  onPublish,
  published,
}: WizardProps) {
  const wizard = useWizard(schema, analysis);
  const [publishing, setPublishing] = React.useState(false);
  const [publishedUrl, setPublishedUrl] = React.useState<string | null>(
    published ?? null
  );

  React.useEffect(() => {
    if (published) setPublishedUrl(published);
  }, [published]);

  async function handlePublish() {
    setPublishing(true);
    try {
      await onPublish();
    } finally {
      setPublishing(false);
    }
  }

  const currentStep = wizard.steps.find((s) => s.id === wizard.activeStep)!;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-2 z-50 flex overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98] sm:inset-4 lg:inset-8"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">
            Launch Wizard
          </DialogPrimitive.Title>

          {publishedUrl ? (
            <PublishSequence
              url={publishedUrl}
              brandName={schema.brand.name}
            />
          ) : (
            <>
              {/* Sidebar stepper */}
              <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-white/[0.02] lg:flex">
                <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
                    <span className="text-sm font-bold text-accent">R</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {schema.brand.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Launch Wizard
                    </p>
                  </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-3">
                  <ul className="space-y-0.5">
                    {STEP_ORDER.map(({ id, label }, i) => {
                      const step = wizard.steps.find((s) => s.id === id)!;
                      const Icon = STEP_ICONS[id];
                      const isActive = wizard.activeStep === id;
                      return (
                        <li key={id}>
                          <button
                            onClick={() => wizard.setActiveStep(id)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                              isActive
                                ? "bg-white/[0.08] text-foreground"
                                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                            )}
                          >
                            <Icon
                              weight={isActive ? "fill" : "bold"}
                              className={cn(
                                "h-4 w-4 shrink-0",
                                isActive
                                  ? "text-accent"
                                  : "text-muted-foreground"
                              )}
                            />
                            <span className="flex-1 truncate">{label}</span>
                            <span
                              className={cn(
                                "h-2 w-2 shrink-0 rounded-full",
                                STATUS_DOT[step.status]
                              )}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="border-t border-border p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Launch score
                    </span>
                    <span
                      className={cn(
                        "text-lg font-semibold tabular-nums",
                        wizard.launchScore.score >= 80
                          ? "text-emerald-400"
                          : wizard.launchScore.score >= 60
                            ? "text-amber-400"
                            : "text-red-400"
                      )}
                    >
                      {wizard.launchScore.score}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        wizard.launchScore.score >= 80
                          ? "bg-emerald-400"
                          : wizard.launchScore.score >= 60
                            ? "bg-amber-400"
                            : "bg-red-400"
                      )}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${wizard.launchScore.score}%`,
                      }}
                      transition={{
                        duration: 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    />
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <div className="flex min-w-0 flex-1 flex-col">
                {/* Top bar */}
                <header className="flex items-center justify-between border-b border-border px-6 py-3">
                  {/* Mobile step selector */}
                  <div className="flex items-center gap-3 lg:hidden">
                    <select
                      value={wizard.activeStep}
                      onChange={(e) =>
                        wizard.setActiveStep(e.target.value as StepId)
                      }
                      className="rounded-lg border border-border bg-transparent px-2 py-1 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {STEP_ORDER.map(({ id, label }) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
                    <span className="tabular-nums">
                      Step {wizard.activeIndex + 1}
                    </span>
                    <span>/</span>
                    <span className="tabular-nums">{STEP_ORDER.length}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {STEP_ORDER.map(({ id }, i) => {
                      const step = wizard.steps.find((s) => s.id === id)!;
                      return (
                        <button
                          key={id}
                          onClick={() => wizard.setActiveStep(id)}
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            wizard.activeStep === id
                              ? "w-6 bg-accent"
                              : "w-1.5",
                            wizard.activeStep !== id && STATUS_DOT[step.status]
                          )}
                          aria-label={`Go to ${STEP_ORDER[i].label}`}
                        />
                      );
                    })}
                  </div>

                  <DialogPrimitive.Close className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <X weight="bold" className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
                </header>

                {/* Step content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="mx-auto max-w-2xl px-6 py-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={wizard.activeStep}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.15 }}
                      >
                        {renderStep(
                          wizard.activeStep,
                          currentStep,
                          wizard.steps,
                          schema,
                          analysis,
                          wizard.canPublish,
                          publishing,
                          handlePublish
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom navigation */}
                <footer className="flex items-center justify-between border-t border-border px-6 py-3">
                  <button
                    onClick={wizard.goBack}
                    disabled={wizard.isFirstStep}
                    className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <CaretLeft weight="bold" className="h-3.5 w-3.5" />
                    Back
                  </button>

                  <div className="flex items-center gap-2">
                    {currentStep.status === "complete" && (
                      <span className="flex items-center gap-1.5 text-[13px] text-emerald-400">
                        <Check weight="bold" className="h-3.5 w-3.5" />
                        All checks passed
                      </span>
                    )}
                    {currentStep.status === "warning" && (
                      <span className="flex items-center gap-1.5 text-[13px] text-amber-400">
                        <Warning weight="fill" className="h-3.5 w-3.5" />
                        {
                          currentStep.checks.filter(
                            (c) => c.status === "warn"
                          ).length
                        }{" "}
                        warning
                        {currentStep.checks.filter((c) => c.status === "warn")
                          .length > 1
                          ? "s"
                          : ""}
                      </span>
                    )}
                  </div>

                  {!wizard.isLastStep ? (
                    <button
                      onClick={wizard.goNext}
                      className="flex items-center gap-1.5 rounded-full bg-white/[0.08] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.12]"
                    >
                      Continue
                      <CaretRight weight="bold" className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <div />
                  )}
                </footer>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
