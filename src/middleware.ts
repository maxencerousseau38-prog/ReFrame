import { NextResponse, type NextRequest } from "next/server";

/**
 * Host-based routing for published sites.
 *
 * Requests to the app's own domain (root, www, localhost, vercel previews) pass
 * through untouched. Any other host is a published site:
 *   <slug>.reframe.site   -> branded subdomain
 *   www.customer-biz.com  -> connected custom domain
 * Both are rewritten to the resolver at /sites/host/<host>, which looks up the
 * site and renders it. Asset/data/API paths are excluded by the matcher so they
 * still load on a site host.
 *
 * Set NEXT_PUBLIC_ROOT_DOMAIN (e.g. "reframe.site") to enable subdomain hosting.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").toLowerCase();

  // App / infra hosts: never treated as a published site.
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  let siteHost: string | null = null;
  if (host.endsWith(".localhost")) {
    siteHost = host; // dev: <slug>.localhost
  } else if (root) {
    if (host === root || host === `www.${root}`) return NextResponse.next();
    siteHost = host; // subdomain of root, or a custom domain
  } else {
    return NextResponse.next(); // hosting not configured
  }

  const url = req.nextUrl.clone();
  // Preserve the original path so the client's REAL URLs resolve on their domain
  // (e.g. theirsite.com/collections/x -> the rebuilt page at the same path).
  const orig = req.nextUrl.pathname.replace(/^\/+/, "");
  url.pathname = `/sites/host/${encodeURIComponent(siteHost)}${orig ? `/${orig}` : ""}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API, and anything that looks like a file (has a dot).
  matcher: ["/((?!_next/|api/|favicon|.*\\..*).*)"],
};
