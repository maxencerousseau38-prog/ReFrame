import type { BlockType, SiteStructure, DetectedSection } from "./types";

/**
 * Structure engine: turn the raw signals of a page (its headings in DOM order,
 * nav labels, and a few presence flags) into a normalized, ordered structural
 * model. This is what powers Preserve and Smart modes - it lets ReFrame keep a
 * client's architecture instead of always imposing a canonical one.
 *
 * Pure and deterministic so it is trivially testable and can be refined by the
 * LLM layer later without changing callers.
 */

/** Keyword -> section type. First match wins; order matters (specific first). */
const RULES: { type: BlockType; re: RegExp }[] = [
  { type: "faq", re: /\b(faq|frequently asked|questions?)\b/i },
  { type: "pricing", re: /\b(pricing|plans?|packages?|rates?|tarifs?)\b/i },
  { type: "testimonials", re: /\b(testimonial|reviews?|clients? say|what (our|people)|loved|avis|t[ée]moignages?)\b/i },
  { type: "portfolio", re: /\b(portfolio|case stud(y|ies)|our work|projects?|réalisations?|réalisation)\b/i },
  { type: "gallery", re: /\b(gallery|galerie|photos?)\b/i },
  { type: "products", re: /\b(products?|shop|store|menu|collection|boutique)\b/i },
  { type: "emergency", re: /\b(emergency|urgent|24[/.]?7|dépannage|urgence)\b/i },
  { type: "process", re: /\b(process|how we work|method|m[ée]thode|[ée]tapes|approach|our approach)\b/i },
  { type: "before-after", re: /\b(before.?after|avant.?apr[eè]s|transformation|r[ée]sultat)\b/i },
  { type: "booking", re: /\b(reservation|r[ée]server|book a room|book a table|booking)\b/i },
  { type: "map", re: /\b(map|location|zone d.intervention|our location|localisation|quartiers?)\b/i },
  { type: "schedule", re: /\b(schedule|planning|horaires?|hours|opening hours|cours|classes?)\b/i },
  { type: "newsletter", re: /\b(newsletter|subscribe|inscription|s.inscrire|mailing list)\b/i },
  { type: "services", re: /\b(services?|what we do|solutions?|offerings?|prestations?)\b/i },
  { type: "about", re: /\b(about|our story|who we are|mission|notre histoire|à propos|values?)\b/i },
  { type: "stats", re: /\b(by the numbers|results|stats|impact|chiffres)\b/i },
  { type: "logos", re: /\b(trusted by|as seen|partners?|clients?|partenaires)\b/i },
  { type: "contact", re: /\b(contact|get in touch|reach us|book|nous contacter)\b/i },
  { type: "features", re: /\b(features?|why|benefits?|capabilities|how it works|avantages?)\b/i },
];

function classify(label: string): { type: BlockType; confidence: number } | null {
  for (const rule of RULES) {
    if (rule.re.test(label)) return { type: rule.type, confidence: 0.85 };
  }
  return null;
}

export interface StructureSignals {
  /** Section headings (h1/h2/h3) in DOM order. */
  headings: string[];
  nav: string[];
  hasForm: boolean;
  hasFooter: boolean;
}

/**
 * Build the normalized structure. Always anchored by a hero first and a footer
 * last; the middle preserves the source's heading order. Consecutive duplicates
 * are collapsed.
 */
export function detectStructure(signals: StructureSignals): SiteStructure {
  const sections: DetectedSection[] = [];
  let order = 1;
  const push = (type: BlockType, confidence: number, label?: string) => {
    const prev = sections[sections.length - 1];
    if (prev && prev.type === type) return; // collapse repeats
    sections.push({ type, order: order++, confidence, label });
  };

  push("hero", 0.95, signals.headings[0]);

  // Classify each heading after the first into a section type, in order.
  for (const h of signals.headings.slice(1)) {
    const hit = classify(h);
    if (hit) push(hit.type, hit.confidence, h);
  }

  // Nav labels can reveal sections the headings missed (lower confidence).
  for (const item of signals.nav) {
    const hit = classify(item);
    if (hit && !sections.some((s) => s.type === hit.type)) {
      push(hit.type, 0.5, item);
    }
  }

  if (signals.hasForm && !sections.some((s) => s.type === "contact")) {
    push("contact", 0.7, "contact form");
  }
  push("footer", 0.95, undefined);

  return { sections, nav: signals.nav };
}

/** Sections we have a dedicated, renderable component category for today. */
const RENDERABLE: BlockType[] = [
  "hero", "features", "services", "portfolio", "stats", "about",
  "testimonials", "faq", "cta", "contact", "footer",
];

/**
 * Map any (possibly extended-taxonomy) section type to the closest category
 * that has a registered component, so Preserve/Smart never emit a blank block.
 * As premium components for the remaining types land, this table shrinks -
 * callers do not change.
 */
export function renderableCategory(type: BlockType): BlockType {
  if (RENDERABLE.includes(type)) return type;
  switch (type) {
    case "products":
    case "gallery":
    case "before-after":
      return "portfolio"; // visual grids
    case "logos":
    case "pricing":
    case "process":
    case "schedule":
      return "features";
    case "emergency":
    case "newsletter":
      return "cta";
    case "booking":
    case "map":
      return "contact";
    default:
      return "features";
  }
}
