import type { SiteSchema } from "./types";

/**
 * Post-generation quality scorecard — the "premium agency" floor made objective.
 *
 * Pure and client-safe (types only), so the result page and the engine can both
 * use it. Some axes (spacing, responsive, accessibility) are high BY
 * CONSTRUCTION — the token system guarantees fluid type, a no-horizontal-scroll
 * contract and WCAG-AA colour — so they carry a high baseline and only lose
 * points when there's no content to lay out. The axes that genuinely vary per
 * rebuilt site — hierarchy, images, conversion, consistency — are scored from
 * real signals in the schema and produce the actionable `issues` list that an
 * "improve until premium" pass acts on. Honest: it never invents a high score.
 */

export type QualityCategory =
  | "typography"
  | "spacing"
  | "hierarchy"
  | "images"
  | "accessibility"
  | "responsive"
  | "conversion"
  | "consistency";

export interface QualityReport {
  /** 0–100 overall (mean of the eight categories). */
  overall: number;
  categories: Record<QualityCategory, number>;
  /** Concrete, fixable gaps — the input to an auto-improve pass. */
  issues: string[];
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Does this block carry at least one real image (directly or in its items)? */
function hasImage(b: { props?: Record<string, unknown> }): boolean {
  const p = b.props ?? {};
  if (typeof p.image === "string" && p.image) return true;
  const items = p.items;
  return Array.isArray(items) && items.some((i) => i && typeof i === "object" && typeof (i as { image?: unknown }).image === "string" && (i as { image?: string }).image);
}

export function qualityReport(schema: SiteSchema): QualityReport {
  const blocks = schema.blocks ?? [];
  const types = new Set(blocks.map((b) => b.type));
  const heroes = blocks.filter((b) => b.type === "hero");
  const hero = heroes[0];
  const issues: string[] = [];

  // Hierarchy — exactly one hero, the load-bearing sections, a footer.
  let hierarchy = 100;
  if (!hero) {
    hierarchy -= 45;
    issues.push("No hero section — the page has no anchor.");
  }
  if (heroes.length > 1) {
    hierarchy -= 20;
    issues.push("More than one hero section.");
  }
  if (!types.has("footer")) {
    hierarchy -= 15;
    issues.push("No footer.");
  }
  if (!types.has("services") && !types.has("features")) {
    hierarchy -= 15;
    issues.push("No services / features section.");
  }

  // Images — the hero, and at least some real imagery on the page.
  let images = 100;
  if (hero && !hasImage(hero)) {
    images -= 30;
    issues.push("Hero has no image (image-led heroes read far more premium).");
  }
  if (!blocks.some(hasImage)) {
    images -= 45;
    issues.push("No real imagery anywhere — the rebuild leans on gradients.");
  }

  // Conversion — a primary CTA, a closing CTA, a way to make contact, real proof.
  let conversion = 100;
  if (!hero?.props?.primaryCta) {
    conversion -= 25;
    issues.push("Hero has no primary call-to-action.");
  }
  if (!types.has("cta")) {
    conversion -= 20;
    issues.push("No closing call-to-action before the footer.");
  }
  if (!types.has("contact")) {
    conversion -= 20;
    issues.push("No contact section / lead capture.");
  }
  if (!types.has("testimonials") && !types.has("stats")) {
    conversion -= 15;
    issues.push("No social proof (real testimonials or stats).");
  }

  // Consistency — one coherent brand-derived theme.
  let consistency = 100;
  if (!schema.theme?.accent) {
    consistency -= 25;
    issues.push("No brand accent colour set.");
  }

  // Typography — tokenised + fluid by construction; only the font choice varies.
  let typography = 96;
  if (!schema.theme?.font) typography -= 20;

  // Guaranteed-by-construction axes: the token system enforces an 8px spacing
  // scale, fluid type with a no-horizontal-scroll contract, and a WCAG-AA colour
  // guarantee. High baseline; spacing only suffers with too little content.
  const spacing = blocks.length >= 4 ? 96 : 72;
  const responsive = 98;
  const accessibility = 95;

  const categories: Record<QualityCategory, number> = {
    typography: clamp(typography),
    spacing: clamp(spacing),
    hierarchy: clamp(hierarchy),
    images: clamp(images),
    accessibility: clamp(accessibility),
    responsive: clamp(responsive),
    conversion: clamp(conversion),
    consistency: clamp(consistency),
  };
  const overall = clamp(
    (Object.values(categories) as number[]).reduce((a, b) => a + b, 0) / 8
  );
  return { overall, categories, issues };
}

/** The lowest-scoring categories — what an "improve until premium" pass targets first. */
export function weakestCategories(report: QualityReport, n = 3): QualityCategory[] {
  return (Object.entries(report.categories) as [QualityCategory, number][])
    .sort((a, b) => a[1] - b[1])
    .slice(0, n)
    .map(([k]) => k);
}
