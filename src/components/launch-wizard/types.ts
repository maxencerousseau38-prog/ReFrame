import type { SiteSchema, SiteAnalysis } from "@/lib/generation/types";

export type StepId =
  | "domain"
  | "ssl"
  | "integrations"
  | "payments"
  | "forms"
  | "analytics"
  | "seo"
  | "performance"
  | "accessibility"
  | "review";

export type CheckStatus = "pass" | "warn" | "fail" | "info";

export interface CheckItem {
  id: string;
  label: string;
  status: CheckStatus;
  detail?: string;
}

export type StepStatus =
  | "idle"
  | "checking"
  | "complete"
  | "warning"
  | "error"
  | "skipped";

export interface StepState {
  id: StepId;
  label: string;
  status: StepStatus;
  checks: CheckItem[];
}

export interface WizardProps {
  schema: SiteSchema;
  analysis: SiteAnalysis | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: () => Promise<void>;
  published?: string | null;
}

export interface StepComponentProps {
  schema: SiteSchema;
  analysis: SiteAnalysis | null;
  step: StepState;
  onUpdate: (checks: CheckItem[]) => void;
}
