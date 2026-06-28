/**
 * Quality Gate — scores generated sites against 8 art-direction-aware dimensions.
 *
 * Each dimension measures a distinct facet of the output: editorial quality,
 * composition coherence, visual rhythm, layout originality, Framer-grade
 * similarity, conversion optimization, brand fidelity, and premium perception.
 *
 * When an ArtDirection object is available, scoring is richer — the gate can
 * check that the Composer faithfully executed the Art Director's creative brief.
 * Without it, scoring falls back to general quality heuristics.
 */

import type { SiteSchema, SiteAnalysis } from "./types";
import type { DesignDNA } from "./dna";
import type { BusinessProfile } from "./business";
import type { ArtDirection } from "./art-direction";
import type { VisualDNA } from "@/lib/extraction/types";

/* -------------------------------------------------------------------------- */
/*  Quality score type                                                        */
/* -------------------------------------------------------------------------- */

export interface DimensionScore {
  score: number;       // 0–100
  maxScore: number;    // always 100
  issues: string[];
  fixes: string[];
}

export interface QualityScore {
  editorialQuality: DimensionScore;
  compositionQuality: DimensionScore;
  visualRhythm: DimensionScore;
  layoutOriginality: DimensionScore;
  framerSimilarity: DimensionScore;
  conversionQuality: DimensionScore;
  brandFidelity: DimensionScore;
  premiumScore: DimensionScore;
  total: number;
  passes: boolean;
  allFixes: string[];
}

const PASS_THRESHOLD = 72;

const WEIGHTS = {
  editorialQuality: 0.15,
  compositionQuality: 0.15,
  visualRhythm: 0.10,
  layoutOriginality: 0.10,
  framerSimilarity: 0.10,
  conversionQuality: 0.15,
  brandFidelity: 0.15,
  premiumScore: 0.10,
} as const;

/* -------------------------------------------------------------------------- */
/*  Scoring functions                                                         */
/* -------------------------------------------------------------------------- */

function scoreEditorialQuality(
  schema: SiteSchema,
  dna: DesignDNA,
  analysis?: SiteAnalysis,
  ad?: ArtDirection,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  // Fluid display type
  if (dna.typeScale.display.includes("clamp(")) score += 15;
  else { issues.push("display type not fluid"); fixes.push("use clamp() for display type"); }

  // Fluid h2
  if (dna.typeScale.h2.includes("clamp(")) score += 10;
  else { issues.push("h2 not fluid"); fixes.push("use clamp() for h2"); }

  // Negative tracking (premium typographic signal)
  const trackingVal = parseFloat(dna.typeScale.tracking);
  if (!isNaN(trackingVal) && trackingVal < 0) score += 10;
  else { issues.push("no negative tracking"); fixes.push("add negative letter-spacing"); }

  // Heading weight in premium zone
  if (dna.typeScale.headingWeight >= 400 && dna.typeScale.headingWeight <= 700) score += 10;
  else issues.push("heading weight outside premium range");

  // Real headline preserved
  const hero = schema.blocks.find((b) => b.type === "hero");
  if (hero?.props.headline && typeof hero.props.headline === "string") {
    const hl = hero.props.headline as string;
    if (analysis?.extractedContent.headline && hl === analysis.extractedContent.headline) score += 15;
    else if (hl.length > 5) score += 8;
    else { issues.push("headline generic or missing"); fixes.push("preserve the real headline"); }
  } else {
    issues.push("no headline in hero");
    fixes.push("add headline to hero block");
  }

  // Real about prose
  if (analysis?.extractedContent.aboutBody) {
    const aboutBlock = schema.blocks.find((b) => b.type === "about");
    if (aboutBlock?.props.description) score += 10;
    else { issues.push("about prose not used"); score += 3; }
  } else {
    score += 5;
  }

  // Art direction storytelling coherence
  if (ad) {
    score += 10;
    if (ad.typographyRhythm === "editorial-mix" || ad.typographyRhythm === "contrasting") score += 5;
  } else {
    score += 10;
  }

  // Editorial sections present for luxury
  if (ad?.editorialSections && ad.editorialSections.length > 0) score += 5;
  else if (ad?.luxuryLevel && ad.luxuryLevel >= 70) {
    issues.push("luxury site lacks editorial sections");
    fixes.push("add editorial emphasis to key sections");
  } else {
    score += 5;
  }

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scoreCompositionQuality(
  schema: SiteSchema,
  dna: DesignDNA,
  visual?: VisualDNA,
  ad?: ArtDirection,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  // Hero variant matches art direction
  const hero = schema.blocks.find((b) => b.type === "hero");
  if (hero && ad) {
    if (hero.variant === ad.heroVariant) score += 20;
    else { issues.push(`hero variant mismatch: ${hero.variant} vs directed ${ad.heroVariant}`); score += 8; }
  } else if (hero) {
    score += 10;
  }

  // Feature layout matches art direction
  if (ad) {
    const featBlock = schema.blocks.find((b) => b.type === "features" || b.type === "services");
    if (featBlock && ad.variantMap.features && featBlock.variant === ad.variantMap.features) score += 15;
    else if (featBlock) score += 8;
    else score += 5;
  } else {
    score += 10;
  }

  // No two adjacent sections have the same visual weight
  let adjacentSameType = false;
  for (let i = 1; i < schema.blocks.length; i++) {
    if (schema.blocks[i].type === schema.blocks[i - 1].type) { adjacentSameType = true; break; }
  }
  if (!adjacentSameType) score += 15;
  else { issues.push("consecutive duplicate section types"); fixes.push("remove duplicate adjacent sections"); }

  // Section variety
  const uniqueTypes = new Set(schema.blocks.map((b) => b.type)).size;
  if (uniqueTypes >= 5) score += 15;
  else if (uniqueTypes >= 3) score += 10;
  else { issues.push("insufficient section variety"); score += 5; }

  // Hero first, footer last
  if (schema.blocks[0]?.type === "hero") score += 10;
  else { issues.push("hero not first"); fixes.push("move hero to first position"); }
  if (schema.blocks[schema.blocks.length - 1]?.type === "footer") score += 10;
  else { issues.push("footer not last"); fixes.push("add footer as last block"); }

  // Asymmetry appropriate for tier
  if (ad) {
    if (ad.asymmetry !== "none") score += 5;
    else score += 5;
  } else {
    score += 5;
  }

  // Image placements alternate
  if (ad && ad.imagePlacements) {
    const placements = Object.values(ad.imagePlacements).filter((p) => p !== "none");
    const allSame = placements.length > 1 && placements.every((p) => p === placements[0]);
    if (!allSame) score += 10;
    else { issues.push("image placements don't alternate"); score += 3; }
  } else {
    score += 5;
  }

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scoreVisualRhythm(
  schema: SiteSchema,
  dna: DesignDNA,
  ad?: ArtDirection,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  // Section spacing follows declared rhythm
  if (dna.rhythm.density === "editorial" || dna.rhythm.density === "generous") score += 25;
  else if (dna.rhythm.density === "standard") score += 20;
  else score += 10;

  // Background alternation coherent with contrast strategy
  if (ad) {
    if (ad.contrastStrategy === "alternating" && dna.rhythm.alternateBackgrounds) score += 20;
    else if (ad.contrastStrategy === "monochrome" && !dna.rhythm.alternateBackgrounds) score += 20;
    else if (ad.contrastStrategy === "dark-anchor") score += 18;
    else score += 12;
  } else {
    score += 15;
  }

  // No back-to-back visually identical sections
  let hasDupes = false;
  for (let i = 1; i < schema.blocks.length; i++) {
    if (schema.blocks[i].type === schema.blocks[i - 1].type) { hasDupes = true; break; }
  }
  if (!hasDupes) score += 20;
  else { issues.push("consecutive duplicate sections"); fixes.push("deduplicate adjacent sections"); }

  // Dividers used consistently
  if (dna.rhythm.hasDividers) score += 10;
  else score += 10;

  // Section count reasonable
  const count = schema.blocks.length;
  if (count >= 5 && count <= 12) score += 15;
  else if (count >= 3) score += 10;
  else { issues.push("too few sections"); fixes.push("add more sections for rhythm"); score += 5; }

  // Art direction rhythm pattern declared
  if (ad) {
    score += 10;
  } else {
    score += 5;
  }

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scoreLayoutOriginality(
  schema: SiteSchema,
  analysis?: SiteAnalysis,
  ad?: ArtDirection,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  if (!ad) {
    return { score: 50, maxScore: 100, issues: ["no art direction for originality scoring"], fixes: [] };
  }

  // Hero variant differs from industry default
  const industry = analysis?.industry || "generic";
  const industryProfile = INDUSTRY_PROFILES[industry];
  if (industryProfile && ad.heroVariant !== industryProfile.preferred.hero) score += 25;
  else score += 5;

  // Feature layout is not the generic grid-3
  if (ad.featureLayout !== "grid-3") score += 20;
  else { issues.push("feature layout is generic grid-3"); score += 5; }

  // Section order differs from canonical
  const canonical = INDUSTRY_FLOW[industry];
  if (canonical) {
    const orderDiffers = ad.sectionOrder.some((s, i) => canonical[i] !== s);
    if (orderDiffers) score += 15;
    else { issues.push("section order matches industry default"); score += 3; }
  } else {
    score += 10;
  }

  // At least 2 sections use non-default variants
  let nonDefaultCount = 0;
  if (ad.variantMap.cta && ad.variantMap.cta !== "CTASection1") nonDefaultCount++;
  if (ad.variantMap.footer && ad.variantMap.footer !== "Footer1") nonDefaultCount++;
  if (ad.variantMap.testimonials && ad.variantMap.testimonials !== "TestimonialsSlider1") nonDefaultCount++;
  if (ad.variantMap.about && ad.variantMap.about !== "AboutSplit") nonDefaultCount++;
  if (nonDefaultCount >= 2) score += 15;
  else if (nonDefaultCount >= 1) score += 8;
  else { issues.push("too many default variants"); fixes.push("vary section variants"); }

  // Editorial or split sections applied
  if (ad.editorialSections.length > 0 || ad.splitSections.length > 0) score += 10;
  else score += 3;

  // Storytelling arc is not generic
  if (ad.pageStorytelling !== "problem-solution") score += 10;
  else score += 5;

  // Gallery style differs from default
  if (ad.galleryStyle !== "none" && ad.galleryStyle !== "grid") score += 5;
  else score += 2;

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scoreFramerSimilarity(
  dna: DesignDNA,
  visual?: VisualDNA,
  ad?: ArtDirection,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  if (visual) {
    // Hero composition matches source
    if (ad) {
      const compMap: Record<string, string[]> = {
        HeroImageFull: ["fullbleed"], HeroArchform: ["fullbleed", "monumental"],
        HeroMonumental: ["fullbleed", "monumental"], HeroSplitPremium: ["split"],
        HeroPremium2: ["split"], HeroEditorial: ["editorial"],
        HeroAurora: ["cinematic"], HeroAgencia: ["cinematic"],
        HeroBeam: ["cinematic"], HeroSpotlight: ["cinematic"],
        HeroPremium1: ["minimal"], HeroCanvas: ["minimal"],
        HeroBento: ["minimal", "split"],
      };
      const heroComps = compMap[ad.heroVariant] || [];
      if (heroComps.includes(visual.hero.compositionType)) score += 25;
      else { issues.push(`hero composition: ${ad.heroVariant} vs source ${visual.hero.compositionType}`); score += 8; }
    } else {
      score += 10;
    }

    // Spacing scale matches
    if (dna.rhythm.density === visual.layout.spacingScale) score += 15;
    else { issues.push(`spacing: ${dna.rhythm.density} vs extracted ${visual.layout.spacingScale}`); score += 5; }

    // Card system matches
    const compDna = visual.component;
    if (compDna.cardRadius !== null) {
      const dnaRadius = parseInt(dna.cardSystem.radius);
      if (!isNaN(dnaRadius) && Math.abs(dnaRadius - compDna.cardRadius) <= 4) score += 15;
      else score += 5;
    } else {
      score += 10;
    }

    // Type scale matches
    const dnaScale = dna.typeScale.display.includes("6vw") ? "editorial" :
      dna.typeScale.display.includes("7vw") ? "bold" :
      dna.typeScale.display.includes("4.5vw") ? "compact" : "modern";
    if (dnaScale === visual.typography.editorialScale) score += 15;
    else score += 5;

    // Dark/light match
    if (dna.colorStrategy.preferDark === visual.brand.isDark) score += 10;
    else { issues.push("dark/light mode mismatch"); score += 3; }

    // Motion level matches
    if (dna.motion.level === visual.motion.animationIntensity) score += 10;
    else score += 5;

    // Parallax matches
    if ((dna.motion.scrollBehavior === "parallax") === visual.motion.parallaxDetected) score += 10;
    else score += 3;
  } else {
    // No VisualDNA: score on Framer-grade quality signals
    if (dna.motion.level >= 2) score += 20;
    else if (dna.motion.level >= 1) score += 10;

    if (dna.motion.entranceType === "blur-fade" || dna.motion.entranceType === "stagger") score += 15;
    else if (dna.motion.entranceType === "reveal") score += 10;
    else score += 5;

    if (dna.rhythm.density === "generous" || dna.rhythm.density === "editorial") score += 15;
    else score += 8;

    if (dna.typeScale.display.includes("clamp(")) score += 15;
    else score += 5;

    if (dna.motion.microInteractions) score += 10;
    else score += 5;

    score += 15;
    if (dna.cardSystem.hoverEffect !== "none") score += 10;
    else score += 5;
  }

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scoreConversionQuality(
  schema: SiteSchema,
  dna: DesignDNA,
  analysis?: SiteAnalysis,
  ad?: ArtDirection,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;
  const types = schema.blocks.map((b) => b.type);

  // Hero has CTA
  const hero = schema.blocks.find((b) => b.type === "hero");
  if (hero?.props.ctaLabel || hero?.props.primaryCta) score += 20;
  else { issues.push("hero has no CTA"); fixes.push("add primary CTA to hero"); }

  // Contact section with real data
  if (types.includes("contact")) {
    score += 15;
    const contact = schema.blocks.find((b) => b.type === "contact");
    if (contact?.props.email || contact?.props.phone || contact?.props.bookingUrl) score += 5;
  } else {
    issues.push("no contact section");
    fixes.push("add a contact section");
  }

  // Trust signals before closing CTA
  const ctaIdx = types.lastIndexOf("cta");
  const testIdx = types.indexOf("testimonials");
  const statsIdx = types.indexOf("stats");
  const hasTrustBeforeCta = ctaIdx > 0 && (
    (testIdx >= 0 && testIdx < ctaIdx) || (statsIdx >= 0 && statsIdx < ctaIdx)
  );
  if (hasTrustBeforeCta) score += 15;
  else if (testIdx >= 0 || statsIdx >= 0) score += 8;
  else score += 5;

  // CTA section present
  if (types.includes("cta")) score += 10;
  else { issues.push("no closing CTA section"); fixes.push("add a call-to-action section"); }

  // FAQ handles objections before contact
  const faqIdx = types.indexOf("faq");
  const contactIdx = types.indexOf("contact");
  if (faqIdx >= 0 && contactIdx >= 0 && faqIdx < contactIdx) score += 10;
  else if (faqIdx >= 0) score += 5;
  else score += 3;

  // No fabricated content
  const hasTestimonials = schema.blocks.some((b) => b.type === "testimonials");
  if (hasTestimonials && !analysis?.extractedContent.testimonials?.length) {
    issues.push("fabricated testimonials detected");
    fixes.push("remove testimonials — no real data");
    score -= 10;
  } else {
    score += 10;
  }

  // Footer present
  if (types.includes("footer")) score += 10;
  else { issues.push("no footer"); fixes.push("add a footer section"); }

  // Enough sections for complete experience
  if (schema.blocks.length >= 5) score += 5;
  else { issues.push("too few sections"); score += 2; }

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scoreBrandFidelity(
  schema: SiteSchema,
  dna: DesignDNA,
  analysis?: SiteAnalysis,
  visual?: VisualDNA,
  ad?: ArtDirection,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  // Brand name correct
  if (analysis?.brandName && schema.brand.name === analysis.brandName) score += 15;
  else if (schema.brand.name) score += 10;
  else { issues.push("brand name missing"); }

  // Dark/light mode matches source
  if (visual) {
    const schemaDark = schema.theme.dark === true;
    if (schemaDark === visual.brand.isDark) score += 15;
    else { issues.push("dark/light mode mismatch"); fixes.push("match source dark/light preference"); }
  } else {
    score += 10;
  }

  // Accent color preserved
  if (analysis?.brand?.accentColor && schema.theme.accent) {
    if (schema.theme.accent.toLowerCase() === analysis.brand.accentColor.toLowerCase()) score += 15;
    else { issues.push("accent color differs from source"); score += 8; }
  } else {
    score += 10;
  }

  // Logo included
  if (schema.brand.logo) score += 10;
  else if (analysis?.brand?.logoUrl) {
    issues.push("logo not included");
    fixes.push("include extracted logo URL");
  } else {
    score += 8;
  }

  // Content real, not fabricated
  const hasRealContent = schema.blocks.some((b) =>
    b.type === "features" && (b.props.features || b.props.services),
  );
  if (hasRealContent) score += 10;
  else score += 5;

  // No invented testimonials/stats
  const hasTestimonials = schema.blocks.some((b) => b.type === "testimonials");
  const hasStats = schema.blocks.some((b) => b.type === "stats");
  let fabricated = false;
  if (hasTestimonials && !analysis?.extractedContent.testimonials?.length) fabricated = true;
  if (hasStats && !analysis?.extractedContent.stats?.length) fabricated = true;
  if (!fabricated) score += 10;
  else { issues.push("fabricated social proof"); fixes.push("remove sections without real data"); }

  // Luxury/premium level within ±20 of source
  if (visual && ad) {
    if (Math.abs(ad.luxuryLevel - visual.brand.premiumScore) <= 20) score += 15;
    else { issues.push(`luxury perception gap: ${ad.luxuryLevel} vs source ${visual.brand.premiumScore}`); score += 5; }
  } else {
    score += 10;
  }

  // Description preserved
  const hero = schema.blocks.find((b) => b.type === "hero");
  if (hero?.props.description) score += 10;
  else { issues.push("no description"); fixes.push("preserve the real description"); }

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scorePremiumScore(
  dna: DesignDNA,
  ad?: ArtDirection,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  // Generous/editorial spacing
  if (dna.rhythm.density === "editorial") score += 15;
  else if (dna.rhythm.density === "generous") score += 12;
  else if (dna.rhythm.density === "standard") score += 8;
  else score += 3;

  // Motion level >= 2
  if (dna.motion.level >= 2) score += 12;
  else if (dna.motion.level >= 1) score += 6;
  else { issues.push("motion level too low for premium feel"); }

  // Glass/editorial cards
  if (dna.cardSystem.style === "glass" || dna.cardSystem.style === "editorial") score += 10;
  else if (dna.cardSystem.style === "elevated") score += 7;
  else score += 3;

  // Hero >= 90vh
  if (dna.heroDirection.heightVh >= 90) score += 10;
  else if (dna.heroDirection.heightVh >= 80) score += 6;
  else score += 3;

  // Negative tracking
  const trackingVal = parseFloat(dna.typeScale.tracking);
  if (!isNaN(trackingVal) && trackingVal < 0) score += 10;
  else { issues.push("no negative tracking"); fixes.push("add negative letter-spacing"); }

  // Accent-rare/monochrome color
  if (dna.colorStrategy.mode === "accent-rare" || dna.colorStrategy.mode === "monochrome") score += 10;
  else score += 5;

  // Ghost/text-arrow CTA (restraint signal)
  if (dna.ctaDirection.style === "ghost" || dna.ctaDirection.style === "text-arrow") score += 8;
  else if (dna.ctaDirection.style === "pill") score += 6;
  else score += 3;

  // Luxury signals
  if (ad) {
    let luxurySignals = 0;
    if (ad.whitespaceStrategy === "generous" || ad.whitespaceStrategy === "editorial-breathing") luxurySignals++;
    if (ad.motionPhilosophy === "cinematic") luxurySignals++;
    if (ad.asymmetry !== "none") luxurySignals++;
    if (ad.editorialSections.length > 0) luxurySignals++;
    if (ad.overlapUsage !== "none") luxurySignals++;
    if (luxurySignals >= 3) score += 15;
    else if (luxurySignals >= 1) score += 8;
    else score += 3;
  } else {
    score += 8;
  }

  // Fluid type
  if (dna.typeScale.display.includes("clamp(")) score += 10;
  else { issues.push("display type not responsive"); fixes.push("use clamp() for fluid typography"); }

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function clamp(score: number): number {
  return Math.min(Math.max(Math.round(score), 0), 100);
}

import { INDUSTRY_PROFILES } from "./industries";

const INDUSTRY_FLOW: Record<string, string[]> = {
  restaurant: ["hero", "gallery", "features", "about", "testimonials", "cta", "contact", "footer"],
  artisan: ["hero", "stats", "portfolio", "features", "testimonials", "faq", "cta", "contact", "footer"],
  agency: ["hero", "portfolio", "features", "stats", "testimonials", "faq", "cta", "contact", "footer"],
  realestate: ["hero", "portfolio", "features", "about", "testimonials", "cta", "contact", "footer"],
  saas: ["hero", "features", "stats", "testimonials", "faq", "cta", "contact", "footer"],
  health: ["hero", "features", "about", "testimonials", "faq", "cta", "contact", "footer"],
  ecommerce: ["hero", "gallery", "features", "testimonials", "cta", "contact", "footer"],
  hotel: ["hero", "gallery", "features", "about", "testimonials", "faq", "cta", "contact", "footer"],
  architect: ["hero", "portfolio", "features", "about", "stats", "testimonials", "faq", "cta", "contact", "footer"],
  lawyer: ["hero", "features", "about", "stats", "testimonials", "faq", "cta", "contact", "footer"],
  gym: ["hero", "features", "pricing", "stats", "testimonials", "faq", "cta", "contact", "footer"],
  coach: ["hero", "features", "about", "stats", "testimonials", "faq", "cta", "contact", "footer"],
  plumber: ["hero", "features", "about", "stats", "testimonials", "faq", "cta", "contact", "footer"],
  electrician: ["hero", "features", "about", "stats", "testimonials", "faq", "cta", "contact", "footer"],
  construction: ["hero", "portfolio", "features", "about", "stats", "testimonials", "faq", "cta", "contact", "footer"],
  finance: ["hero", "features", "about", "stats", "testimonials", "faq", "cta", "contact", "footer"],
  fashion: ["hero", "gallery", "features", "testimonials", "cta", "contact", "footer"],
  automotive: ["hero", "gallery", "features", "about", "testimonials", "faq", "cta", "contact", "footer"],
  medical: ["hero", "features", "about", "testimonials", "faq", "cta", "contact", "footer"],
};

/* -------------------------------------------------------------------------- */
/*  Main scoring function                                                     */
/* -------------------------------------------------------------------------- */

export function evaluateQuality(
  schema: SiteSchema,
  dna: DesignDNA,
  profile: BusinessProfile,
  analysis?: SiteAnalysis,
  artDirection?: ArtDirection,
): QualityScore {
  const visual = analysis?.visualDna;

  const editorialQuality = scoreEditorialQuality(schema, dna, analysis, artDirection);
  const compositionQuality = scoreCompositionQuality(schema, dna, visual, artDirection);
  const visualRhythm = scoreVisualRhythm(schema, dna, artDirection);
  const layoutOriginality = scoreLayoutOriginality(schema, analysis, artDirection);
  const framerSimilarity = scoreFramerSimilarity(dna, visual, artDirection);
  const conversionQuality = scoreConversionQuality(schema, dna, analysis, artDirection);
  const brandFidelity = scoreBrandFidelity(schema, dna, analysis, visual, artDirection);
  const premiumScore = scorePremiumScore(dna, artDirection);

  const total = Math.round(
    editorialQuality.score * WEIGHTS.editorialQuality +
    compositionQuality.score * WEIGHTS.compositionQuality +
    visualRhythm.score * WEIGHTS.visualRhythm +
    layoutOriginality.score * WEIGHTS.layoutOriginality +
    framerSimilarity.score * WEIGHTS.framerSimilarity +
    conversionQuality.score * WEIGHTS.conversionQuality +
    brandFidelity.score * WEIGHTS.brandFidelity +
    premiumScore.score * WEIGHTS.premiumScore,
  );

  const allFixes = [
    ...conversionQuality.fixes,
    ...brandFidelity.fixes,
    ...editorialQuality.fixes,
    ...compositionQuality.fixes,
    ...premiumScore.fixes,
    ...visualRhythm.fixes,
    ...framerSimilarity.fixes,
    ...layoutOriginality.fixes,
  ];

  return {
    editorialQuality,
    compositionQuality,
    visualRhythm,
    layoutOriginality,
    framerSimilarity,
    conversionQuality,
    brandFidelity,
    premiumScore,
    total,
    passes: total >= PASS_THRESHOLD,
    allFixes,
  };
}
