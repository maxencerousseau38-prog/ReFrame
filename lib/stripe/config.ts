/**
 * Configuration Stripe — SQUELETTE.
 *
 * ⚠️ Le flux de paiement n'est PAS branché. Ce fichier centralise la
 * configuration et l'instanciation du client Stripe pour la production.
 *
 * TODO (production) :
 *   - Renseigner les clés dans .env.local (voir .env.example).
 *   - Créer les produits/prix dans le dashboard Stripe et coller les price IDs.
 *   - Brancher createCheckoutSession (lib/stripe/actions.ts) et le webhook.
 */

import Stripe from "stripe";

/** Indique si Stripe est configuré (clé présente). */
export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

/**
 * Instance Stripe côté serveur. Renvoie null si non configuré, pour permettre
 * à l'application de tourner en mode démo sans clés.
 */
export const stripe: Stripe | null = isStripeConfigured
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // Épinglez la version d'API en production (ex. "2025-05-28.basil").
      // Laissée par défaut ici pour éviter tout couplage de version dans le squelette.
      typescript: true,
    })
  : null;
