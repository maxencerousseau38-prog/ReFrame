import type { PassContext, PassResult } from "./types";
import { extractImages, findLogo, validateImages } from "@/lib/generation/engine";

/**
 * Pass 3 — Media Extraction
 *
 * Extracts images, logos, and background images from the source page.
 * Handles platform-specific selectors (Framer image containers).
 */
export async function runMediaPass(ctx: PassContext): Promise<PassResult> {
  // 1. Logo detection
  const logo = findLogo(ctx.root, ctx.url);

  // 2. Extract and validate content images
  const rawImages = extractImages(ctx.root, ctx.url);
  const validated = await validateImages(rawImages);

  // 3. First validated image is the hero, rest are gallery
  const hero = validated.length > 0 ? validated[0] : undefined;
  const gallery = validated.slice(1);

  // 5. Extract background images from CSS (background-image url() patterns)
  const backgrounds: string[] = [];
  const bgUrlRe = /background(?:-image)?\s*:[^;}]*url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;

  // Scan <style> tags
  for (const styleEl of ctx.root.querySelectorAll("style")) {
    let match: RegExpExecArray | null;
    while ((match = bgUrlRe.exec(styleEl.text))) {
      backgrounds.push(resolveUrl(match[1], ctx.url));
    }
  }

  // Scan inline styles
  for (const el of ctx.root.querySelectorAll("[style]")) {
    const style = el.getAttribute("style") || "";
    let match: RegExpExecArray | null;
    bgUrlRe.lastIndex = 0;
    while ((match = bgUrlRe.exec(style))) {
      backgrounds.push(resolveUrl(match[1], ctx.url));
    }
  }

  // 6. Framer-specific image extraction
  if (ctx.platform === "framer") {
    // Images with explicit Framer component type
    for (const el of ctx.root.querySelectorAll('[data-framer-component-type="image"]')) {
      const src =
        el.getAttribute("src") ||
        el.getAttribute("data-src") ||
        el.querySelector("img")?.getAttribute("src") ||
        "";
      if (src) {
        const resolved = resolveUrl(src, ctx.url);
        if (resolved && !gallery.includes(resolved)) {
          gallery.push(resolved);
        }
      }
    }

    // Images inside named Framer containers
    for (const container of ctx.root.querySelectorAll("[data-framer-name]")) {
      for (const img of container.querySelectorAll("img")) {
        const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
        if (src) {
          const resolved = resolveUrl(src, ctx.url);
          if (resolved && !gallery.includes(resolved)) {
            gallery.push(resolved);
          }
        }
      }
    }
  }

  // Filter backgrounds to valid http(s) URLs and deduplicate
  const validBackgrounds = dedupe(
    backgrounds.filter((u) => /^https?:/i.test(u))
  );

  return {
    updates: {
      images: {
        hero,
        logo,
        gallery: dedupe(gallery),
        backgrounds: validBackgrounds.length > 0 ? validBackgrounds : undefined,
      },
    },
  };
}

function resolveUrl(src: string, base: string): string {
  if (!src) return "";
  try {
    return new URL(src, base).href;
  } catch {
    return "";
  }
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}
