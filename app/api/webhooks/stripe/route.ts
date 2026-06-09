import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe, isStripeConfigured } from "@/lib/stripe/config";

/**
 * ============================================================================
 * Webhook Stripe — SQUELETTE
 * ============================================================================
 *
 * La STRUCTURE de vérification de signature et le switch d'événements sont en
 * place. La LOGIQUE MÉTIER (mise à jour de la table subscriptions) est en TODO.
 *
 * Pour tester en local :
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *
 * TODO (production) : pour chaque événement, mettre à jour la table
 * `subscriptions` via le client service role (createAdminClient).
 * ============================================================================
 */
export async function POST(request: NextRequest) {
  // Tant que Stripe n'est pas configuré, on répond proprement sans planter.
  if (!isStripeConfigured || !stripe) {
    return NextResponse.json(
      { received: false, error: "Stripe non configuré (squelette)." },
      { status: 503 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET manquant." }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  // Vérification de la signature (sécurité indispensable).
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature invalide";
    return NextResponse.json({ error: `Webhook: ${message}` }, { status: 400 });
  }

  // Aiguillage des événements. La logique métier reste à brancher.
  switch (event.type) {
    case "checkout.session.completed":
      // TODO : récupérer la session, créer/mettre à jour la ligne subscriptions
      // (stripe_customer_id, stripe_subscription_id, statut, plan, periode_fin).
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
      // TODO : synchroniser le statut et la date de fin de période.
      break;

    case "customer.subscription.deleted":
      // TODO : passer la subscription en "canceled" et déclencher la mise hors
      // ligne du site associé (statut 'hors_ligne').
      break;

    case "invoice.payment_failed":
      // TODO : passer la subscription en "past_due" et notifier le client.
      break;

    case "invoice.paid":
      // TODO : prolonger la période et garder le site en ligne.
      break;

    default:
      // Événement non géré : on l'accuse réception sans erreur.
      break;
  }

  return NextResponse.json({ received: true });
}
