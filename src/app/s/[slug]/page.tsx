import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/server/sites-store";
import { siteImage } from "@/lib/server/seo";
import { PublishedSite } from "@/components/published-site";

// Published sites are read from the store at request time.
export const dynamic = "force-dynamic";

function publicUrl(slug: string): string | undefined {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  return root ? `https://${slug}.${root}` : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const site = await getSite(params.slug);
  if (!site) return { title: "Site not found" };
  const { name, tagline } = site.schema.brand;
  const url = publicUrl(params.slug);
  const image = siteImage(site.schema);
  const images = image ? [image] : undefined;
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
      ...(images ? { images } : {}),
    },
    twitter: { card: "summary_large_image", title: name, description: tagline, ...(images ? { images } : {}) },
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
  return (
    <PublishedSite
      site={site}
      basePath={`/s/${params.slug}`}
      page=""
      canonicalUrl={publicUrl(params.slug)}
    />
  );
}
