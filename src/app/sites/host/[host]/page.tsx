import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite, findSiteByDomain, type PublishedSite as Rec } from "@/lib/server/sites-store";
import { PublishedSite } from "@/components/published-site";

export const dynamic = "force-dynamic";

function subdomainSlug(host: string, root: string): string | null {
  if (host.endsWith(".localhost")) return host.slice(0, -".localhost".length) || null;
  if (root && host.endsWith(`.${root}`)) return host.slice(0, -(`.${root}`.length)) || null;
  return null;
}

/** Resolve a published site from an incoming host (subdomain or custom domain). */
async function resolve(hostParam: string): Promise<Rec | null> {
  const host = decodeURIComponent(hostParam).toLowerCase();
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").toLowerCase();
  const sub = subdomainSlug(host, root);
  return sub ? getSite(sub) : findSiteByDomain(host);
}

export async function generateMetadata({
  params,
}: {
  params: { host: string };
}): Promise<Metadata> {
  const site = await resolve(params.host);
  if (!site) return { title: "Site not found" };
  const { name, tagline } = site.schema.brand;
  return { title: name, description: tagline, openGraph: { title: name, description: tagline } };
}

/** Renders the site bound to a branded subdomain or a connected custom domain. */
export default async function HostResolverPage({ params }: { params: { host: string } }) {
  const site = await resolve(params.host);
  if (!site) notFound();
  return <PublishedSite site={site} />;
}
