import { describe, it, expect, beforeAll } from "vitest";
import Stripe from "stripe";
import os from "os";
import path from "path";
import fs from "fs";
import crypto from "crypto";

/**
 * Proves the money path end-to-end without hitting Stripe's network: we sign
 * real Stripe events with the SDK's own signer, so the route's signature
 * verification runs for real, then assert the purchase flips the user's plan
 * and that the plan unlocks publishing entitlements.
 *
 * Env that the billing/users modules read at load time is set before they are
 * (dynamically) imported.
 */

const WEBHOOK_SECRET = "whsec_" + "x".repeat(40);
const signer = new Stripe("sk_test_placeholder");

beforeAll(() => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rf-webhook-"));
  process.env.REFRAME_DATA_DIR = path.join(dir, "sites");
  process.env.STRIPE_SECRET_KEY = "sk_test_placeholder";
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  process.env.STRIPE_PRICE_PRO = "price_pro_test";
  process.env.STRIPE_PRICE_STUDIO = "price_studio_test";
});

function signed(event: unknown): Request {
  const payload = JSON.stringify(event);
  const header = signer.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
  return new Request("http://localhost/api/billing/webhook", {
    method: "POST",
    headers: { "stripe-signature": header, "content-type": "application/json" },
    body: payload,
  });
}

let i = 0;
const freshEmail = () => `buyer-${Date.now()}-${i++}@example.com`;

describe("billing webhook → plan sync (money path)", () => {
  it("upgrades the buyer to the purchased plan on checkout.session.completed", async () => {
    const { upsertProfile, getUserById } = await import("@/lib/server/users-store");
    const { POST } = await import("@/app/api/billing/webhook/route");

    const user = await upsertProfile({ id: crypto.randomUUID(), email: freshEmail() });
    expect(user.plan ?? "free").toBe("free");

    const res = await POST(
      signed({
        id: "evt_checkout",
        type: "checkout.session.completed",
        data: {
          object: {
            client_reference_id: user.id,
            customer: "cus_test_123",
            metadata: { userId: user.id, plan: "pro" },
          },
        },
      })
    );
    expect(res.status).toBe(200);

    const after = await getUserById(user.id);
    expect(after?.plan).toBe("pro");
    expect(after?.stripeCustomerId).toBe("cus_test_123");
  });

  it("downgrades to free on customer.subscription.deleted", async () => {
    const { upsertProfile, getUserById, setUserPlan } = await import("@/lib/server/users-store");
    const { POST } = await import("@/app/api/billing/webhook/route");

    const user = await upsertProfile({ id: crypto.randomUUID(), email: freshEmail() });
    await setUserPlan(user.id, "studio");
    expect((await getUserById(user.id))?.plan).toBe("studio");

    const res = await POST(
      signed({
        id: "evt_deleted",
        type: "customer.subscription.deleted",
        data: { object: { metadata: { userId: user.id } } },
      })
    );
    expect(res.status).toBe(200);
    expect((await getUserById(user.id))?.plan).toBe("free");
  });

  it("syncs to free when a subscription becomes inactive (updated/canceled)", async () => {
    const { upsertProfile, getUserById, setUserPlan } = await import("@/lib/server/users-store");
    const { POST } = await import("@/app/api/billing/webhook/route");

    const user = await upsertProfile({ id: crypto.randomUUID(), email: freshEmail() });
    await setUserPlan(user.id, "pro");

    const res = await POST(
      signed({
        id: "evt_updated",
        type: "customer.subscription.updated",
        data: {
          object: {
            status: "canceled",
            metadata: { userId: user.id, plan: "pro" },
            items: { data: [{ price: { id: "price_pro_test" } }] },
          },
        },
      })
    );
    expect(res.status).toBe(200);
    expect((await getUserById(user.id))?.plan).toBe("free");
  });

  it("rejects a forged signature with 400 and does not change the plan", async () => {
    const { upsertProfile, getUserById } = await import("@/lib/server/users-store");
    const { POST } = await import("@/app/api/billing/webhook/route");

    const user = await upsertProfile({ id: crypto.randomUUID(), email: freshEmail() });
    const res = await POST(
      new Request("http://localhost/api/billing/webhook", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=deadbeef", "content-type": "application/json" },
        body: JSON.stringify({ type: "checkout.session.completed" }),
      })
    );
    expect(res.status).toBe(400);
    expect((await getUserById(user.id))?.plan ?? "free").toBe("free");
  });
});

describe("plan unlocks publishing entitlements", () => {
  it("free cannot publish, paid plans can", async () => {
    const { effectivePlan, entitlementsOf } = await import("@/lib/server/plans");
    expect(entitlementsOf(effectivePlan({ plan: "free" })).maxPublishedSites).toBe(0);
    expect(entitlementsOf(effectivePlan({ plan: "pro" })).maxPublishedSites).toBeGreaterThanOrEqual(1);
    expect(entitlementsOf(effectivePlan({ plan: "studio" })).maxPublishedSites).toBeGreaterThanOrEqual(1);
  });
});
