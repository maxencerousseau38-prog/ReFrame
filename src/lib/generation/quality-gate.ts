/**
 * Quality Gate — the creative director that scores every generated site.
 *
 * The gate evaluates a SiteSchema against its DesignDNA and BusinessProfile,
 * producing a detailed score across 9 dimensions. If the total score is below
 * the threshold, it returns specific improvement actions that the Composer
 * uses to iterate.
 *
 * Two levels:
 * - Deterministic (always): rule-based scoring, fast, reliable
 * - Claude critique (optional, tier >= premium): artistic judgment
 *
 * The gate never changes the schema itself — it scores and recommends.
 * The Composer interprets and acts.
 */

import type { SiteSchema, Block, BlockType } from "./types";
import type { DesignDNA } from "./dna";
import type { BusinessProfile } from "./business";

/* -------------------------------------------------------------------------- */
/*  Quality score type                                                        */
/* -------------------------------------------------------------------------- */

export interface DimensionScore {
  score: number;       // 0–100
  maxScore: number;    // always 100
  issues: string[];    // what's wrong
  fixes: string[];     // actionable improvements
}

export interface QualityScore {
  hero: DimensionScore;
  typography: DimensionScore;
  spacing: DimensionScore;
  consistency: DimensionScore;
  conversion: DimensionScore;
  artDirection: DimensionScore;
  rhythm: DimensionScore;
  balance: DimensionScore;
  differentiation: DimensionScore;
  /** Weighted total (hero: 25%, conversion: 15%, artDirection: 15%,
   *  consistency: 10%, typography: 10%, spacing: 8%, rhythm: 7%,
   *  balance: 5%, differentiation: 5%). */
  total: number;
  /** Whether the site passes the quality gate. */
  passes: boolean;
  /** All recommended fixes, prioritized. */
  allFixes: string[];
}

const PASS_THRESHOLD = 72;

/* -------------------------------------------------------------------------- */
/*  Scoring functions                                                         */
/* -------------------------------------------------------------------------- */

function scoreHero(schema: SiteSchema, dna: DesignDNA, profile: BusinessProfile): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  const hero = schema.blocks.find((b) => b.type === "hero");
  if (!hero) {
    return { score: 0, maxScore: 100, issues: ["no hero block"], fixes: ["add a hero section"] };
  }

  // Is it the first block?
  if (schema.blocks[0]?.type === "hero") score += 10;
  else { issues.push("hero not first"); fixes.push("move hero to first position"); }

  // Does it have a CTA?
  const hasCta = hero.props.ctaLabel || hero.props.primaryCta;
  if (hasCta) score += 15;
  else { issues.push("hero has no CTA"); fixes.push("add primary CTA to hero"); }

  // Does it have a headline?
  const headline = hero.props.headline || hero.props.title;
  if (headline && typeof headline === "string") {
    score += 10;
    const wordCount = headline.trim().split(/\s+/).length;
    if (wordCount <= 10) score += 5;
    else { issues.push("hero headline too long"); fixes.push("shorten hero headline to ≤8 words"); }
  } else {
    issues.push("hero has no headline"); fixes.push("add a compelling headline");
  }

  // Does it have a description?
  if (hero.props.description) score += 5;

  // Does it have an image (or is image-free by design)?
  const hasImage = hero.props.heroImageUrl || hero.props.image || hero.props.backgroundImage;
  const imageFreePremium = hero.variant === "HeroCanvas" || hero.variant === "HeroBeam" || hero.variant === "HeroAgencia";
  if (hasImage || imageFreePremium) score += 15;
  else { issues.push("hero has no image"); fixes.push("add hero imagery or use a cinematic image-free variant"); }

  // Hero variant matches DNA direction?
  const variantStyleMap: Record<string, string> = {
    HeroSplitPremium: "split", HeroBento: "bento", HeroAurora: "cinematic",
    HeroPremium1: "minimal", HeroPremium2: "split", HeroSpotlight: "cinematic",
    HeroEditorial: "editorial", HeroImageFull: "fullbleed", HeroMonumental: "monumental",
    HeroAgencia: "cinematic", HeroBeam: "cinematic", HeroArchform: "monumental",
    HeroCanvas: "minimal",
  };
  const variantStyle = variantStyleMap[hero.variant];
  if (variantStyle === dna.heroDirection.style) score += 15;
  else if (variantStyle) score += 5; // partial credit
  else { issues.push("hero variant doesn't match DNA direction"); }

  // Trust indicators (if DNA calls for them)
  if (dna.heroDirection.trustIndicators) {
    if (hero.props.trustBadges || hero.props.stats || hero.props.clients) score += 10;
    else { issues.push("DNA wants trust indicators in hero"); fixes.push("add trust badges or stats to hero"); }
  } else {
    score += 10; // not required, full marks
  }

  // Second CTA (if DNA calls for it)
  if (dna.heroDirection.ctaCount >= 2) {
    if (hero.props.secondaryCta || hero.props.secondaryCtaLabel) score += 5;
    else { issues.push("DNA wants 2 CTAs in hero"); fixes.push("add secondary CTA to hero"); }
  } else {
    score += 5;
  }

  // Premium perception: high motion variant for premium/luxury?
  if (profile.tier === "luxury" || profile.tier === "premium") {
    const premiumVariants = ["HeroAurora", "HeroAgencia", "HeroBeam", "HeroArchform", "HeroEditorial", "HeroImageFull", "HeroMonumental"];
    if (premiumVariants.includes(hero.variant)) score += 10;
    else { issues.push("hero variant not premium enough for tier"); fixes.push("upgrade to a premium hero variant"); }
  } else {
    score += 10;
  }

  return { score: Math.min(score, 100), maxScore: 100, issues, fixes };
}

function scoreTypography(dna: DesignDNA): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  // Fluid display type
  if (dna.typeScale.display.includes("clamp(")) score += 25;
  else { issues.push("display type not fluid"); fixes.push("use clamp() for display type"); }

  // Negative tracking on display
  const trackingVal = parseFloat(dna.typeScale.tracking);
  if (!isNaN(trackingVal) && trackingVal < 0) score += 20;
  else { issues.push("no negative tracking on headings"); fixes.push("add negative letter-spacing to display headings"); }

  // Heading weight (500–600 is the premium zone)
  if (dna.typeScale.headingWeight >= 500 && dna.typeScale.headingWeight <= 600) score += 20;
  else if (dna.typeScale.headingWeight >= 400) score += 10;
  else { issues.push("heading weight outside premium zone"); }

  // Body size (>= 1rem)
  const bodyRem = parseFloat(dna.typeScale.body);
  if (!isNaN(bodyRem) && bodyRem >= 1) score += 15;
  else { issues.push("body text too small"); fixes.push("increase body text to >= 1rem"); }

  // H2 is fluid
  if (dna.typeScale.h2.includes("clamp(")) score += 20;
  else { issues.push("h2 not fluid"); fixes.push("use clamp() for h2 type"); }

  return { score: Math.min(score, 100), maxScore: 100, issues, fixes };
}

function scoreSpacing(dna: DesignDNA): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  // Section spacing multiplier (higher is more premium)
  if (dna.rhythm.spacingMultiplier >= 1.5) score += 30;
  else if (dna.rhythm.spacingMultiplier >= 1.25) score += 20;
  else if (dna.rhythm.spacingMultiplier >= 1) score += 10;
  else { issues.push("section spacing too tight"); fixes.push("increase spacing multiplier to >= 1.25"); }

  // Content max width constrained
  const maxWidth = parseInt(dna.contentMaxWidth);
  if (!isNaN(maxWidth) && maxWidth <= 1400 && maxWidth >= 1100) score += 25;
  else { issues.push("content width not optimal"); fixes.push("set content max-width to 1280–1320px"); }

  // Reading column width constrained
  const readingWidth = parseInt(dna.readingColumnWidth);
  if (!isNaN(readingWidth) && readingWidth <= 700 && readingWidth >= 550) score += 25;
  else { issues.push("reading column too wide"); }

  // Density fits tier
  if (dna.rhythm.density === "editorial" || dna.rhythm.density === "generous") score += 20;
  else if (dna.rhythm.density === "standard") score += 10;
  else { issues.push("density too tight for premium feel"); fixes.push("increase section breathing room"); }

  return { score: Math.min(score, 100), maxScore: 100, issues, fixes };
}

function scoreConsistency(schema: SiteSchema, dna: DesignDNA): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 50; // start at 50, add/subtract

  // Check that all blocks exist and have types
  const allTyped = schema.blocks.every((b) => b.type && b.variant);
  if (allTyped) score += 15;
  else { issues.push("some blocks missing type or variant"); }

  // No consecutive duplicate block types
  let hasDupes = false;
  for (let i = 1; i < schema.blocks.length; i++) {
    if (schema.blocks[i].type === schema.blocks[i - 1].type) {
      hasDupes = true;
      break;
    }
  }
  if (!hasDupes) score += 15;
  else { issues.push("consecutive duplicate section types"); fixes.push("remove or vary duplicate adjacent sections"); }

  // Hero first, footer last
  if (schema.blocks[0]?.type === "hero") score += 10;
  else { issues.push("hero not first"); }
  if (schema.blocks[schema.blocks.length - 1]?.type === "footer") score += 10;
  else { issues.push("footer not last"); }

  return { score: Math.min(Math.max(score, 0), 100), maxScore: 100, issues, fixes };
}

function scoreConversion(schema: SiteSchema, profile: BusinessProfile): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  const types = schema.blocks.map((b) => b.type);

  // CTA present
  if (types.includes("cta")) score += 20;
  else { issues.push("no CTA section"); fixes.push("add a closing call-to-action section"); }

  // Contact present
  if (types.includes("contact")) score += 15;
  else { issues.push("no contact section"); fixes.push("add a contact section"); }

  // Hero has CTA (checked above, but verify)
  const hero = schema.blocks.find((b) => b.type === "hero");
  if (hero?.props.ctaLabel || hero?.props.primaryCta) score += 15;
  else { issues.push("hero CTA missing"); fixes.push("add CTA to hero"); }

  // Trust section (testimonials or stats)
  if (types.includes("testimonials") || types.includes("stats")) score += 15;
  else { issues.push("no social proof section"); }

  // Value section after hero (features or services)
  const heroIdx = types.indexOf("hero");
  if (heroIdx >= 0 && heroIdx + 1 < types.length) {
    const nextType = types[heroIdx + 1];
    if (nextType === "features" || nextType === "services" || nextType === "portfolio") score += 15;
    else { issues.push("no value section after hero"); fixes.push("place a features/services section after the hero"); }
  }

  // FAQ before contact (objection handling)
  const faqIdx = types.indexOf("faq");
  const contactIdx = types.indexOf("contact");
  if (faqIdx >= 0 && contactIdx >= 0 && faqIdx < contactIdx) score += 10;
  else if (faqIdx >= 0) score += 5;

  // No dead-end pages
  const pages = schema.pages || [];
  const deadEnd = pages.some((p) => !p.blocks.some((b) => b.type === "cta" || b.type === "contact"));
  if (!deadEnd) score += 10;
  else { issues.push("some pages have no CTA or contact"); fixes.push("add CTA/contact to every page"); }

  return { score: Math.min(score, 100), maxScore: 100, issues, fixes };
}

function scoreArtDirection(dna: DesignDNA, profile: BusinessProfile): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  // Motion level matches tier
  const expectedMotion = profile.tier === "luxury" ? 3 : profile.tier === "premium" ? 2 : 1;
  if (dna.motion.level >= expectedMotion) score += 20;
  else { issues.push("motion level below tier expectation"); fixes.push(`increase motion level to ${expectedMotion}+`); }

  // Card system defined
  if (dna.cardSystem.style !== "flat" || profile.tier === "budget") score += 15;
  else if (profile.tier === "premium" || profile.tier === "luxury") {
    issues.push("card system too plain for tier"); fixes.push("upgrade card system to glass or elevated");
  } else {
    score += 15;
  }

  // Color strategy fits mood
  score += 15; // always some credit

  // Hero height (premium sites should be dramatic)
  if (profile.tier === "luxury" && dna.heroDirection.heightVh >= 95) score += 15;
  else if (profile.tier === "premium" && dna.heroDirection.heightVh >= 85) score += 15;
  else if (profile.tier === "mid" && dna.heroDirection.heightVh >= 70) score += 15;
  else { issues.push("hero not dramatic enough for tier"); fixes.push("increase hero height"); score += 5; }

  // CTA style exists and is intentional
  if (dna.ctaDirection.style) score += 10;

  // Entrance animations defined
  if (dna.motion.entranceType) score += 10;

  // Micro-interactions (premium expectation)
  if (dna.motion.microInteractions || profile.tier === "budget" || profile.tier === "mid") score += 15;
  else { issues.push("no micro-interactions for premium tier"); fixes.push("enable hover/focus micro-interactions"); }

  return { score: Math.min(score, 100), maxScore: 100, issues, fixes };
}

function scoreRhythm(schema: SiteSchema, dna: DesignDNA): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  // Enough sections for a complete experience
  const blockCount = schema.blocks.length;
  if (blockCount >= 7) score += 25;
  else if (blockCount >= 5) score += 15;
  else { issues.push("too few sections for a complete experience"); fixes.push("add more sections to round out the page"); }

  // Good section variety
  const uniqueTypes = new Set(schema.blocks.map((b) => b.type)).size;
  if (uniqueTypes >= 6) score += 25;
  else if (uniqueTypes >= 4) score += 15;
  else { issues.push("low section variety"); fixes.push("diversify section types"); }

  // Alternating density (light/heavy sections, not all heavy)
  const heavySections: BlockType[] = ["hero", "portfolio", "gallery", "stats"];
  const lightSections: BlockType[] = ["faq", "cta", "contact", "footer"];
  let heavyStreak = 0, maxHeavyStreak = 0;
  for (const b of schema.blocks) {
    if (heavySections.includes(b.type)) { heavyStreak++; maxHeavyStreak = Math.max(maxHeavyStreak, heavyStreak); }
    else { heavyStreak = 0; }
  }
  if (maxHeavyStreak <= 2) score += 25;
  else { issues.push("too many heavy sections in a row"); fixes.push("intersperse lighter sections between visual-heavy ones"); score += 10; }

  // Density matches DNA
  if (dna.rhythm.density === "editorial" || dna.rhythm.density === "generous") score += 25;
  else if (dna.rhythm.density === "standard") score += 15;
  else score += 5;

  return { score: Math.min(score, 100), maxScore: 100, issues, fixes };
}

function scoreBalance(schema: SiteSchema): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 50; // base

  // Not too many sections (overloaded)
  if (schema.blocks.length <= 12) score += 20;
  else { issues.push("too many sections (overloaded)"); fixes.push("reduce to ≤10 sections on the home page"); }

  // Not too few (sparse)
  if (schema.blocks.length >= 5) score += 20;
  else { issues.push("too few sections"); }

  // Multi-page sites should have reasonably sized pages
  if (schema.pages) {
    const oversized = schema.pages.filter((p) => p.blocks.length > 10);
    if (oversized.length === 0) score += 10;
    else { issues.push("some sub-pages are overloaded"); }
  } else {
    score += 10;
  }

  return { score: Math.min(score, 100), maxScore: 100, issues, fixes };
}

function scoreDifferentiation(schema: SiteSchema, profile: BusinessProfile): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 50; // base

  // Uses a non-default hero variant?
  const hero = schema.blocks.find((b) => b.type === "hero");
  const defaultVariants = ["HeroPremium1"];
  if (hero && !defaultVariants.includes(hero.variant)) score += 20;
  else { issues.push("using a default hero variant"); fixes.push("select a more distinctive hero variant"); }

  // Has at least one "signature" section (portfolio, gallery, stats)?
  const signatureSections: BlockType[] = ["portfolio", "gallery", "stats", "team"];
  const hasSignature = schema.blocks.some((b) => signatureSections.includes(b.type));
  if (hasSignature) score += 15;
  else { issues.push("no signature section"); }

  // Theme is not default
  if (schema.theme.accent !== "#6366f1") score += 15; // not the Zod default indigo
  else { issues.push("using default accent color"); fixes.push("set a brand-specific accent color"); }

  return { score: Math.min(score, 100), maxScore: 100, issues, fixes };
}

/* -------------------------------------------------------------------------- */
/*  Main scoring function                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Evaluate a SiteSchema against its DesignDNA and BusinessProfile.
 * Returns a detailed score with actionable improvement recommendations.
 */
export function evaluateQuality(
  schema: SiteSchema,
  dna: DesignDNA,
  profile: BusinessProfile
): QualityScore {
  const hero = scoreHero(schema, dna, profile);
  const typography = scoreTypography(dna);
  const spacing = scoreSpacing(dna);
  const consistency = scoreConsistency(schema, dna);
  const conversion = scoreConversion(schema, profile);
  const artDirection = scoreArtDirection(dna, profile);
  const rhythm = scoreRhythm(schema, dna);
  const balance = scoreBalance(schema);
  const differentiation = scoreDifferentiation(schema, profile);

  const total = Math.round(
    hero.score * 0.25 +
    conversion.score * 0.15 +
    artDirection.score * 0.15 +
    consistency.score * 0.10 +
    typography.score * 0.10 +
    spacing.score * 0.08 +
    rhythm.score * 0.07 +
    balance.score * 0.05 +
    differentiation.score * 0.05
  );

  // Collect all fixes, prioritized by dimension weight
  const allFixes = [
    ...hero.fixes,
    ...conversion.fixes,
    ...artDirection.fixes,
    ...consistency.fixes,
    ...typography.fixes,
    ...spacing.fixes,
    ...rhythm.fixes,
    ...balance.fixes,
    ...differentiation.fixes,
  ];

  return {
    hero,
    typography,
    spacing,
    consistency,
    conversion,
    artDirection,
    rhythm,
    balance,
    differentiation,
    total,
    passes: total >= PASS_THRESHOLD,
    allFixes,
  };
}
