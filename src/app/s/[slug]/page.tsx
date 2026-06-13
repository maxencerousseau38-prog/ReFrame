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
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  const url = root ? `https://${params.slug}.${root}` : undefined;
  return {
    title: name,
    description: tagline,
    applicationName: name,
    robots: { index: true, follow: true },
    ...(url ? { metadataBase: new URL(url), alternates: { canonical: url } } : {}),
    openGraph: {
      type: "website",
      siteName: name,
      title: name,
      description: tagline,
      ...(url ? { url } : {}),
    },
    twitter: { card: "summary_large_image", title: name, description: tagline },
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
  return <PublishedSite site={site} basePath={`/s/${params.slug}`} page="" />;
}
