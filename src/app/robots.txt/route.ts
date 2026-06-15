import { resolveSiteByHost } from "@/lib/server/host-site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Per-host robots.txt. Published sites are fully crawlable and point at their
 * own sitemap; our own origin keeps app-only paths (api, dashboard, editor,
 * result) out of the index. Served directly (the `.txt` path bypasses the
 * host-rewrite middleware).
 */
export async function GET(req: Request) {
  const hostHeader = req.headers.get("host") || "";
  const isLocal = hostHeader.startsWith("localhost") || hostHeader.startsWith("127.");
  const base = `${isLocal ? "http" : "https"}://${hostHeader}`;
  const hosted = await resolveSiteByHost(hostHeader);

  const lines = ["User-agent: *", "Allow: /"];
  if (!hosted) {
    // App origin: don't index private/app surfaces.
    lines.push("Disallow: /api/", "Disallow: /dashboard", "Disallow: /editor", "Disallow: /result");
  }
  lines.push("", `Sitemap: ${base}/sitemap.xml`);

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
