import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { isStripeConfigured, getStripe, priceForPlan } from "@/lib/server/stripe";
import { isPlan } from "@/lib/server/plans";

export const runtime = "nodejs";

function originOf(req: Request): string {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/** POST /api/billing/checkout — start a subscription Checkout for {plan}. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required.", code: "auth" }, { status: 401 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Billing is not configured yet.", code: "stripe_unconfigured" },
      { status: 503 }
    );
  }

  try {
    const { plan } = (await req.json()) as { plan?: string };
    if (!isPlan(plan) || plan === "free") {
      return NextResponse.json({ error: "Choose a paid plan." }, { status: 400 });
    }
    const price = priceForPlan(plan);
    if (!price) {
      return NextResponse.json({ error: "That plan is unavailable." }, { status: 400 });
    }

    const origin = originOf(req);
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { userId: user.id, plan },
      subscription_data: { metadata: { userId: user.id, plan } },
      success_url: `${origin}/dashboard/sites?upgraded=1`,
      cancel_url: `${origin}/#pricing`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not start checkout.", detail: String(err) },
      { status: 500 }
    );
  }
}
