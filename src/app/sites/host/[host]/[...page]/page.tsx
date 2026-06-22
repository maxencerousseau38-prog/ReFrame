import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveHost, canonicalFor } from "@/lib/server/host-resolve";
import { PublishedSite } from "@/components/published-site";

// A sub-page on a branded subdomain or connected custom domain, served at the
// client's REAL nested path (SEO continuity: theirdomain.com/collections/x).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { host: string; page: string[] } }): Promise<Metadata> {
  const path = params.page.join("/");
  const site = await resolveHost(params.host);
  const page = site?.schema.pages?.find((p) => p.path === path);
  if (!site || !page) return { title: "Page not found" };
  const { name, tagline } = site.schema.brand;
  const url = `${canonicalFor(params.host)}/${path}`;
  return {
    title: `${page.label} · ${name}`,
    description: tagline,
    robots: { index: true, follow: true },
    metadataBase: new URL(canonicalFor(params.host)),
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: name, title: `${page.label} · ${name}`, description: tagline, url },
    twitter: { card: "summary_large_image", title: `${page.label} · ${name}`, description: tagline },
  };
}

export default async function HostSubPage({ params }: { params: { host: string; page: string[] } }) {
  const path = params.page.join("/");
  const site = await resolveHost(params.host);
  if (!site) notFound();
  if (!site.schema.pages?.some((p) => p.path === path)) notFound();
  return <PublishedSite site={site} basePath="" page={path} canonicalUrl={`${canonicalFor(params.host)}/${path}`} />;
}
