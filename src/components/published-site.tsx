import Link from "next/link";
import { SiteRenderer } from "@/components/blocks";
import { Pageview } from "@/components/pageview";
import { getUserById } from "@/lib/server/users-store";
import { entitlementsOf, effectivePlan } from "@/lib/server/plans";
import { buildJsonLd } from "@/lib/server/seo";
import type { PublishedSite as PublishedSiteRecord } from "@/lib/server/sites-store";

/** Should this published site carry the "Made with ReFrame" badge? */
async function showBranding(ownerId?: string): Promise<boolean> {
  if (!ownerId) return true; // anonymous publishes are branded
  const owner = await getUserById(ownerId);
  return !entitlementsOf(effectivePlan(owner)).removeBranding;
}

/**
 * Renders a published site plus the plan-gated branding badge. Shared by the
 * canonical `/s/<slug>` route and the host resolver (`<slug>.reframe.site` and
 * connected custom domains), so branding and markup stay identical everywhere.
 *
 * `canonicalUrl` (when known) feeds schema.org JSON-LD so the page declares the
 * business to search engines - LocalBusiness when contact details are present.
 */
export async function PublishedSite({
  site,
  basePath,
  page,
  canonicalUrl,
}: {
  site: PublishedSiteRecord;
  basePath?: string;
  page?: string;
  canonicalUrl?: string;
}) {
  const branded = await showBranding(site.ownerId);
  const jsonLd = buildJsonLd(site.schema, canonicalUrl);
  return (
    <>
      {/* Machine-readable business identity for search engines / local results. */}
      <script
        type="application/ld+json"
        // JSON.stringify output is safe to inline; no user-controlled HTML.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Pageview slug={site.slug} />
      <SiteRenderer schema={site.schema} basePath={basePath} page={page} />
      {branded && (
        <Link
          href="https://reframe.design"
          className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full bg-[#0f0f11] px-3 py-1.5 text-[12px] font-medium text-white shadow-lg ring-1 ring-white/15 transition-transform hover:scale-105"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#9FDE3F]" />
          Made with ReFrame
        </Link>
      )}
    </>
  );
}
