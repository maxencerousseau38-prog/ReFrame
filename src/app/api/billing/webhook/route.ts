import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeForWebhook, WEBHOOK_SECRET, planForPrice } from "@/lib/server/stripe";
import { setUserPlan } from "@/lib/server/users-store";
import { isPlan, type Plan } from "@/lib/server/plans";

export const runtime = "nodejs";

/**
 * POST /api/billing/webhook — Stripe events that change a user's plan.
 *
 * Verifies the signature against STRIPE_WEBHOOK_SECRET on the raw body, then:
 *   checkout.session.completed     -> upgrade to the purchased plan
 *   customer.subscription.deleted  -> downgrade to free
 *   customer.subscription.updated  -> sync plan (canceled/incomplete -> free)
 *
 * The user id and plan ride on metadata we set at checkout, so no reverse
 * customer-id lookup is needed.
 */
export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripeForWebhook().webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature verification failed: ${String(err)}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.client_reference_id || s.metadata?.userId;
        const plan = s.metadata?.plan;
        if (userId && isPlan(plan) && plan !== "free") {
          await setUserPlan(userId, plan, (s.customer as string) ?? undefined);
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) {
          const active = sub.status === "active" || sub.status === "trialing";
          const metaPlan = sub.metadata?.plan;
          const priced = planForPrice(sub.items.data[0]?.price?.id);
          const plan: Plan = active
            ? (isPlan(metaPlan) ? metaPlan : priced) ?? "free"
            : "free";
          await setUserPlan(userId, plan);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) await setUserPlan(userId, "free");
        break;
      }
    }
  } catch (err) {
    return NextResponse.json({ error: `Handler failed: ${String(err)}` }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
