/**
 * Creative Director Score — the automated senior-CD review that runs after every
 * generation. It answers, in numbers, the only question that matters: would a
 * premium agency put its name on this?
 *
 * It is deliberately NOT a second, parallel scoring engine. It reads the eight
 * dimensions the Quality Gate already measured (0–100) and re-frames them as the
 * six axes a Creative Director actually argues about, on a /10 scale, plus one
 * signal the gate doesn't have: did the page actually EXECUTE the creative
 * direction it was given (does the Art Direction match the chosen Design DNA)?
 *
 * Below 8.5 overall, `weakest` names what to fix — and the pipeline's existing
 * quality-iteration loop, which tunes the very dimensions these axes read from,
 * is what raises them.
 */

import type { QualityScore } from "./quality-gate";
import type { ArtDirection } from "./art-direction";
import type { DesignDNAProfile } from "./design-dna-library";
import type { SiteSchema } from "./types";

export interface CreativeDirectorScore {
  /** Does it feel like THIS business? (brand fidelity) */
  identity: number;
  /** Would a designer be surprised it's generated? (layout originality) */
  originality: number;
  /** Is the craft premium? (premium + editorial) */
  visualQuality: number;
  /** Does every decision agree with the brand's direction? */
  brandCoherence: number;
  /** Would an agency sell this for 20–50k€? (overall) */
  premiumAgency: number;
  /** How much does it read as an AI template? LOWER is better. */
  templateRisk: number;
  /** Weighted overall /10. */
  overall: number;
  /** overall >= 8.5 */
  passes: boolean;
  /** The axes dragging the score down, worst first, with why. */
  weakest: { axis: string; score: number; why: string }[];
}

const PASS = 8.5;

/** 0–100 → 0–10, one decimal. */
const to10 = (s: number) => Math.round(s) / 10;
const clamp10 = (n: number) => Math.max(0, Math.min(10, Math.round(n * 10) / 10));

/** Section types whose renderers live or die by a populated `items` array. */
const ITEMS_SECTIONS = new Set(["features", "services", "portfolio", "gallery", "products", "testimonials", "stats"]);

interface Substance {
  /** Content sections that render as a lone title over a void (items missing/empty). */
  thin: string[];
  /** Repetition: a variant reused across unrelated section types. */
  repeatedVariants: string[];
}

/**
 * A human CD's first read is "is anything actually ON the page?" — an empty
 * features grid or a vanished gallery is the loudest "AI-generated" tell. Read
 * the built schema for content sections that came out substance-less, and for
 * lazy repetition of the same variant.
 */
function inspectSubstance(schema?: SiteSchema): Substance {
  const thin: string[] = [];
  const variantUse = new Map<string, string[]>();
  if (!schema) return { thin, repeatedVariants: [] };
  for (const b of schema.blocks) {
    const props = (b.props ?? {}) as Record<string, unknown>;
    if (ITEMS_SECTIONS.has(b.type)) {
      const items = Array.isArray(props.items) ? props.items.length : 0;
      if (items === 0) thin.push(b.type);
    }
    if (b.variant) {
      const arr = variantUse.get(b.variant) ?? [];
      arr.push(b.type);
      variantUse.set(b.variant, arr);
    }
  }
  const repeatedVariants = Array.from(variantUse.entries())
    .filter(([, types]) => new Set(types).size > 1)
    .map(([v]) => v);
  return { thin, repeatedVariants };
}

/**
 * How faithfully the produced Art Direction executed the chosen Design DNA —
 * the fraction of signature mechanisms (hero, narrative, contrast, motion) that
 * actually landed. A page that ignores its own creative brief is incoherent
 * however pretty each part is.
 */
function directionAdherence(ad: ArtDirection, dna?: DesignDNAProfile): number {
  if (!dna) return 0.5; // neutral when no direction was chosen
  const m = dna.mechanisms;
  let hits = 0;
  const total = 4;
  if (ad.heroPhilosophy === m.heroPhilosophy) hits++;
  if (ad.pageStorytelling === m.narrative) hits++;
  if (ad.contrastStrategy === m.contrast) hits++;
  if (ad.motionPhilosophy === m.motion) hits++;
  return hits / total;
}

export function scoreCreativeDirection(
  quality: QualityScore,
  artDirection?: ArtDirection,
  designDNA?: DesignDNAProfile,
  schema?: SiteSchema,
): CreativeDirectorScore {
  const q = quality;
  const { thin, repeatedVariants } = inspectSubstance(schema);

  // A void section is the loudest AI tell — penalise HARD, per empty section.
  const thinPenalty = Math.min(thin.length * 1.6, 5);
  const repeatPenalty = Math.min(repeatedVariants.length * 0.6, 1.5);

  const identity = clamp10(to10(q.brandFidelity.score) - thinPenalty * 0.4);
  const originality = clamp10(to10(q.layoutOriginality.score) - repeatPenalty);
  const visualQuality = clamp10(to10(q.premiumScore.score) * 0.6 + to10(q.editorialQuality.score) * 0.4 - thinPenalty);

  // Coherence blends the gate's composition score with how well the page
  // executed its creative direction (adherence to the Design DNA).
  const adherence = artDirection ? directionAdherence(artDirection, designDNA) : 0.5;
  const brandCoherence = clamp10(to10(q.compositionQuality.score) * 0.55 + to10(q.brandFidelity.score) * 0.2 + adherence * 10 * 0.25);

  const premiumAgency = clamp10(to10(q.total) - thinPenalty * 0.8);

  // Template risk is high when the layout is generic, resembles the stock Framer
  // shape, OR carries empty sections (nothing reads more "generated" than a void).
  const templateSafety = to10(q.layoutOriginality.score) * 0.5 + to10(q.framerSimilarity.score) * 0.5;
  const templateRisk = clamp10(10 - templateSafety + thinPenalty + repeatPenalty);

  const overall = clamp10(
    identity * 0.18 +
    originality * 0.18 +
    visualQuality * 0.18 +
    brandCoherence * 0.16 +
    premiumAgency * 0.15 +
    (10 - templateRisk) * 0.15,
  );

  const axes: { axis: string; score: number; why: string }[] = [
    { axis: "identity", score: identity, why: "the page doesn't feel specific to this business" },
    { axis: "originality", score: originality, why: repeatedVariants.length ? `a variant is reused across sections (${repeatedVariants.join(", ")})` : "the layout is too close to a default arrangement" },
    { axis: "visualQuality", score: visualQuality, why: thin.length ? `empty/thin sections: ${thin.join(", ")}` : "the craft doesn't read as premium yet" },
    { axis: "brandCoherence", score: brandCoherence, why: "decisions don't all agree with the brand's direction" },
    { axis: "premiumAgency", score: premiumAgency, why: "overall it wouldn't command an agency price" },
    { axis: "templateRisk", score: 10 - templateRisk, why: thin.length ? "empty sections read as machine-generated" : "it still reads as an AI template" },
  ];
  const weakest = axes.filter((a) => a.score < 8).sort((a, b) => a.score - b.score);

  return {
    identity,
    originality,
    visualQuality,
    brandCoherence,
    premiumAgency,
    templateRisk,
    overall,
    passes: overall >= PASS,
    weakest,
  };
}
