import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/blocks";
import { getSite } from "@/lib/server/sites-store";
import { getUserById } from "@/lib/server/users-store";
import { entitlementsOf } from "@/lib/server/plans";

// Published sites are read from the store at request time.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const site = await getSite(params.slug);
  if (!site) return { title: "Site not found" };
  const { name, tagline } = site.schema.brand;
  return {
    title: name,
    description: tagline,
    openGraph: { title: name, description: tagline },
  };
}

/** Should this published site carry the "Made with ReFrame" badge? */
async function showBranding(ownerId?: string): Promise<boolean> {
  if (!ownerId) return true; // anonymous publishes are branded
  const owner = await getUserById(ownerId);
  return !entitlementsOf(owner?.plan).removeBranding;
}

/** Public, server-rendered view of a published site. */
export default async function PublishedSitePage({
  params,
}: {
  params: { slug: string };
}) {
  const site = await getSite(params.slug);
  if (!site) notFound();

  const branded = await showBranding(site.ownerId);

  return (
    <>
      <SiteRenderer schema={site.schema} />
      {branded && (
        <Link
          href="/"
          className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full bg-[#0f0f11] px-3 py-1.5 text-[12px] font-medium text-white shadow-lg ring-1 ring-white/15 transition-transform hover:scale-105"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#9FDE3F]" />
          Made with ReFrame
        </Link>
      )}
    </>
  );
}
