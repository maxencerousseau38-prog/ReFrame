import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { SitesView } from "@/components/dashboard/sites-view";
import { getCurrentUser } from "@/lib/server/auth";
import { listSitesByOwner } from "@/lib/server/sites-store";
import { planOf } from "@/lib/server/plans";

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

  return (
    <DashboardShell>
      <SitesView
        upgraded={searchParams.upgraded === "1"}
        plan={{ id: plan.id, label: plan.label, limit: plan.entitlements.maxPublishedSites }}
        sites={sites.map((s) => ({
          slug: s.slug,
          name: s.schema.brand.name,
          tagline: s.schema.brand.tagline,
          createdAt: s.createdAt,
          blocks: s.schema.blocks.length,
        }))}
      />
    </DashboardShell>
  );
}
