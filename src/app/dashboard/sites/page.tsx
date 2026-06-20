import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { SitesView } from "@/components/dashboard/sites-view";
import { getCurrentUser } from "@/lib/server/auth";
import { listSitesByOwner } from "@/lib/server/sites-store";
import { getStats } from "@/lib/server/analytics-store";
import { planOf } from "@/lib/server/plans";
import { siteSuggestions } from "@/lib/site-suggestions";

export const dynamic = "force-dynamic";

export default async function MySitesPage({
  searchParams,
}: {
  searchParams: { upgraded?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/sites");

  const sites = await listSitesByOwner(user.id);
  const plan = planOf(user.plan);

  const cards = await Promise.all(
    sites.map(async (s) => {
      const stats = await getStats(s.slug);
      return {
        slug: s.slug,
        name: s.schema.brand.name,
        tagline: s.schema.brand.tagline,
        createdAt: s.createdAt,
        blocks: s.schema.blocks.length,
        domain: s.domain ?? null,
        domainVerified: Boolean(s.domainVerified),
        views7: stats.last7,
        viewsTotal: stats.total,
        suggestions: siteSuggestions(s.schema, { hasDomain: Boolean(s.domain) }),
      };
    })
  );

  return (
    <DashboardShell>
      <SitesView
        upgraded={searchParams.upgraded === "1"}
        rootDomain={process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? null}
        canCustomDomain={plan.entitlements.customDomain}
        plan={{ id: plan.id, label: plan.label, limit: plan.entitlements.maxPublishedSites }}
        sites={cards}
      />
    </DashboardShell>
  );
}
