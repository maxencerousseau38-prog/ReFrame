"use server";

import { createClient } from "@/lib/supabase/server";
import { stripe, isStripeConfigured } from "./config";
import { getStripePrice } from "./products";
import type { ActionResult } from "@/types";

/**
 * ============================================================================
 * STUB — Création d'une session de paiement Stripe Checkout
 * ============================================================================
 *
 * ⚠️ LE FLUX DE PAIEMENT N'EST PAS BRANCHÉ. Cette Server Action est un
 * squelette : elle valide le contexte et documente précisément ce qu'il
 * reste à implémenter pour passer en production.
 *
 * TODO (production) :
 *   1. Récupérer / créer le Customer Stripe lié à l'utilisateur (et stocker
 *      stripe_customer_id dans la table subscriptions).
 *   2. Créer la session Checkout avec le price ID correspondant :
 *        const session = await stripe.checkout.sessions.create({
 *          mode: priceRef.mode,              // "payment" ou "subscription"
 *          customer: customerId,
 *          line_items: [{ price: priceRef.priceId, quantity: 1 }],
 *          success_url: `${origin}/dashboard/facturation?success=1`,
 *          cancel_url: `${origin}/dashboard/facturation?cancel=1`,
 *        });
 *   3. Retourner session.url et rediriger le client dessus.
 *   4. Confirmer l'abonnement via le webhook (voir app/api/webhooks/stripe).
 * ============================================================================
 */
export async function createCheckoutSession(priceKey: string): Promise<ActionResult & { url?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Vous devez être connecté." };

  const priceRef = getStripePrice(priceKey);
  if (!priceRef) return { success: false, error: "Offre inconnue." };

  // Garde-fou : tant que Stripe n'est pas configuré, on reste en mode démo.
  if (!isStripeConfigured || !stripe || !priceRef.priceId) {
    return {
      success: false,
      error:
        "Le paiement n'est pas encore activé (squelette Stripe). Configurez vos clés et price IDs pour l'activer.",
    };
  }

  // TODO : implémenter la création réelle de la session Checkout (voir ci-dessus).
  return {
    success: false,
    error: "createCheckoutSession() : à implémenter (voir TODO dans lib/stripe/actions.ts).",
  };
}
