import { z } from "zod";
import type { Block, BlockType, Industry, SiteSchema, Theme } from "./types";
import { BLOCK_CATALOG, pickVariant } from "./catalog";
import { renderableCategory } from "./structure";

/**
 * Strict, repairing validation for a SiteSchema before it is rendered or
 * persisted.
 *
 * The LLM edit path (`aiEdit`) and any client-supplied schema are untrusted: a
 * bad `variant`, a malformed `theme`, or missing `props` would otherwise reach
 * the renderer and silently drop a block or throw. `parseSiteSchema` coerces
 * what it safely can (theme enums/hex -> defaults, unknown/ mismatched variants
 * -> a valid variant for the block's category) and rejects what it cannot,
 * returning `null` so callers fall back to a known-good schema.
 */

const VARIANTS = new Set(BLOCK_CATALOG.map((b) => b.variant));
const VARIANT_CATEGORY = new Map(BLOCK_CATALOG.map((b) => [b.variant, b.category]));

const BLOCK_TYPES: BlockType[] = [
  "hero", "features", "testimonials", "faq", "cta", "contact", "footer",
  "about", "services", "portfolio", "products", "pricing", "gallery", "logos", "stats",
];
const INDUSTRIES: Industry[] = [
  "restaurant", "artisan", "realestate", "saas", "agency", "ecommerce", "health", "generic",
];

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const DEFAULT_THEME: Theme = {
  primary: "#0a0a0a",
  accent: "#6366f1",
  radius: "lg",
  font: "inter",
  mood: "minimal",
};

const themeSchema: z.ZodType<Theme> = z
  .object({
    primary: z.string().regex(HEX).catch(DEFAULT_THEME.primary),
    accent: z.string().regex(HEX).catch(DEFAULT_THEME.accent),
    radius: z.enum(["sm", "md", "lg", "xl"]).catch(DEFAULT_THEME.radius),
    font: z.enum(["inter", "geist", "serif"]).catch(DEFAULT_THEME.font),
    mood: z.enum(["minimal", "bold", "warm", "elegant"]).catch(DEFAULT_THEME.mood),
    dark: z.boolean().optional().catch(undefined),
    surface: z.string().regex(HEX).optional().catch(undefined),
    surface2: z.string().regex(HEX).optional().catch(undefined),
    ink: z.string().regex(HEX).optional().catch(undefined),
  })
  .catch(DEFAULT_THEME) as z.ZodType<Theme>;

function uid(prefix = "b"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Validate one block, repairing the variant when it is unknown or doesn't match
 * the block's renderable category. Returns null only when the block has no
 * recognizable type (can't be placed at all).
 */
function sanitizeBlock(raw: unknown, industry: Industry, seed: string): Block | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const type = BLOCK_TYPES.includes(r.type as BlockType) ? (r.type as BlockType) : null;
  if (!type) return null;

  const category = renderableCategory(type);
  let variant: string | null =
    typeof r.variant === "string" && VARIANTS.has(r.variant) ? r.variant : null;
  // A known variant from the wrong category (e.g. "Footer1" in a hero slot) is
  // as broken as an unknown one — repair it to a valid variant for this type.
  if (variant && VARIANT_CATEGORY.get(variant) !== category) variant = null;
  if (!variant) variant = pickVariant(category, industry, seed);

  const props =
    r.props && typeof r.props === "object" && !Array.isArray(r.props)
      ? (r.props as Record<string, unknown>)
      : {};
  const id = typeof r.id === "string" && r.id ? r.id : uid();

  return { id, type, variant, props };
}

/**
 * Parse an untrusted value into a renderable SiteSchema, or null if it can't be
 * salvaged (not an object, or no valid blocks remain).
 */
export function parseSiteSchema(value: unknown, fallbackSeed = "site"): SiteSchema | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, any>;

  const industry: Industry = INDUSTRIES.includes(v.industry) ? v.industry : "generic";
  const theme = themeSchema.parse(v.theme ?? {});

  const brandName =
    typeof v.brand?.name === "string" && v.brand.name.trim() ? v.brand.name.trim() : "Your Brand";
  const seed = brandName || fallbackSeed;

  const rawBlocks = Array.isArray(v.blocks) ? v.blocks : [];
  const blocks = rawBlocks
    .map((b: unknown) => sanitizeBlock(b, industry, seed))
    .filter((b: Block | null): b is Block => b !== null);
  if (blocks.length === 0) return null; // unrenderable

  // Additional pages (multi-page sites). Sanitize each page's blocks the same
  // way; drop pages with no valid block. Preserving these here is essential -
  // publish/edit run through parseSiteSchema, so omitting them would strip
  // multi-page sites back to a single page.
  const pages = Array.isArray(v.pages)
    ? v.pages
        .map((p: any) => {
          if (!p || typeof p !== "object") return null;
          const pageBlocks = (Array.isArray(p.blocks) ? p.blocks : [])
            .map((b: unknown) => sanitizeBlock(b, industry, seed))
            .filter((b: Block | null): b is Block => b !== null);
          if (!pageBlocks.length) return null;
          return {
            path: typeof p.path === "string" ? p.path.replace(/[^a-z0-9-]/gi, "").slice(0, 40) : "",
            label: typeof p.label === "string" && p.label.trim() ? p.label.slice(0, 40) : "Page",
            blocks: pageBlocks,
          };
        })
        .filter((p: unknown): p is { path: string; label: string; blocks: Block[] } => p !== null)
    : undefined;

  const mode =
    v.mode === "classic" || v.mode === "preserve" || v.mode === "smart" ? v.mode : undefined;

  const recommendations = Array.isArray(v.recommendations)
    ? v.recommendations
        .filter((r: any) => r && typeof r.action === "string" && typeof r.reason === "string")
        .map((r: any) => ({ action: r.action as string, reason: r.reason as string }))
    : undefined;

  return {
    id: typeof v.id === "string" && v.id ? v.id : uid("site"),
    sourceUrl: typeof v.sourceUrl === "string" ? v.sourceUrl : "",
    industry,
    brand: {
      name: brandName,
      tagline: typeof v.brand?.tagline === "string" ? v.brand.tagline : "",
      ...(typeof v.brand?.logo === "string" && v.brand.logo ? { logo: v.brand.logo } : {}),
    },
    theme,
    blocks,
    pages: pages && pages.length ? pages : undefined,
    mode,
    recommendations: recommendations && recommendations.length ? recommendations : undefined,
    animations: typeof v.animations === "boolean" ? v.animations : undefined,
  };
}
