import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/server/sites-store";
import { PublishedSite } from "@/components/published-site";

// Sub-pages are read from the store at request time.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; page: string };
}): Promise<Metadata> {
  const site = await getSite(params.slug);
  const page = site?.schema.pages?.find((p) => p.path === params.page);
  if (!site || !page) return { title: "Page not found" };

  const { name, tagline } = site.schema.brand;
  const title = `${page.label} · ${name}`;
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  const url = root ? `https://${params.slug}.${root}/${page.path}` : undefined;
  return {
    title,
    description: tagline,
    robots: { index: true, follow: true },
    ...(url ? { metadataBase: new URL(`https://${params.slug}.${root}`), alternates: { canonical: url } } : {}),
    openGraph: {
      type: "website",
      siteName: name,
      title,
      description: tagline,
      ...(url ? { url } : {}),
    },
    twitter: { card: "summary_large_image", title, description: tagline },
  };
}

/** A single sub-page of a published site (real URL, per-page SEO). */
export default async function PublishedSubPage({
  params,
}: {
  params: { slug: string; page: string };
}) {
  const site = await getSite(params.slug);
  if (!site) notFound();
  const exists = site.schema.pages?.some((p) => p.path === params.page);
  if (!exists) notFound();
  return <PublishedSite site={site} basePath={`/s/${params.slug}`} page={params.page} />;
}
