import type { BlockType, SiteStructure, Recommendation, DesignFamily } from "./types";
import { renderableCategory } from "./structure";

export type { DesignFamily };

/**
 * Planners turn a mode + the detected structure into an ordered list of section
 * slots (plus, for Smart, the optimizations applied). The composer in the engine
 * fills each slot with a variant and content. Keeping planning separate from
 * composing is what makes Classic / Preserve / Smart swappable and testable.
 */

export interface Slot {
  /** Semantic type (extended taxonomy), kept for display/tracing. */
  type: BlockType;
  /** Renderable category used to select a component + build props. */
  category: BlockType;
  label?: string;
}

export interface Plan {
  slots: Slot[];
  recommendations: Recommendation[];
}

const CANONICAL: BlockType[] = ["hero", "features", "testimonials", "faq", "cta", "contact", "footer"];

function slot(type: BlockType, label?: string): Slot {
  return { type, category: renderableCategory(type), label };
}

/** Hero exactly once at the front, footer exactly once at the back. */
function anchor(slots: Slot[]): Slot[] {
  const middle = slots.filter((s) => s.type !== "hero" && s.type !== "footer");
  const hero = slots.find((s) => s.type === "hero") ?? slot("hero");
  const footer = slots.find((s) => s.type === "footer") ?? slot("footer");
  return [hero, ...middle, footer];
}

/** Classic: ignore the source order, emit the proven canonical structure. */
export function planClassic(): Plan {
  return { slots: CANONICAL.map((t) => slot(t)), recommendations: [] };
}

/**
 * Explicit/AI layout: build slots from a given ordered list of section types
 * (e.g. composed by the LLM from the real content). Hero is anchored first and
 * footer last; a contact section is guaranteed so every CTA has a destination.
 */
export function planExplicit(types: BlockType[]): Plan {
  const hasContact = types.some((t) => renderableCategory(t) === "contact");
  const list: BlockType[] = hasContact ? types : [...types, "contact"];
  return { slots: anchor(list.map((t) => slot(t))), recommendations: [] };
}

/** Preserve: keep the client's architecture and order, upgrade the components. */
/**
 * Preserve: keep the client's architecture and order, upgrade the components.
 * But many real homepages (heading-poor B2B catalogs, JS-rendered shells) yield
 * little or no detectable structure. "Preserving" that produces a near-empty
 * hero+contact+footer stub - worse than a real page. So when there isn't at
 * least one genuine *content* section between the hero and footer, fall back to
 * the proven canonical layout, which rebuilds a full page from the extracted
 * content instead.
 */
export function planPreserve(structure?: SiteStructure): Plan {
  if (!structure || structure.sections.length < 3) return planClassic();
  const slots = anchor(structure.sections.map((s) => slot(s.type, s.label)));
  const NON_CONTENT: BlockType[] = ["hero", "footer", "contact", "cta"];
  const hasContent = slots.some((s) => !NON_CONTENT.includes(s.category));
  if (!hasContent) return planClassic();
  return { slots, recommendations: [] };
}

/**
 * DESIGN FAMILIES — the root of real variety. The old flows all marched through
 * the same arc (hero → gallery/portfolio → features → about → stats →
 * testimonials → faq → cta → …), so every generated site read as one skeleton
 * re-skinned. A family gives a WHOLE class of brands its own narrative arc AND
 * its own reading rhythm; per-family `prefer` variants (in the catalog) then
 * give it its own heroes/sections/CTAs. Five families, five genuinely different
 * page architectures:
 *
 *  - editorial  : work-first studio narrative — portfolio, then a statement,
 *                 then process, monumental & airy. (architects, agencies, property, build)
 *  - hospitality: immersive imagery + story + evening proof, no metrics/FAQ. (restaurants, hotels)
 *  - product    : value → metrics → proof → objections → convert, dense. (SaaS, gyms)
 *  - retail     : shop imagery → features → proof → buy, short & punchy. (e-commerce, fashion, auto)
 *  - trust      : value → who we are → credentials → proof → objections → book, calm. (health, legal, trades, finance)
 */
const FAMILY_FLOW: Record<DesignFamily, BlockType[]> = {
  editorial: ["hero", "portfolio", "about", "features", "stats", "testimonials", "cta", "contact", "footer"],
  hospitality: ["hero", "gallery", "about", "features", "testimonials", "cta", "contact", "footer"],
  product: ["hero", "features", "stats", "testimonials", "faq", "cta", "contact", "footer"],
  retail: ["hero", "gallery", "features", "testimonials", "cta", "contact", "footer"],
  trust: ["hero", "features", "about", "stats", "testimonials", "faq", "cta", "contact", "footer"],
};

/** Reading rhythm per family: a global multiplier on every section's vertical
 *  padding (consumed via `--rf-rhythm`). Editorial breathes; product is dense.
 *  Floored at 1 so it never regresses below the premium V5 baseline. */
export const FAMILY_RHYTHM: Record<DesignFamily, number> = {
  editorial: 1.35,
  hospitality: 1.18,
  retail: 1.05,
  product: 1.0,
  trust: 1.08,
};

const SECTOR_FAMILY: Record<string, DesignFamily> = {
  architect: "editorial", agency: "editorial", realestate: "editorial", construction: "editorial",
  restaurant: "hospitality", hotel: "hospitality",
  saas: "product", gym: "product",
  ecommerce: "retail", fashion: "retail", automotive: "retail",
  health: "trust", medical: "trust", lawyer: "trust", finance: "trust",
  coach: "trust", plumber: "trust", electrician: "trust", artisan: "trust",
};

/** The design family a sector belongs to (undefined → generic, no family flow). */
export function familyOf(industry?: string): DesignFamily | undefined {
  return industry ? SECTOR_FAMILY[industry] : undefined;
}

/** Smart: a premium per-trade composition (identity preserved, empty sections
 *  dropped); falls back to Preserve + conversion tuning for unknown sectors.
 *  `opts.hasFaq === false` (V2 Chantier 6d, F14): the source has no real FAQ —
 *  no FAQ slot is planned and no "Added an FAQ" recommendation is emitted, so
 *  the plan never describes a section the composer will refuse to fabricate. */
export function planSmart(
  structure?: SiteStructure,
  industry?: string,
  opts?: { hasFaq?: boolean }
): Plan {
  const noFaq = opts?.hasFaq === false;
  const family = familyOf(industry);
  const flow = family ? FAMILY_FLOW[family] : undefined;
  if (flow) {
    const kept = noFaq ? flow.filter((t) => t !== "faq") : flow;
    return {
      slots: anchor(kept.map((t) => slot(t))),
      recommendations: [
        {
          action: `Composed a premium ${family} layout for ${industry}`,
          reason: `Arranged into the ${family} family's narrative arc; sections without real content are dropped.`,
        },
      ],
    };
  }

  const base = planPreserve(structure);
  const recs: Recommendation[] = [];

  // Work on the middle only; keep hero first and footer last.
  // F14: the canonical/preserved base may carry a FAQ slot — drop it too
  // when the source has no real FAQ.
  const hero = base.slots[0];
  const footer = base.slots[base.slots.length - 1];
  const middle = base.slots
    .slice(1, -1)
    .filter((s) => !(noFaq && s.category === "faq"));

  const has = (cat: BlockType) => middle.some((s) => s.category === cat);
  const indexOfCat = (cat: BlockType) => middle.findIndex((s) => s.category === cat);

  // 1. A value/feature section right after the hero.
  if (!has("features")) {
    middle.unshift(slot("features"));
    recs.push({ action: "Added a value section", reason: "No clear value proposition was found after the hero." });
  }

  // 2. Social proof: never fabricate it. We only reorder a *real* testimonials
  //    section so it lands after the value section; if none was extracted we
  //    leave it to the hybrid flow rather than invent praise.
  const ti = indexOfCat("testimonials");
  const fi = indexOfCat("features");
  if (ti >= 0 && fi >= 0 && ti < fi) {
    const [t] = middle.splice(ti, 1);
    middle.splice(indexOfCat("features") + 1, 0, t);
    recs.push({ action: "Moved testimonials below the value sections", reason: "Proof lands harder after the offer is made." });
  }

  // 3. FAQ to handle objections, before contact — only when the source has a
  //    REAL one (F14: never plan or claim a section that won't exist).
  if (!has("faq") && !noFaq) {
    const ci = indexOfCat("contact");
    middle.splice(ci >= 0 ? ci : middle.length, 0, slot("faq"));
    recs.push({ action: "Added an FAQ", reason: "Answering objections before the ask reduces drop-off." });
  }

  // 4. A closing CTA before contact/footer.
  if (!has("cta")) {
    const ci = indexOfCat("contact");
    middle.splice(ci >= 0 ? ci : middle.length, 0, slot("cta"));
    recs.push({ action: "Added a closing call to action", reason: "Every page needs one clear next step." });
  }

  // 5. A contact section to capture intent.
  if (!has("contact")) {
    middle.push(slot("contact"));
    recs.push({ action: "Added a contact section", reason: "Visitors had no direct way to get in touch." });
  }

  return { slots: [hero, ...middle, footer], recommendations: recs };
}
