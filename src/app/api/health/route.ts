import { NextResponse } from "next/server";
import { storeBackendName } from "@/lib/server/sites-store";
import { isStripeConfigured } from "@/lib/server/stripe";
import { isEmailConfigured } from "@/lib/server/email";
import { isRenderConfigured, canRender } from "@/lib/server/render";
import { isBlobConfigured } from "@/lib/server/blob";
import { isVercelDomainsConfigured } from "@/lib/server/vercel-domains";
import { authSecretSecure } from "@/lib/server/auth";

export const runtime = "nodejs";

/**
 * GET /api/health — production-readiness snapshot. Reports which integrations
 * are configured so ops can confirm a deploy is wired (no secrets exposed).
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    storage: storeBackendName(), // "vercel-kv" or "filesystem"
    durable: storeBackendName() !== "filesystem",
    stripe: isStripeConfigured(),
    email: isEmailConfigured(),
    render: isRenderConfigured(), // external Browserless service configured
    // Can this deploy actually render JS/SPA pages (service OR a local browser)?
    // If false, modern React/Next/Shopify sites extract poorly — the #1 quality risk.
    renderReady: await canRender(),
    blob: isBlobConfigured(),
    customDomains: isVercelDomainsConfigured(),
    authSecret: authSecretSecure(),
    rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? null,
    llm: Boolean(process.env.ANTHROPIC_API_KEY),
    time: new Date().toISOString(),
  });
}
