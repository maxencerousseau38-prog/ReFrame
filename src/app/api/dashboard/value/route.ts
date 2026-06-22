import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { listSitesByOwner } from "@/lib/server/sites-store";
import { getStats } from "@/lib/server/analytics-store";
import { listLeadsByOwner } from "@/lib/server/leads-store";
import { siteSuggestions } from "@/lib/site-suggestions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEEK = 7 * 86400000;

/**
 * GET /api/dashboard/value — the owner's recurring-value summary.
 *
 * This is the subscription-justification surface: every week it shows what the
 * customer's live site(s) actually did for them (views, leads) plus a concrete
 * next improvement. Real data only; empty for users with no published site.
 */
export async function POST() {
  return handle();
}
export async function GET() {
  return handle();
}

async function handle() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ signedIn: false, sites: [], totals: { sites: 0, views7: 0, leads7: 0 } });

  const [sites, leads] = await Promise.all([listSitesByOwner(user.id), listLeadsByOwner(user.id)]);
  const now = Date.now();
  const leads7BySlug = new Map<string, number>();
  const leadsTotalBySlug = new Map<string, number>();
  for (const l of leads) {
    leadsTotalBySlug.set(l.slug, (leadsTotalBySlug.get(l.slug) || 0) + 1);
    if (now - new Date(l.createdAt).getTime() < WEEK) leads7BySlug.set(l.slug, (leads7BySlug.get(l.slug) || 0) + 1);
  }

  const rows = await Promise.all(
    sites.map(async (s) => {
      const views = await getStats(s.slug);
      const suggestions = siteSuggestions(s.schema, { hasDomain: Boolean(s.domain) });
      return {
        slug: s.slug,
        brand: s.schema.brand.name,
        domain: s.domain ?? null,
        domainVerified: Boolean(s.domainVerified),
        views: { total: views.total, last7: views.last7 },
        leads: { total: leadsTotalBySlug.get(s.slug) || 0, last7: leads7BySlug.get(s.slug) || 0 },
        suggestion: suggestions[0] ?? null,
      };
    })
  );

  const totals = rows.reduce(
    (a, r) => ({ sites: a.sites + 1, views7: a.views7 + r.views.last7, leads7: a.leads7 + r.leads.last7 }),
    { sites: 0, views7: 0, leads7: 0 }
  );

  return NextResponse.json({ signedIn: true, sites: rows, totals });
}
