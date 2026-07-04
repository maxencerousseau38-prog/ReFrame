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
import type { ArtDirection } from "./art-direction";
import { analyzeBusinessProfile } from "./business";
import { compileDNA } from "./dna";
import { buildMoodboard } from "./references";
import { artDirect } from "./art-direction";
import { compose } from "./composer";
import { evaluateQuality } from "./quality-gate";
import { INDUSTRY_PROFILES } from "./industries";
import { planSmart } from "./planner";
import { resolveTree } from "@/lib/dna/resolver";
import { measuredLayer, curatedLayer, tokensLayer } from "@/lib/dna/candidates";
import { contentTraceEntries } from "@/lib/dna/content-trace";
import { buildContentModel } from "@/lib/understand/content-model";
import type { PipelineTrace } from "@/lib/dna/provenance";
import type { CandidateLayer } from "@/lib/dna/resolver";

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
  /** The Art Direction creative brief. */
  artDirection: ArtDirection;
  /** Quality scores from the gate. */
  quality: QualityScore;
  /** Number of quality iterations performed (0 = passed first try). */
  iterations: number;
  /** Provenance of every DNA field: why this value, what was rejected (V2). */
  trace: PipelineTrace;
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

  // Phase 2: Plan sections (to know what the moodboard needs to cover).
  // F14: the plan knows whether a real FAQ exists — it never plans a section
  // the composer will refuse to fabricate.
  const plan = planSmart(analysis.structure, analysis.industry, {
    hasFaq: (analysis.extractedContent.faqItems?.length ?? 0) > 0,
  });
  const sectionTypes = plan.slots.map((s) => s.type);

  // Phase 3: Reference Engine
  const moodboard = buildMoodboard(profile, mood, sectionTypes);

  // Phase 4: DNA Compilation (preset layer — the shape authority)
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

  // Phase 4.5: single merge point (V2 invariant I1). Measured beats curated
  // beats preset, leaf by leaf — the moodboard can only fill what the source
  // site's measurements did not provide. Every decision lands in the trace.
  const layers = [
    measuredLayer(analysis.visualDna),
    tokensLayer(analysis.measuredTokens),
    curatedLayer(moodboard),
  ].filter((l): l is CandidateLayer => l !== undefined);

  const resolved = resolveTree(
    {
      data: {
        ...baseDNA,
        // Signature semantics preserved from V5: "+vdna" marks a run that had
        // real measurements available.
        signature: analysis.visualDna ? `${baseDNA.signature}+vdna` : baseDNA.signature,
      },
      source: "preset",
      origin: "generation/dna.ts#compileDNA",
    },
    layers
  );
  const dna = resolved.value;

  // Phase 4.75: Art Director — produces the creative brief
  const artDirection = artDirect(profile, dna, moodboard, analysis, plan);

  // Phase 5: Compose (executes the Art Direction)
  let schema = compose(analysis, { dna, profile, moodboard, artDirection });

  // Phase 6: Quality Gate (with iteration loop)
  let quality = evaluateQuality(schema, dna, profile, analysis, artDirection);
  let iterations = 0;

  while (!quality.passes && iterations < MAX_ITERATIONS) {
    iterations++;
    const adjustedDNA = applyQualityFixes(dna, quality);
    const adjustedAD = artDirect(profile, adjustedDNA, moodboard, analysis, plan);
    schema = compose(analysis, { dna: adjustedDNA, profile, moodboard, artDirection: adjustedAD });
    quality = evaluateQuality(schema, adjustedDNA, profile, analysis, adjustedAD);
  }

  return {
    schema,
    profile,
    dna,
    moodboard,
    artDirection,
    quality,
    iterations,
    // F15: DNA provenance + content provenance (language, headings, CTA) —
    // "why this heading?" is now answerable from the same trace.
    trace: [...resolved.trace, ...contentTraceEntries(buildContentModel(analysis), analysis)],
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

  // Conversion quality low → upgrade hero direction
  if (quality.conversionQuality.score < 60) {
    adjusted.heroDirection = {
      ...dna.heroDirection,
      heightVh: Math.max(dna.heroDirection.heightVh, 90),
      ctaCount: 2,
      trustIndicators: true,
    };
  }

  // Composition quality low → increase breathing
  if (quality.compositionQuality.score < 50) {
    adjusted.rhythm = {
      ...dna.rhythm,
      spacingMultiplier: Math.max(dna.rhythm.spacingMultiplier, 1.25),
      density: dna.rhythm.density === "tight" ? "standard" : dna.rhythm.density,
    };
  }

  // Premium score low → upgrade motion
  if (quality.premiumScore.score < 50) {
    adjusted.motion = {
      ...dna.motion,
      level: Math.min(dna.motion.level + 1, 3) as 0 | 1 | 2 | 3,
      microInteractions: true,
    };
  }

  // Editorial quality low → ensure fluid type
  if (quality.editorialQuality.score < 50) {
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
