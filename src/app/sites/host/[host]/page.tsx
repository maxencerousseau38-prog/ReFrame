import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteImage } from "@/lib/server/seo";
import { resolveHost, canonicalFor } from "@/lib/server/host-resolve";
import { PublishedSite } from "@/components/published-site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { host: string } }): Promise<Metadata> {
  const site = await resolveHost(params.host);
  if (!site) return { title: "Site not found" };
  const { name, tagline } = site.schema.brand;
  const url = canonicalFor(params.host);
  const image = siteImage(site.schema);
  const images = image ? [image] : undefined;
  return {
    title: name,
    description: tagline,
    applicationName: name,
    robots: { index: true, follow: true },
    metadataBase: new URL(url),
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: name, title: name, description: tagline, url, ...(images ? { images } : {}) },
    twitter: { card: "summary_large_image", title: name, description: tagline, ...(images ? { images } : {}) },
  };
}

/**
 * Renders the home of the site bound to a branded subdomain or connected domain.
 * Routed mode (basePath "") so the nav links to REAL crawlable URLs on the
 * customer's own domain - preserving their site's URL structure for SEO.
 */
export default async function HostResolverPage({ params }: { params: { host: string } }) {
  const site = await resolveHost(params.host);
  if (!site) notFound();
  return <PublishedSite site={site} basePath="" page="" canonicalUrl={canonicalFor(params.host)} />;
}
