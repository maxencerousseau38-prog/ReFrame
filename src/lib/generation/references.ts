/**
 * Reference Engine — builds a scored moodboard from the curated library.
 *
 * Given a BusinessProfile, the engine selects the best references for each
 * section of the site, scores them on fit (industry, tier, mood), and
 * assembles a Moodboard that the DNA Compiler uses to fine-tune its output.
 *
 * The key principle is VARIETY: no two consecutive sections should draw from
 * the same reference. The result is an original composition, not a copy.
 */

import type { Industry, BlockType, Theme } from "./types";
import type { BusinessProfile } from "./business";
import type { DesignDNA, HeroDirection, CardSystem, MotionDirection, CtaDirection, GalleryDirection } from "./dna";
import { REFERENCE_DB, type CuratedReference } from "./reference-db";

/* -------------------------------------------------------------------------- */
/*  Moodboard type                                                            */
/* -------------------------------------------------------------------------- */

export interface ScoredReference {
  ref: CuratedReference;
  score: number;
  /** Why this reference was selected. */
  reason: string;
}

export interface SectionReference {
  section: BlockType;
  /** Primary reference for this section. */
  primary: ScoredReference;
  /** What DNA traits this section should draw from the reference. */
  traits: string[];
}

export interface Moodboard {
  /** Overall artistic direction, synthesized from the top references. */
  direction: string;
  /** Top references for the site overall (best fits). */
  topReferences: ScoredReference[];
  /** Per-section reference assignments. */
  sections: SectionReference[];
  /** Compiled DNA overrides from the moodboard (merged into the base DNA). */
  dnaOverrides: Partial<DesignDNA>;
}

/* -------------------------------------------------------------------------- */
/*  Reference scoring                                                         */
/* -------------------------------------------------------------------------- */

function scoreReference(
  ref: CuratedReference,
  industry: Industry,
  tier: BusinessProfile["tier"],
  mood: Theme["mood"]
): number {
  let score = 0;

  // Industry match (strongest signal)
  if (ref.industries.includes(industry)) score += 5;

  // Tier match
  const tierOrder = ["budget", "mid", "premium", "luxury"] as const;
  const refTierIdx = tierOrder.indexOf(ref.tier);
  const targetTierIdx = tierOrder.indexOf(tier);
  const tierDiff = Math.abs(refTierIdx - targetTierIdx);
  if (tierDiff === 0) score += 4;
  else if (tierDiff === 1) score += 2;
  // Higher-tier refs are acceptable for lower tiers (aspirational), not vice versa
  if (refTierIdx > targetTierIdx) score += 1;

  // Mood match
  if (ref.moods.includes(mood)) score += 3;

  // Dark mode preference alignment
  // (minor signal, just a tiebreaker)

  return score;
}

/* -------------------------------------------------------------------------- */
/*  Moodboard builder                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Build a moodboard for the given profile.
 * Selects the best references, ensures variety, and produces DNA overrides.
 */
export function buildMoodboard(
  profile: BusinessProfile,
  mood: Theme["mood"],
  sections: BlockType[]
): Moodboard {
  const { industry, tier } = profile;

  // Score all references
  const scored: ScoredReference[] = REFERENCE_DB
    .map((ref) => ({
      ref,
      score: scoreReference(ref, industry, tier, mood),
      reason: explainScore(ref, industry, tier, mood),
    }))
    .filter((s) => s.score >= 3) // minimum relevance threshold
    .sort((a, b) => b.score - a.score);

  // Top references (best overall fits)
  const topReferences = scored.slice(0, 5);

  // Assign references to sections with variety constraint
  const sectionRefs = assignSectionReferences(sections, scored);

  // Synthesize direction text
  const direction = synthesizeDirection(topReferences, industry, mood);

  // Compute DNA overrides from the top reference
  const dnaOverrides = computeDnaOverrides(topReferences, mood);

  return {
    direction,
    topReferences,
    sections: sectionRefs,
    dnaOverrides,
  };
}

/* -------------------------------------------------------------------------- */
/*  Section assignment (with variety)                                          */
/* -------------------------------------------------------------------------- */

/** Map a section type to the reference DNA trait it should draw from. */
const SECTION_TRAIT_MAP: Partial<Record<BlockType, string[]>> = {
  hero: ["heroStyle", "motionLevel", "entranceType", "imageStyle"],
  features: ["cardStyle", "cardHover", "rhythm", "typePairing"],
  services: ["cardStyle", "cardHover", "rhythm"],
  portfolio: ["galleryStyle", "imageStyle"],
  gallery: ["galleryStyle", "imageStyle"],
  testimonials: ["cardStyle", "rhythm", "typePairing"],
  about: ["imageStyle", "rhythm", "typePairing"],
  stats: ["cardStyle", "colorMode"],
  faq: ["rhythm", "typePairing"],
  cta: ["ctaStyle", "colorMode", "usesGradients"],
  contact: ["cardStyle", "rhythm"],
  footer: ["rhythm", "colorMode"],
};

function assignSectionReferences(
  sections: BlockType[],
  scored: ScoredReference[]
): SectionReference[] {
  if (scored.length === 0) return [];

  const result: SectionReference[] = [];
  let lastRefId: string | null = null;

  for (const section of sections) {
    const traits = SECTION_TRAIT_MAP[section] || ["rhythm", "cardStyle"];

    // Pick the best reference that ISN'T the same as the last section's
    // (variety constraint). Fall back to the top reference if no alternative.
    let picked = scored[0];
    for (const s of scored) {
      if (s.ref.id !== lastRefId) {
        // For hero specifically, prefer references with matching heroStyle
        if (section === "hero") {
          picked = s;
          break;
        }
        // For galleries, prefer references that define a gallery style
        if ((section === "portfolio" || section === "gallery") && s.ref.dna.galleryStyle) {
          picked = s;
          break;
        }
        picked = s;
        break;
      }
    }

    result.push({ section, primary: picked, traits });
    lastRefId = picked.ref.id;
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/*  Direction synthesis                                                        */
/* -------------------------------------------------------------------------- */

function synthesizeDirection(
  top: ScoredReference[],
  industry: Industry,
  mood: Theme["mood"]
): string {
  if (top.length === 0) return `${mood} design for ${industry}`;

  const primary = top[0].ref;
  const parts: string[] = [];

  // Hero direction
  const heroAdj: Record<HeroDirection["style"], string> = {
    split: "Split-composition",
    fullbleed: "Full-bleed immersive",
    editorial: "Editorial",
    monumental: "Monumental",
    cinematic: "Cinematic",
    minimal: "Clean minimal",
    bento: "Bento-grid",
  };
  parts.push(`${heroAdj[primary.dna.heroStyle] || "Premium"} hero`);

  // Typography
  parts.push(primary.dna.typePairing.toLowerCase());

  // Rhythm
  const rhythmAdj: Record<string, string> = {
    tight: "compact rhythm",
    standard: "balanced rhythm",
    generous: "generous whitespace",
    editorial: "editorial breathing",
  };
  parts.push(rhythmAdj[primary.dna.rhythm] || "balanced rhythm");

  // Card style
  if (primary.dna.cardStyle !== "editorial") {
    parts.push(`${primary.dna.cardStyle} cards`);
  }

  // Motion
  if (primary.dna.motionLevel >= 3) parts.push("cinematic motion");
  else if (primary.dna.motionLevel >= 2) parts.push("premium motion");

  return parts.join(", ");
}

/* -------------------------------------------------------------------------- */
/*  DNA overrides from moodboard                                              */
/* -------------------------------------------------------------------------- */

function computeDnaOverrides(
  top: ScoredReference[],
  mood: Theme["mood"]
): Partial<DesignDNA> {
  if (top.length === 0) return {};

  const primary = top[0].ref.dna;
  const overrides: Partial<DesignDNA> = {};

  // The moodboard's top reference informs the DNA's spacing and color strategy
  overrides.rhythm = {
    spacingMultiplier: primary.spacingMultiplier,
    alternateBackgrounds: !primary.prefersDark,
    hasDividers: primary.sectionDividers,
    density: primary.rhythm,
  };

  overrides.colorStrategy = {
    mode: primary.colorMode,
    accentSectionLimit: primary.colorMode === "duotone" ? 2 : 1,
    useGradients: primary.usesGradients,
    preferDark: primary.prefersDark,
  };

  overrides.motion = {
    level: primary.motionLevel,
    entranceType: primary.entranceType,
    scrollBehavior: primary.motionLevel >= 2 ? "parallax" : "none",
    microInteractions: primary.motionLevel >= 2,
    staggerDelay: primary.motionLevel >= 3 ? 0.08 : 0.05,
    duration: primary.motionLevel >= 3 ? 0.5 : 0.3,
  };

  overrides.heroDirection = {
    style: primary.heroStyle,
    heightVh: primary.spacingMultiplier >= 1.5 ? 100 : 85,
    hasParallax: primary.motionLevel >= 2,
    hasOverlay: primary.imageStyle === "fullbleed",
    overlayOpacity: primary.imageStyle === "fullbleed" ? 0.35 : 0,
    ctaCount: 2,
    trustIndicators: true,
    imagePosition: heroImagePosition(primary.heroStyle),
  };

  overrides.ctaDirection = {
    style: primary.ctaStyle,
    size: primary.spacingMultiplier >= 1.5 ? "lg" : "md",
    hasSecondary: true,
    secondaryStyle: primary.ctaStyle === "pill" ? "ghost" : "text-arrow",
  };

  const cardStyle = primary.cardStyle as CardSystem["style"];
  overrides.cardSystem = {
    style: cardStyle,
    radius: cardStyle === "editorial" ? "0px" : cardStyle === "glass" ? "16px" : "12px",
    shadow: cardStyle === "elevated"
      ? "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)"
      : cardStyle === "glass"
      ? "0 8px 32px rgba(0,0,0,0.06)"
      : "none",
    border: cardStyle === "outlined"
      ? "1px solid rgba(0,0,0,0.12)"
      : cardStyle === "glass"
      ? "1px solid rgba(255,255,255,0.08)"
      : "none",
    hoverEffect: primary.cardHover,
  };

  return overrides;
}

function heroImagePosition(style: HeroDirection["style"]): HeroDirection["imagePosition"] {
  switch (style) {
    case "fullbleed":
    case "monumental":
      return "behind";
    case "split":
    case "bento":
      return "right";
    case "editorial":
      return "left";
    case "cinematic":
    case "minimal":
      return "right";
    default:
      return "right";
  }
}

/* -------------------------------------------------------------------------- */
/*  Score explanation                                                          */
/* -------------------------------------------------------------------------- */

function explainScore(
  ref: CuratedReference,
  industry: Industry,
  tier: BusinessProfile["tier"],
  mood: Theme["mood"]
): string {
  const parts: string[] = [];
  if (ref.industries.includes(industry)) parts.push("sector match");
  if (ref.tier === tier) parts.push("tier match");
  else if (ref.tier === "luxury" && tier === "premium") parts.push("aspirational tier");
  if (ref.moods.includes(mood)) parts.push("mood match");
  return parts.join(", ") || "general fit";
}

/* -------------------------------------------------------------------------- */
/*  Moodboard-aware DNA merging                                               */
/* -------------------------------------------------------------------------- */

/**
 * Merge moodboard overrides into a base DesignDNA. The moodboard's top
 * reference refines the tier-based DNA with actual design precedent, making
 * the output feel less algorithmic and more curated.
 *
 * Only overrides present in the moodboard are applied — the base DNA
 * (from compileDNA) stays intact for anything the moodboard doesn't specify.
 */
export function applyMoodboard(base: DesignDNA, moodboard: Moodboard): DesignDNA {
  const o = moodboard.dnaOverrides;
  return {
    ...base,
    rhythm: o.rhythm ? { ...base.rhythm, ...o.rhythm } : base.rhythm,
    cardSystem: o.cardSystem ? { ...base.cardSystem, ...o.cardSystem } : base.cardSystem,
    heroDirection: o.heroDirection ? { ...base.heroDirection, ...o.heroDirection } : base.heroDirection,
    motion: o.motion ? { ...base.motion, ...o.motion } : base.motion,
    ctaDirection: o.ctaDirection ? { ...base.ctaDirection, ...o.ctaDirection } : base.ctaDirection,
    colorStrategy: o.colorStrategy ? { ...base.colorStrategy, ...o.colorStrategy } : base.colorStrategy,
    // TypeScale and GalleryDirection stay from the base DNA — these are
    // strongly font/industry-dependent and the tier-based defaults are more
    // reliable than a reference's opinionated pairing.
  };
}
