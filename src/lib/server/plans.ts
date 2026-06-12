/**
 * Subscription plans and entitlements.
 *
 * The single source of truth for what each tier is allowed to do. Billing
 * (Stripe) only ever sets a user's `plan`; every limit and feature gate is
 * derived from here, so the app never checks Stripe state directly. Keep the
 * tiers in sync with the pricing section on the landing page.
 */

export type Plan = "free" | "pro" | "studio";

export interface Entitlements {
  /** Max sites a user may keep published at once. */
  maxPublishedSites: number;
  /** Remove the "Made with ReFrame" badge from published sites. */
  removeBranding: boolean;
  /** Allow connecting a custom domain. */
  customDomain: boolean;
  /** Team seats included. */
  seats: number;
}

export interface PlanInfo {
  id: Plan;
  label: string;
  /** Monthly price in whole currency units; 0 for free. */
  price: number;
  entitlements: Entitlements;
}

export const PLANS: Record<Plan, PlanInfo> = {
  free: {
    id: "free",
    label: "Free",
    price: 0,
    entitlements: {
      maxPublishedSites: 1,
      removeBranding: false,
      customDomain: false,
      seats: 1,
    },
  },
  pro: {
    id: "pro",
    label: "Pro",
    price: 29,
    entitlements: {
      maxPublishedSites: 25,
      removeBranding: true,
      customDomain: true,
      seats: 1,
    },
  },
  studio: {
    id: "studio",
    label: "Studio",
    price: 99,
    entitlements: {
      maxPublishedSites: 500,
      removeBranding: true,
      customDomain: true,
      seats: 10,
    },
  },
};

export const DEFAULT_PLAN: Plan = "free";

export function isPlan(value: unknown): value is Plan {
  return value === "free" || value === "pro" || value === "studio";
}

export function planOf(plan: Plan | undefined): PlanInfo {
  return PLANS[plan && isPlan(plan) ? plan : DEFAULT_PLAN];
}

export function entitlementsOf(plan: Plan | undefined): Entitlements {
  return planOf(plan).entitlements;
}
