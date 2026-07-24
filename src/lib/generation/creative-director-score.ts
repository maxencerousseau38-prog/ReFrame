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
): CreativeDirectorScore {
  const q = quality;

  const identity = to10(q.brandFidelity.score);
  const originality = to10(q.layoutOriginality.score);
  const visualQuality = clamp10(to10(q.premiumScore.score) * 0.6 + to10(q.editorialQuality.score) * 0.4);

  // Coherence blends the gate's composition score with how well the page
  // executed its creative direction (adherence to the Design DNA).
  const adherence = artDirection ? directionAdherence(artDirection, designDNA) : 0.5;
  const brandCoherence = clamp10(to10(q.compositionQuality.score) * 0.55 + to10(q.brandFidelity.score) * 0.2 + adherence * 10 * 0.25);

  const premiumAgency = to10(q.total);

  // Template risk is high when the layout is generic AND it resembles the
  // stock Framer template shape. framerSimilarity.score is high when DISTINCT,
  // so both are "safety" signals; risk is their inverse.
  const templateSafety = to10(q.layoutOriginality.score) * 0.55 + to10(q.framerSimilarity.score) * 0.45;
  const templateRisk = clamp10(10 - templateSafety);

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
    { axis: "originality", score: originality, why: "the layout is too close to a default arrangement" },
    { axis: "visualQuality", score: visualQuality, why: "the craft doesn't read as premium yet" },
    { axis: "brandCoherence", score: brandCoherence, why: "decisions don't all agree with the brand's direction" },
    { axis: "premiumAgency", score: premiumAgency, why: "overall it wouldn't command an agency price" },
    { axis: "templateRisk", score: 10 - templateRisk, why: "it still reads as an AI template" },
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
