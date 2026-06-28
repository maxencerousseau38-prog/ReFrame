import type { SourcePlatform } from "./types";

// ---------------------------------------------------------------------------
// Platform detection — first match wins
// ---------------------------------------------------------------------------

export function detectPlatform(html: string): SourcePlatform {
  if (isFramer(html)) return "framer";
  if (isWebflow(html)) return "webflow";
  if (isWordPress(html)) return "wordpress";
  if (isShopify(html)) return "shopify";
  if (isSquarespace(html)) return "squarespace";
  if (isWix(html)) return "wix";
  return "custom";
}

// ---------------------------------------------------------------------------
// Convenience export
// ---------------------------------------------------------------------------

export function isFramerSite(html: string): boolean {
  return isFramer(html);
}

// ---------------------------------------------------------------------------
// Individual platform checks (private)
// ---------------------------------------------------------------------------

function isFramer(html: string): boolean {
  // data-framer-* attributes
  if (/data-framer-/i.test(html)) return true;
  // framer CDN / hosted URLs
  if (/framer\.com|framerusercontent\.com/i.test(html)) return true;
  // __framer- CSS classes
  if (/__framer-/i.test(html)) return true;
  // Runtime globals
  if (/window\.__framer|Framer\./i.test(html)) return true;
  // Framer-hosted canonical domains
  if (/\.framer\.website|\.framer\.wiki|\.framer\.photos/i.test(html))
    return true;
  return false;
}

function isWebflow(html: string): boolean {
  if (/data-wf-/i.test(html)) return true;
  if (/webflow\.com/i.test(html)) return true;
  // Webflow utility classes: w-container, w-row, w-nav, etc.
  if (/\bw-(?:container|row|col|nav|section|slider|dropdown|tabs)\b/i.test(html))
    return true;
  // HTML comments or meta containing "Webflow"
  if (/<!--[^>]*Webflow[^>]*-->/i.test(html)) return true;
  if (/<meta[^>]*Webflow/i.test(html)) return true;
  return false;
}

function isWordPress(html: string): boolean {
  if (/wp-content\/|wp-includes\//i.test(html)) return true;
  if (/wordpress|wp-json/i.test(html)) return true;
  // Generator meta tag
  if (/<meta[^>]*name=["']generator["'][^>]*content=["'][^"']*WordPress/i.test(html))
    return true;
  return false;
}

function isShopify(html: string): boolean {
  if (/cdn\.shopify\.com/i.test(html)) return true;
  if (/Shopify\./i.test(html)) return true;
  if (/<meta[^>]*shopify/i.test(html)) return true;
  return false;
}

function isSquarespace(html: string): boolean {
  if (/squarespace\.com/i.test(html)) return true;
  if (/\bsqs-/i.test(html)) return true;
  return false;
}

function isWix(html: string): boolean {
  if (/wix\.com|parastorage\.com/i.test(html)) return true;
  if (/wixsite\.com/i.test(html)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Framer text deduplication
// ---------------------------------------------------------------------------

/**
 * Framer sites duplicate text inside nav links and other elements (visible text
 * plus a hidden hover/animated state). This cleans strings like "STUDIOSTUDIO"
 * back to "STUDIO".
 *
 * Rules:
 *  - Exact doubling: first half === second half → return first half.
 *  - Case-insensitive doubling: "STUDIOStudio" → first half.
 *  - Space-separated doubling: "STUDIO STUDIO" → first word.
 *  - Otherwise return as-is.
 */
export function cleanFramerText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) return trimmed;

  // Check space-separated doubling first ("STUDIO STUDIO")
  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx !== -1) {
    const parts = trimmed.split(/\s+/);
    if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
      return parts[0];
    }
  }

  // Check character-level doubling (even-length strings only)
  if (trimmed.length % 2 === 0) {
    const half = trimmed.length / 2;
    const first = trimmed.slice(0, half);
    const second = trimmed.slice(half);

    // Exact match
    if (first === second) return first;

    // Case-insensitive match
    if (first.toLowerCase() === second.toLowerCase()) return first;
  }

  return trimmed;
}

// ---------------------------------------------------------------------------
// Framer nav item cleanup
// ---------------------------------------------------------------------------

/**
 * 1. Apply cleanFramerText to each item.
 * 2. Deduplicate by case-insensitive comparison (keep first occurrence).
 * 3. Filter out empty strings.
 */
export function cleanFramerNavItems(items: string[]): string[] {
  const cleaned = items.map(cleanFramerText).filter((s) => s.length > 0);

  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of cleaned) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}
