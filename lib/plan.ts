// ─────────────────────────────────────────────────────────────────────────────
// Plan definitions — the single source of truth for quotas & feature gating.
// Mirrors `plan_limits` in supabase/schema.sql. The "free" trial tier lets a
// visitor feel the product (the "aha") before any card is required.
// ─────────────────────────────────────────────────────────────────────────────

export type PlanId = "free" | "starter" | "pro" | "investor";

export interface PlanDef {
  id: PlanId;
  label: string;
  price: number; // €/month
  quota: number; // monthly analyses; Infinity = unlimited
  features: {
    pdfExport: boolean;
    comparisons: boolean;
    aiAlerts: boolean;
    advancedValuation: boolean;
    watchlists: number; // Infinity = unlimited
  };
}

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: "free",
    label: "Essai gratuit",
    price: 0,
    quota: 3,
    features: { pdfExport: false, comparisons: false, aiAlerts: false, advancedValuation: false, watchlists: 1 },
  },
  starter: {
    id: "starter",
    label: "Starter",
    price: 29,
    quota: 10,
    features: { pdfExport: false, comparisons: false, aiAlerts: false, advancedValuation: false, watchlists: 1 },
  },
  pro: {
    id: "pro",
    label: "Pro",
    price: 99,
    quota: 100,
    features: { pdfExport: true, comparisons: true, aiAlerts: true, advancedValuation: false, watchlists: 5 },
  },
  investor: {
    id: "investor",
    label: "Investor",
    price: 299,
    quota: Infinity,
    features: { pdfExport: true, comparisons: true, aiAlerts: true, advancedValuation: true, watchlists: Infinity },
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "starter", "pro", "investor"];

/** The plan a user must upgrade to in order to unlock a given feature. */
export function requiredPlanFor(feature: keyof PlanDef["features"]): PlanId {
  for (const id of PLAN_ORDER) {
    const v = PLANS[id].features[feature];
    if (v === true || (typeof v === "number" && v > 1)) return id;
  }
  return "pro";
}
