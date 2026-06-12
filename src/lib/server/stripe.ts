import Stripe from "stripe";
import type { Plan } from "./plans";

/**
 * Stripe wiring, env-driven and degrading gracefully (same idea as KV/LLM).
 *
 * Billing is "configured" only when the secret key, webhook secret and at
 * least one price id are present. When it isn't, the billing routes return a
 * clear 503 instead of crashing, so the rest of the app runs unchanged in dev.
 *
 * Required env for production:
 *   STRIPE_SECRET_KEY       sk_live_... / sk_test_...
 *   STRIPE_WEBHOOK_SECRET   whsec_...
 *   STRIPE_PRICE_PRO        price_...  (recurring price for the Pro plan)
 *   STRIPE_PRICE_STUDIO     price_...  (recurring price for the Studio plan)
 */

const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const PLAN_TO_PRICE: Partial<Record<Plan, string>> = {
  pro: process.env.STRIPE_PRICE_PRO,
  studio: process.env.STRIPE_PRICE_STUDIO,
};

const PRICE_TO_PLAN: Record<string, Plan> = {};
for (const [plan, price] of Object.entries(PLAN_TO_PRICE)) {
  if (price) PRICE_TO_PLAN[price] = plan as Plan;
}

/** Billing is usable (checkout + webhook) only when fully configured. */
export function isStripeConfigured(): boolean {
  return Boolean(SECRET_KEY && WEBHOOK_SECRET && PLAN_TO_PRICE.pro);
}

let client: Stripe | null = null;

/** Stripe client for API calls (checkout, portal). Requires the secret key. */
export function getStripe(): Stripe {
  if (!SECRET_KEY) throw new Error("stripe_not_configured");
  if (!client) client = new Stripe(SECRET_KEY);
  return client;
}

/**
 * Stripe instance usable for webhook signature verification. `constructEvent`
 * never calls the API, so a placeholder key is fine when only the webhook
 * secret is set.
 */
export function getStripeForWebhook(): Stripe {
  return getStripeSafe();
}

function getStripeSafe(): Stripe {
  if (client) return client;
  client = new Stripe(SECRET_KEY || "sk_placeholder_webhook_only");
  return client;
}

export function priceForPlan(plan: Plan): string | undefined {
  return PLAN_TO_PRICE[plan];
}

export function planForPrice(priceId: string | undefined): Plan | undefined {
  return priceId ? PRICE_TO_PLAN[priceId] : undefined;
}
