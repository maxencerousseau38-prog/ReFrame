import { resolveSiteByHost } from "@/lib/server/host-site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlset(locs: string[]): string {
  const body = locs.map((u) => `<url><loc>${escapeXml(u)}</loc></url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

/**
 * Per-host sitemap. On a published site's host (subdomain or custom domain) it
 * advertises that site's canonical URL; on our own origin it lists the public
 * marketing pages. Served directly (the `.xml` path bypasses the host-rewrite
 * middleware), so search engines discover each published site cleanly.
 */
export async function GET(req: Request) {
  const hostHeader = req.headers.get("host") || "";
  const isLocal = hostHeader.startsWith("localhost") || hostHeader.startsWith("127.");
  const base = `${isLocal ? "http" : "https"}://${hostHeader}`;

  const hosted = await resolveSiteByHost(hostHeader);
  // Published subdomains/custom domains render as a single client-routed page,
  // so the host root is the one canonical URL to index.
  const locs = hosted ? [`${hosted.base}/`] : [`${base}/`, `${base}/terms`, `${base}/privacy`];

  return new Response(urlset(locs), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
