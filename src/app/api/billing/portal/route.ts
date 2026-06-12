import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { isStripeConfigured, getStripe } from "@/lib/server/stripe";

export const runtime = "nodejs";

function originOf(req: Request): string {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/** POST /api/billing/portal — open the Stripe customer portal for the user. */
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
  if (!user.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account yet. Upgrade first.", code: "no_customer" },
      { status: 400 }
    );
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${originOf(req)}/dashboard/sites`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not open billing portal.", detail: String(err) },
      { status: 500 }
    );
  }
}
