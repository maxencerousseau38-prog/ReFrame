/**
 * Catalogue produits/prix Stripe — SQUELETTE.
 *
 * Fait le lien entre nos offres applicatives (lib/pricing.ts) et les
 * identifiants de prix Stripe (price IDs) définis dans le dashboard Stripe.
 *
 * ⚠️ Les price IDs proviennent des variables d'environnement et NE SONT PAS
 * encore reliés à un vrai paiement. À compléter en production.
 */

export type ProductKind = "refonte" | "hebergement";

export interface StripePriceRef {
  /** Clé interne (correspond aux ids de lib/pricing.ts). */
  key: string;
  kind: ProductKind;
  label: string;
  /** Price ID Stripe (depuis l'environnement). Vide tant que non configuré. */
  priceId?: string;
  /** Mode de paiement attendu côté Stripe. */
  mode: "payment" | "subscription";
}

export const STRIPE_PRICES: StripePriceRef[] = [
  // --- Refonte initiale (paiement unique) ---
  {
    key: "refonte_express",
    kind: "refonte",
    label: "Refonte Express",
    mode: "payment",
    priceId: process.env.STRIPE_PRICE_REFONTE_EXPRESS,
  },
  {
    key: "refonte_standard",
    kind: "refonte",
    label: "Refonte Standard",
    mode: "payment",
    priceId: process.env.STRIPE_PRICE_REFONTE_STANDARD,
  },
  {
    key: "refonte_surmesure",
    kind: "refonte",
    label: "Refonte Sur-mesure",
    mode: "payment",
    priceId: process.env.STRIPE_PRICE_REFONTE_SURMESURE,
  },
  // --- Hébergement (abonnement) ---
  {
    key: "hebergement_essentiel_mensuel",
    kind: "hebergement",
    label: "Hébergement Essentiel (mensuel)",
    mode: "subscription",
    priceId: process.env.STRIPE_PRICE_HEBERGEMENT_ESSENTIEL_MENSUEL,
  },
  {
    key: "hebergement_pro_mensuel",
    kind: "hebergement",
    label: "Hébergement Pro (mensuel)",
    mode: "subscription",
    priceId: process.env.STRIPE_PRICE_HEBERGEMENT_PRO_MENSUEL,
  },
  {
    key: "hebergement_premium_mensuel",
    kind: "hebergement",
    label: "Hébergement Premium (mensuel)",
    mode: "subscription",
    priceId: process.env.STRIPE_PRICE_HEBERGEMENT_PREMIUM_MENSUEL,
  },
];

export function getStripePrice(key: string): StripePriceRef | undefined {
  return STRIPE_PRICES.find((p) => p.key === key);
}
