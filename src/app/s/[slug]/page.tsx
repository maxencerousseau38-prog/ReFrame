import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/server/sites-store";
import { PublishedSite } from "@/components/published-site";

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

/** Canonical app-origin view of a published site (also reachable by subdomain). */
export default async function PublishedSitePage({
  params,
}: {
  params: { slug: string };
}) {
  const site = await getSite(params.slug);
  if (!site) notFound();
  return <PublishedSite site={site} />;
}
