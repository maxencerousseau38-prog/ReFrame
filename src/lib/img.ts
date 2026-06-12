/**
 * Image URL helper, shared by the renderer.
 *
 * Extracted client images are hotlinked raw, which means they expire, get
 * hotlink-blocked, or leak the visitor's referrer. Routing them through our
 * proxy (`/api/img`) lets the page control caching and referrer, validate that
 * the response is really an image, and bypass naive hotlink protection.
 *
 * Pure and dependency-free so it runs in the client renderer and is unit-tested.
 * Note: the standalone HTML export keeps original URLs (it must work offline,
 * with no server), so it does not use this.
 */
export function toProxiedUrl(url: string | undefined | null): string {
  if (!url) return "";
  // Data URIs, blobs, anchors and same-origin/relative paths pass through.
  if (/^(data:|blob:|#|\/)/i.test(url)) return url;
  if (/^https?:\/\//i.test(url)) return `/api/img?u=${encodeURIComponent(url)}`;
  return url;
}
