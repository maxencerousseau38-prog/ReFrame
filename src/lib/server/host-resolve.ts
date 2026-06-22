import { getSite, findSiteByDomain, type PublishedSite as Rec } from "@/lib/server/sites-store";

/** The public origin a request arrived on (branded subdomain or connected domain). */
export function canonicalFor(hostParam: string): string {
  return `https://${decodeURIComponent(hostParam).toLowerCase()}`;
}

function subdomainSlug(host: string, root: string): string | null {
  if (host.endsWith(".localhost")) return host.slice(0, -".localhost".length) || null;
  if (root && host.endsWith(`.${root}`)) return host.slice(0, -(`.${root}`.length)) || null;
  return null;
}

/** Resolve a published site from an incoming host (subdomain or custom domain). */
export async function resolveHost(hostParam: string): Promise<Rec | null> {
  const host = decodeURIComponent(hostParam).toLowerCase();
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").toLowerCase();
  const sub = subdomainSlug(host, root);
  return sub ? getSite(sub) : findSiteByDomain(host);
}
