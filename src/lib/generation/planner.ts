import type { BlockType, SiteStructure, Recommendation } from "./types";
import { renderableCategory } from "./structure";

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

/** Preserve: keep the client's architecture and order, upgrade the components. */
export function planPreserve(structure?: SiteStructure): Plan {
  if (!structure || structure.sections.length < 3) return planClassic();
  const slots = anchor(structure.sections.map((s) => slot(s.type, s.label)));
  return { slots, recommendations: [] };
}

/** Smart: start from Preserve, then optimize for conversion. */
export function planSmart(structure?: SiteStructure): Plan {
  const base = planPreserve(structure);
  const recs: Recommendation[] = [];

  // Work on the middle only; keep hero first and footer last.
  const hero = base.slots[0];
  const footer = base.slots[base.slots.length - 1];
  const middle = base.slots.slice(1, -1);

  const has = (cat: BlockType) => middle.some((s) => s.category === cat);
  const indexOfCat = (cat: BlockType) => middle.findIndex((s) => s.category === cat);

  // 1. A value/feature section right after the hero.
  if (!has("features")) {
    middle.unshift(slot("features"));
    recs.push({ action: "Added a value section", reason: "No clear value proposition was found after the hero." });
  }

  // 2. Social proof. If missing, add it after the value section.
  if (!has("testimonials")) {
    const at = Math.min(indexOfCat("features") + 1, middle.length);
    middle.splice(Math.max(at, 1), 0, slot("testimonials"));
    recs.push({ action: "Added testimonials", reason: "Social proof lifts conversion and none was present." });
  } else {
    // Move testimonials below the value section if it appears too early.
    const ti = indexOfCat("testimonials");
    const fi = indexOfCat("features");
    if (ti >= 0 && fi >= 0 && ti < fi) {
      const [t] = middle.splice(ti, 1);
      middle.splice(indexOfCat("features") + 1, 0, t);
      recs.push({ action: "Moved testimonials below the value sections", reason: "Proof lands harder after the offer is made." });
    }
  }

  // 3. FAQ to handle objections, before contact.
  if (!has("faq")) {
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
