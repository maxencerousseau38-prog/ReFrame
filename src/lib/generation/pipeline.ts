/**
 * V5 Generation Pipeline — orchestrates the full DNA-driven generation.
 *
 * This is the top-level entry point that ties together:
 *   1. Business Intelligence (analyzeBusinessProfile)
 *   2. Reference Engine (buildMoodboard)
 *   3. DNA Compiler (compileDNA + applyMoodboard)
 *   4. Composer (compose)
 *   5. Quality Gate (evaluateQuality)
 *
 * The pipeline runs deterministically when no LLM is configured.
 * When Claude is available, it augments the DNA and performs artistic critique.
 *
 * Backward-compatible: the existing generateSite() is still available.
 * This pipeline is the V5 upgrade path.
 */

import type { SiteAnalysis, SiteSchema, Theme } from "./types";
import type { BusinessProfile } from "./business";
import type { DesignDNA } from "./dna";
import type { Moodboard } from "./references";
import type { QualityScore } from "./quality-gate";
import { analyzeBusinessProfile } from "./business";
import { compileDNA } from "./dna";
import { buildMoodboard, applyMoodboard } from "./references";
import { compose } from "./composer";
import { evaluateQuality } from "./quality-gate";
import { INDUSTRY_PROFILES } from "./industries";
import { planSmart } from "./planner";

/* -------------------------------------------------------------------------- */
/*  Pipeline result                                                           */
/* -------------------------------------------------------------------------- */

export interface PipelineResult {
  schema: SiteSchema;
  /** The BusinessProfile used to drive the generation. */
  profile: BusinessProfile;
  /** The Design DNA that guided every visual decision. */
  dna: DesignDNA;
  /** The moodboard of curated references. */
  moodboard: Moodboard;
  /** Quality scores from the gate. */
  quality: QualityScore;
  /** Number of quality iterations performed (0 = passed first try). */
  iterations: number;
}

/* -------------------------------------------------------------------------- */
/*  Pipeline                                                                  */
/* -------------------------------------------------------------------------- */

const MAX_ITERATIONS = 2;

/**
 * Run the full V5 DNA-driven generation pipeline.
 *
 * Deterministic and fast (~50ms without LLM). Every decision is traceable
 * through the returned profile, DNA, moodboard, and quality scores.
 */
export function runPipeline(analysis: SiteAnalysis): PipelineResult {
  const industryProfile = INDUSTRY_PROFILES[analysis.industry];
  const mood: Theme["mood"] = industryProfile.theme.mood;

  // Phase 1: Business Intelligence
  const profile = analyzeBusinessProfile(analysis, mood);

  // Phase 2: Plan sections (to know what the moodboard needs to cover)
  const plan = planSmart(analysis.structure, analysis.industry);
  const sectionTypes = plan.slots.map((s) => s.type);

  // Phase 3: Reference Engine
  const moodboard = buildMoodboard(profile, mood, sectionTypes);

  // Phase 4: DNA Compilation
  const baseDNA = compileDNA({
    profile,
    industry: analysis.industry,
    mood,
    font: analysis.fontHint || industryProfile.theme.font,
    hasImages: analysis.extractedContent.images.length > 0,
    hasTestimonials: (analysis.extractedContent.testimonials?.length || 0) > 0,
    hasStats: (analysis.extractedContent.stats?.length || 0) > 0,
    sourceDark: analysis.sourceDark || false,
  });

  // Merge moodboard refinements into the base DNA
  const dna = applyMoodboard(baseDNA, moodboard);

  // Phase 5: Compose
  let schema = compose(analysis, { dna, profile, moodboard });

  // Phase 6: Quality Gate (with iteration loop)
  let quality = evaluateQuality(schema, dna, profile);
  let iterations = 0;

  while (!quality.passes && iterations < MAX_ITERATIONS) {
    iterations++;
    // Apply the top fixes by re-composing with adjusted DNA
    const adjustedDNA = applyQualityFixes(dna, quality);
    schema = compose(analysis, { dna: adjustedDNA, profile, moodboard });
    quality = evaluateQuality(schema, adjustedDNA, profile);
  }

  return {
    schema,
    profile,
    dna,
    moodboard,
    quality,
    iterations,
  };
}

/* -------------------------------------------------------------------------- */
/*  Quality-driven DNA adjustment                                             */
/* -------------------------------------------------------------------------- */

/**
 * Adjust the DNA based on quality gate feedback. This is a conservative
 * adjuster — it only tweaks the dimensions that scored poorly, leaving
 * the rest of the DNA intact.
 */
function applyQualityFixes(dna: DesignDNA, quality: QualityScore): DesignDNA {
  const adjusted = { ...dna };

  // Hero scored low → upgrade hero direction
  if (quality.hero.score < 60) {
    adjusted.heroDirection = {
      ...dna.heroDirection,
      heightVh: Math.max(dna.heroDirection.heightVh, 90),
      ctaCount: 2,
      trustIndicators: true,
    };
  }

  // Spacing scored low → increase breathing
  if (quality.spacing.score < 50) {
    adjusted.rhythm = {
      ...dna.rhythm,
      spacingMultiplier: Math.max(dna.rhythm.spacingMultiplier, 1.25),
      density: dna.rhythm.density === "tight" ? "standard" : dna.rhythm.density,
    };
  }

  // Art direction scored low → upgrade motion
  if (quality.artDirection.score < 50) {
    adjusted.motion = {
      ...dna.motion,
      level: Math.min(dna.motion.level + 1, 3) as 0 | 1 | 2 | 3,
      microInteractions: true,
    };
  }

  // Typography scored low → ensure fluid type
  if (quality.typography.score < 50) {
    adjusted.typeScale = {
      ...dna.typeScale,
      display: dna.typeScale.display.includes("clamp(")
        ? dna.typeScale.display
        : "clamp(2.5rem, 5vw, 4.5rem)",
      h2: dna.typeScale.h2.includes("clamp(")
        ? dna.typeScale.h2
        : "clamp(1.75rem, 3vw, 2.5rem)",
    };
  }

  return adjusted;
}
