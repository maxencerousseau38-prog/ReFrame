import { getSite, findSiteByDomain, type PublishedSite } from "./sites-store";

/**
 * Map an incoming Host header to what it represents. Pure (no I/O) so the host
 * parsing is testable in isolation; resolveSiteByHost layers the store lookup on
 * top. Mirrors the middleware's host rules so robots/sitemap agree with routing.
 *
 *  - "app":    our own origin (root domain, www, localhost, vercel previews)
 *  - "sub":    a branded subdomain <slug>.<root> (or <slug>.localhost in dev)
 *  - "domain": a connected custom domain
 */
export type HostKind =
  | { kind: "app" }
  | { kind: "sub"; slug: string }
  | { kind: "domain"; host: string };

export function classifyHost(hostHeader: string | null, root: string): HostKind {
  const host = (hostHeader || "").split(":")[0].toLowerCase();
  const r = root.toLowerCase();
  if (!host || host === "localhost" || host === "127.0.0.1" || host.endsWith(".vercel.app")) {
    return { kind: "app" };
  }
  if (host.endsWith(".localhost")) {
    const slug = host.slice(0, -".localhost".length);
    return slug ? { kind: "sub", slug } : { kind: "app" };
  }
  if (r && (host === r || host === `www.${r}`)) return { kind: "app" };
  if (r && host.endsWith(`.${r}`)) {
    const slug = host.slice(0, -(`.${r}`.length));
    return slug ? { kind: "sub", slug } : { kind: "app" };
  }
  return { kind: "domain", host };
}

export interface HostSite {
  site: PublishedSite;
  /** The public origin this site is served on, e.g. https://brand.reframe.site */
  base: string;
}

/**
 * Resolve a published site from an incoming Host header, or null for our own
 * hosts (where there is no single published site). Used by the per-host
 * robots.txt / sitemap.xml handlers.
 */
export async function resolveSiteByHost(hostHeader: string | null): Promise<HostSite | null> {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";
  const cls = classifyHost(hostHeader, root);
  if (cls.kind === "app") return null;
  const host = (hostHeader || "").split(":")[0].toLowerCase();
  const site = cls.kind === "sub" ? await getSite(cls.slug) : await findSiteByDomain(cls.host);
  return site ? { site, base: `https://${host}` } : null;
}
