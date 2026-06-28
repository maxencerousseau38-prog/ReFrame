"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Warning,
  X,
  Info,
  Globe,
  LockKey,
  Plugs,
  CreditCard,
  EnvelopeSimple,
  ChartBar,
  MagnifyingGlass,
  Gauge,
  Eye,
  RocketLaunch,
  CircleNotch,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import type { CheckItem, CheckStatus, StepId } from "./types";
import type { SiteSchema, SiteAnalysis } from "@/lib/generation/types";
import type { StepState } from "./types";
import { computeLaunchScore } from "./checks";

export const STEP_ICONS: Record<StepId, React.ElementType> = {
  domain: Globe,
  ssl: LockKey,
  integrations: Plugs,
  payments: CreditCard,
  forms: EnvelopeSimple,
  analytics: ChartBar,
  seo: MagnifyingGlass,
  performance: Gauge,
  accessibility: Eye,
  review: RocketLaunch,
};

const STATUS_ICON: Record<CheckStatus, React.ReactNode> = {
  pass: <Check weight="bold" className="h-3.5 w-3.5 text-emerald-400" />,
  warn: <Warning weight="fill" className="h-3.5 w-3.5 text-amber-400" />,
  fail: <X weight="bold" className="h-3.5 w-3.5 text-red-400" />,
  info: <Info weight="fill" className="h-3.5 w-3.5 text-blue-400" />,
};

const STATUS_RING: Record<CheckStatus, string> = {
  pass: "border-emerald-500/30 bg-emerald-500/10",
  warn: "border-amber-500/30 bg-amber-500/10",
  fail: "border-red-500/30 bg-red-500/10",
  info: "border-blue-500/30 bg-blue-500/10",
};

function CheckList({ checks }: { checks: CheckItem[] }) {
  return (
    <ul className="space-y-2">
      {checks.map((c, i) => (
        <motion.li
          key={c.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.2 }}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${STATUS_RING[c.status]}`}
        >
          <span className="mt-0.5 shrink-0">{STATUS_ICON[c.status]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{c.label}</p>
            {c.detail && (
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {c.detail}
              </p>
            )}
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

function StepShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function StepDomain({ step }: { step: StepState }) {
  return (
    <StepShell
      title="Domain"
      description="Your site will be available on a ReFrame subdomain. Custom domains can be connected after publishing."
    >
      <div className="rounded-xl border border-border bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Globe weight="bold" className="h-5 w-5 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">ReFrame subdomain</p>
            <p className="text-[13px] text-muted-foreground">
              Included free with every site
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            Ready
          </span>
        </div>
      </div>
      <div className="rounded-xl border border-dashed border-border bg-white/[0.02] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
            <Globe weight="bold" className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              Custom domain
            </p>
            <p className="text-[13px] text-muted-foreground">
              Connect your own domain after publishing
            </p>
          </div>
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            Post-launch
          </span>
        </div>
      </div>
      <CheckList checks={step.checks} />
    </StepShell>
  );
}

export function StepSsl({ step }: { step: StepState }) {
  return (
    <StepShell
      title="SSL & Security"
      description="All ReFrame sites include automatic HTTPS encryption and security headers."
    >
      <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
          <LockKey weight="fill" className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-300">
            Fully secured
          </p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            TLS 1.3, auto-renewing certificate, HSTS headers
          </p>
        </div>
      </div>
      <CheckList checks={step.checks} />
    </StepShell>
  );
}

export function StepIntegrations({
  step,
  schema,
  analysis,
}: {
  step: StepState;
  schema: SiteSchema;
  analysis: SiteAnalysis | null;
}) {
  const detected = analysis?.integrations ?? [];

  return (
    <StepShell
      title="Business Integrations"
      description={
        detected.length
          ? `We found ${detected.length} tool${detected.length > 1 ? "s" : ""} on your current site. Reconnect them so they keep working.`
          : "No third-party integrations detected on your site."
      }
    >
      {detected.length > 0 && (
        <div className="space-y-2">
          {detected.map((d) => {
            const connected = schema.connectedIntegrations?.find(
              (c) => c.id === d.id
            );
            return (
              <div
                key={d.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  connected?.value
                    ? "border-emerald-500/20 bg-emerald-500/[0.05]"
                    : "border-amber-500/20 bg-amber-500/[0.05]"
                }`}
              >
                <Plugs
                  weight="bold"
                  className={`h-4 w-4 shrink-0 ${connected?.value ? "text-emerald-400" : "text-amber-400"}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-[12px] text-muted-foreground">{d.hint}</p>
                </div>
                {connected?.value ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                    <Check weight="bold" className="h-3 w-3" /> Connected
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                    Not connected
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
      <CheckList checks={step.checks} />
    </StepShell>
  );
}

export function StepPayments({
  step,
  schema,
  analysis,
}: {
  step: StepState;
  schema: SiteSchema;
  analysis: SiteAnalysis | null;
}) {
  const paymentTools =
    analysis?.integrations?.filter((i) => i.category === "payments") ?? [];

  return (
    <StepShell
      title="Payments"
      description={
        paymentTools.length
          ? "Reconnect your payment provider so customers can still pay."
          : "No payment system was detected on your current site."
      }
    >
      {paymentTools.length > 0 ? (
        <div className="space-y-2">
          {paymentTools.map((p) => {
            const connected = schema.connectedIntegrations?.find(
              (c) => c.id === p.id
            );
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  connected?.value
                    ? "border-emerald-500/20 bg-emerald-500/[0.05]"
                    : "border-red-500/20 bg-red-500/[0.05]"
                }`}
              >
                <CreditCard
                  weight="bold"
                  className={`h-4 w-4 ${connected?.value ? "text-emerald-400" : "text-red-400"}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-[12px] text-muted-foreground">{p.hint}</p>
                </div>
                {connected?.value ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                    <Check weight="bold" className="h-3 w-3" /> Connected
                  </span>
                ) : (
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-300">
                    Action needed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white/[0.03] p-6 text-center">
          <CreditCard
            weight="bold"
            className="mx-auto h-8 w-8 text-muted-foreground"
          />
          <p className="mt-3 text-sm text-muted-foreground">
            No payment provider needed for your site
          </p>
        </div>
      )}
      <CheckList checks={step.checks} />
    </StepShell>
  );
}

export function StepForms({ step }: { step: StepState }) {
  return (
    <StepShell
      title="Contact Forms"
      description="Verify your contact form is properly configured to receive submissions."
    >
      <CheckList checks={step.checks} />
    </StepShell>
  );
}

export function StepAnalytics({
  step,
  schema,
}: {
  step: StepState;
  schema: SiteSchema;
}) {
  const connected = schema.connectedIntegrations ?? [];
  const hasGa = connected.some(
    (c) => c.id === "google-analytics" || c.id === "ga4"
  );

  return (
    <StepShell
      title="Analytics"
      description="Connect your analytics tools to track visitor behavior on your new site."
    >
      {!hasGa && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
          <div className="flex items-start gap-3">
            <ChartBar
              weight="bold"
              className="mt-0.5 h-5 w-5 text-amber-400"
            />
            <div>
              <p className="text-sm font-medium text-amber-200">
                No analytics connected
              </p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Without analytics, you won&apos;t know how many visitors your
                new site gets. Reconnect from the integrations panel before
                publishing.
              </p>
            </div>
          </div>
        </div>
      )}
      <CheckList checks={step.checks} />
    </StepShell>
  );
}

export function StepSeo({ step }: { step: StepState }) {
  return (
    <StepShell
      title="SEO"
      description="Search engine optimization ensures your site ranks well on Google."
    >
      <CheckList checks={step.checks} />
    </StepShell>
  );
}

export function StepPerformance({ step }: { step: StepState }) {
  return (
    <StepShell
      title="Performance"
      description="Fast sites rank higher and convert better. Here's how your build performs."
    >
      <CheckList checks={step.checks} />
    </StepShell>
  );
}

export function StepAccessibility({ step }: { step: StepState }) {
  return (
    <StepShell
      title="Accessibility"
      description="Making your site usable by everyone, including people with disabilities."
    >
      <CheckList checks={step.checks} />
    </StepShell>
  );
}

export function StepReview({
  steps,
  schema,
  canPublish,
  publishing,
  onPublish,
}: {
  steps: StepState[];
  schema: SiteSchema;
  canPublish: boolean;
  publishing: boolean;
  onPublish: () => void;
}) {
  const allChecks = steps
    .filter((s) => s.id !== "review")
    .flatMap((s) => s.checks);
  const { score, pass, warn, fail } = computeLaunchScore(allChecks);

  const scoreColor =
    score >= 80
      ? "text-emerald-400"
      : score >= 60
        ? "text-amber-400"
        : "text-red-400";
  const ringColor =
    score >= 80
      ? "stroke-emerald-400"
      : score >= 60
        ? "stroke-amber-400"
        : "stroke-red-400";

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <StepShell
      title="Launch Review"
      description="Final summary of your site's readiness."
    >
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-white/[0.03] p-8">
        <div className="relative">
          <svg width="128" height="128" className="-rotate-90">
            <circle
              cx="64"
              cy="64"
              r="54"
              fill="none"
              stroke="hsl(0 0% 100% / 0.08)"
              strokeWidth="8"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="54"
              fill="none"
              className={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`text-3xl font-semibold tabular-nums ${scoreColor}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              {score}
            </motion.span>
            <span className="text-[11px] text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold">
            {score >= 90
              ? "Ready to launch"
              : score >= 70
                ? "Almost ready"
                : "Needs attention"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {schema.brand.name}
          </p>
        </div>

        <div className="flex gap-6">
          <div className="text-center">
            <span className="text-xl font-semibold tabular-nums text-emerald-400">
              {pass}
            </span>
            <p className="text-[11px] text-muted-foreground">Passed</p>
          </div>
          <div className="text-center">
            <span className="text-xl font-semibold tabular-nums text-amber-400">
              {warn}
            </span>
            <p className="text-[11px] text-muted-foreground">Warnings</p>
          </div>
          <div className="text-center">
            <span className="text-xl font-semibold tabular-nums text-red-400">
              {fail}
            </span>
            <p className="text-[11px] text-muted-foreground">Issues</p>
          </div>
        </div>
      </div>

      {fail > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-red-300">
            <X weight="bold" className="h-4 w-4" />
            {fail} blocking issue{fail > 1 ? "s" : ""} found
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Resolve these before publishing to avoid problems.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {steps
          .filter((s) => s.id !== "review")
          .map((s) => {
            const Icon = STEP_ICONS[s.id];
            const statusColor =
              s.status === "complete"
                ? "text-emerald-400"
                : s.status === "warning"
                  ? "text-amber-400"
                  : s.status === "error"
                    ? "text-red-400"
                    : "text-muted-foreground";
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-white/[0.02] px-4 py-2.5"
              >
                <Icon weight="bold" className={`h-4 w-4 ${statusColor}`} />
                <span className="flex-1 text-sm">{s.label}</span>
                <span className={`text-[12px] font-medium ${statusColor}`}>
                  {s.checks.filter((c) => c.status === "pass").length}/
                  {s.checks.length}
                </span>
              </div>
            );
          })}
      </div>

      <button
        onClick={onPublish}
        disabled={!canPublish || publishing}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-foreground transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-accent/90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
      >
        {publishing ? (
          <>
            <CircleNotch weight="bold" className="h-4 w-4 animate-spin" />
            Publishing…
          </>
        ) : (
          <>
            <RocketLaunch weight="bold" className="h-4 w-4" />
            Publish Site
          </>
        )}
      </button>
    </StepShell>
  );
}

export function renderStep(
  stepId: StepId,
  step: StepState,
  allSteps: StepState[],
  schema: SiteSchema,
  analysis: SiteAnalysis | null,
  canPublish: boolean,
  publishing: boolean,
  onPublish: () => void
): React.ReactNode {
  switch (stepId) {
    case "domain":
      return <StepDomain step={step} />;
    case "ssl":
      return <StepSsl step={step} />;
    case "integrations":
      return (
        <StepIntegrations step={step} schema={schema} analysis={analysis} />
      );
    case "payments":
      return <StepPayments step={step} schema={schema} analysis={analysis} />;
    case "forms":
      return <StepForms step={step} />;
    case "analytics":
      return <StepAnalytics step={step} schema={schema} />;
    case "seo":
      return <StepSeo step={step} />;
    case "performance":
      return <StepPerformance step={step} />;
    case "accessibility":
      return <StepAccessibility step={step} />;
    case "review":
      return (
        <StepReview
          steps={allSteps}
          schema={schema}
          canPublish={canPublish}
          publishing={publishing}
          onPublish={onPublish}
        />
      );
  }
}
