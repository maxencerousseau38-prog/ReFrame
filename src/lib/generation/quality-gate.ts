/**
 * Quality Gate — scores generated sites against 8 fidelity dimensions.
 *
 * Each dimension measures how faithfully the generated output reproduces the
 * source site's visual decisions, as captured by VisualDNA. When no VisualDNA
 * is available (legacy path), scoring falls back to general quality heuristics.
 *
 * The gate never changes the schema — it scores and recommends. The Composer
 * interprets and acts.
 */

import type { SiteSchema, SiteAnalysis } from "./types";
import type { DesignDNA } from "./dna";
import type { BusinessProfile } from "./business";
import type { VisualDNA } from "@/lib/extraction/types";

/* -------------------------------------------------------------------------- */
/*  Quality score type                                                        */
/* -------------------------------------------------------------------------- */

export interface DimensionScore {
  score: number;       // 0–100
  maxScore: number;    // always 100
  issues: string[];    // what specifically prevents 100%
  fixes: string[];     // actionable improvements
}

export interface QualityScore {
  contentFidelity: DimensionScore;
  designFidelity: DimensionScore;
  layoutFidelity: DimensionScore;
  motionFidelity: DimensionScore;
  typographyFidelity: DimensionScore;
  brandFidelity: DimensionScore;
  framerFidelity: DimensionScore;
  productionReadiness: DimensionScore;
  /** Weighted total. */
  total: number;
  /** Whether the site passes the quality gate. */
  passes: boolean;
  /** All recommended fixes, prioritized. */
  allFixes: string[];
}

const PASS_THRESHOLD = 72;

/* -------------------------------------------------------------------------- */
/*  Dimension weights                                                         */
/* -------------------------------------------------------------------------- */

const WEIGHTS = {
  contentFidelity: 0.15,
  designFidelity: 0.15,
  layoutFidelity: 0.15,
  motionFidelity: 0.10,
  typographyFidelity: 0.15,
  brandFidelity: 0.15,
  framerFidelity: 0.05,
  productionReadiness: 0.10,
} as const;

/* -------------------------------------------------------------------------- */
/*  Scoring functions                                                         */
/* -------------------------------------------------------------------------- */

function scoreContentFidelity(
  schema: SiteSchema,
  analysis?: SiteAnalysis,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  const hero = schema.blocks.find((b) => b.type === "hero");

  // Real headline preserved
  if (hero?.props.headline && typeof hero.props.headline === "string") {
    const headline = hero.props.headline as string;
    if (analysis?.extractedContent.headline && headline === analysis.extractedContent.headline) {
      score += 20;
    } else if (headline.length > 5) {
      score += 10;
    } else {
      issues.push("headline missing or generic");
      fixes.push("preserve the real headline from the source");
    }
  } else {
    issues.push("no headline in hero");
    fixes.push("add headline to hero block");
  }

  // Real description preserved
  if (hero?.props.description) score += 15;
  else { issues.push("no description"); fixes.push("preserve the real description"); }

  // Services: real not fabricated
  const servicesBlock = schema.blocks.find((b) => b.type === "features" || b.type === "services");
  if (servicesBlock?.props.features || servicesBlock?.props.services) {
    score += 20;
    if (analysis?.extractedContent.serviceItems?.length) score += 5;
  } else if (analysis?.extractedContent.services?.length) {
    issues.push("extracted services not used");
    fixes.push("include extracted services in features/services block");
  } else {
    score += 15;
  }

  // Contact info preserved
  const contactBlock = schema.blocks.find((b) => b.type === "contact");
  if (contactBlock) score += 15;
  else if (analysis?.extractedContent.contact) {
    issues.push("contact info not used");
    fixes.push("add contact section with extracted contact details");
  } else {
    score += 10;
  }

  // No fabricated content
  const hasTestimonials = schema.blocks.some((b) => b.type === "testimonials");
  if (hasTestimonials && !analysis?.extractedContent.testimonials?.length) {
    issues.push("fabricated testimonials detected");
    fixes.push("remove testimonials — no real data");
    score -= 10;
  } else {
    score += 15;
  }

  // Brand name correct
  if (schema.brand.name && analysis?.brandName && schema.brand.name === analysis.brandName) {
    score += 10;
  } else if (schema.brand.name) {
    score += 5;
  }

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scoreDesignFidelity(
  dna: DesignDNA,
  visual?: VisualDNA,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 50; // base when no visual DNA

  if (!visual) {
    return { score, maxScore: 100, issues: ["no visual DNA for comparison"], fixes: [] };
  }

  // Card system matches
  const compDna = visual.component;
  if (compDna.cardRadius !== null) {
    const dnaRadius = parseInt(dna.cardSystem.radius);
    if (!isNaN(dnaRadius) && Math.abs(dnaRadius - compDna.cardRadius) <= 4) score += 15;
    else { issues.push(`card radius mismatch: ${dna.cardSystem.radius} vs ${compDna.cardRadius}px`); score += 5; }
  } else {
    score += 10;
  }

  // Card shadow consistent
  const shadowMap: Record<string, string> = { none: "none", subtle: "subtle", elevated: "elevated", dramatic: "dramatic" };
  const dnaShadow = dna.cardSystem.shadow === "none" ? "none" : dna.cardSystem.shadow.includes("32px") ? "dramatic" : dna.cardSystem.shadow.includes("16px") ? "elevated" : "subtle";
  if (dnaShadow === shadowMap[compDna.cardShadow]) score += 10;
  else { issues.push(`card shadow mismatch: ${dnaShadow} vs ${compDna.cardShadow}`); score += 3; }

  // CTA style matches
  if (dna.ctaDirection.style === compDna.ctaStyle) score += 15;
  else { issues.push(`CTA style: ${dna.ctaDirection.style} vs extracted ${compDna.ctaStyle}`); score += 5; }

  // Color strategy alignment
  if (dna.colorStrategy.preferDark === visual.brand.isDark) score += 10;
  else { issues.push("dark/light mode mismatch"); fixes.push("match source dark/light preference"); }

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scoreLayoutFidelity(
  schema: SiteSchema,
  dna: DesignDNA,
  visual?: VisualDNA,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  // Hero composition matches
  const hero = schema.blocks.find((b) => b.type === "hero");
  if (hero && visual) {
    const variantStyleMap: Record<string, string> = {
      HeroSplitPremium: "split", HeroBento: "bento", HeroAurora: "cinematic",
      HeroPremium1: "minimal", HeroPremium2: "split", HeroSpotlight: "cinematic",
      HeroEditorial: "editorial", HeroImageFull: "fullbleed", HeroMonumental: "fullbleed",
      HeroAgencia: "cinematic", HeroBeam: "cinematic", HeroArchform: "fullbleed",
      HeroCanvas: "minimal",
    };
    const variantStyle = variantStyleMap[hero.variant];
    if (variantStyle === visual.hero.compositionType) score += 20;
    else if (variantStyle) { score += 8; issues.push(`hero composition: ${variantStyle} vs extracted ${visual.hero.compositionType}`); }
    else score += 5;
  } else {
    score += 10;
  }

  // Section count reasonable
  const blockCount = schema.blocks.length;
  if (visual && Math.abs(blockCount - visual.layout.sectionCount) <= 3) score += 15;
  else if (blockCount >= 5 && blockCount <= 12) score += 10;
  else { issues.push(`section count: ${blockCount} (source had ${visual?.layout.sectionCount || "?"})`); score += 5; }

  // Hero first, footer last
  if (schema.blocks[0]?.type === "hero") score += 10;
  else { issues.push("hero not first"); fixes.push("move hero to first position"); }
  if (schema.blocks[schema.blocks.length - 1]?.type === "footer") score += 10;
  else { issues.push("footer not last"); fixes.push("add footer as last block"); }

  // No consecutive duplicate section types
  let hasDupes = false;
  for (let i = 1; i < schema.blocks.length; i++) {
    if (schema.blocks[i].type === schema.blocks[i - 1].type) { hasDupes = true; break; }
  }
  if (!hasDupes) score += 10;
  else { issues.push("consecutive duplicate sections"); fixes.push("remove duplicate adjacent sections"); }

  // Container width match
  if (visual?.layout.containerWidth) {
    const dnaWidth = parseInt(dna.contentMaxWidth);
    if (!isNaN(dnaWidth) && Math.abs(dnaWidth - visual.layout.containerWidth) <= 60) score += 15;
    else { issues.push(`container width: ${dna.contentMaxWidth} vs ${visual.layout.containerWidth}px`); score += 5; }
  } else {
    score += 10;
  }

  // Spacing density matches
  if (visual && dna.rhythm.density === visual.layout.spacingScale) score += 10;
  else if (visual) { issues.push(`spacing: ${dna.rhythm.density} vs extracted ${visual.layout.spacingScale}`); score += 3; }
  else score += 5;

  // Section variety
  const uniqueTypes = new Set(schema.blocks.map((b) => b.type)).size;
  if (uniqueTypes >= 5) score += 10;
  else score += 5;

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scoreMotionFidelity(
  dna: DesignDNA,
  visual?: VisualDNA,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 50;

  if (!visual) {
    return { score, maxScore: 100, issues: ["no visual DNA for comparison"], fixes: [] };
  }

  // Motion level matches
  if (dna.motion.level === visual.motion.animationIntensity) score += 20;
  else {
    issues.push(`motion level: ${dna.motion.level} vs extracted ${visual.motion.animationIntensity}`);
    if (Math.abs(dna.motion.level - visual.motion.animationIntensity) <= 1) score += 10;
  }

  // Entrance type preserved
  if (visual.motion.entranceAnimations.length > 0) {
    if (visual.motion.entranceAnimations.includes(dna.motion.entranceType)) score += 15;
    else { issues.push(`entrance: ${dna.motion.entranceType} vs extracted [${visual.motion.entranceAnimations.join(",")}]`); score += 5; }
  } else {
    score += 10;
  }

  // Parallax matches
  if (dna.motion.scrollBehavior === "parallax" && visual.motion.parallaxDetected) score += 10;
  else if (dna.motion.scrollBehavior !== "parallax" && !visual.motion.parallaxDetected) score += 10;
  else { issues.push("parallax mismatch"); score += 3; }

  // Hover effects present if extracted
  if (visual.motion.hoverBehavior.length > 0 && dna.motion.microInteractions) score += 5;
  else if (visual.motion.hoverBehavior.length === 0) score += 5;
  else { issues.push("hover effects missing"); fixes.push("enable micro-interactions"); }

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scoreTypographyFidelity(
  dna: DesignDNA,
  analysis?: SiteAnalysis,
  visual?: VisualDNA,
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

  // Negative tracking
  const trackingVal = parseFloat(dna.typeScale.tracking);
  if (!isNaN(trackingVal) && trackingVal < 0) score += 10;
  else { issues.push("no negative tracking"); fixes.push("add negative letter-spacing"); }

  // Heading weight in premium zone
  if (dna.typeScale.headingWeight >= 400 && dna.typeScale.headingWeight <= 700) score += 10;
  else { issues.push("heading weight outside recommended range"); }

  if (!visual) {
    score += 30;
    return { score: clamp(score), maxScore: 100, issues, fixes };
  }

  // Heading font matches extracted
  if (visual.typography.headingFont) {
    const fontHint = analysis?.fontHint;
    if (fontHint && visual.typography.headingFont.toLowerCase().includes(fontHint)) score += 15;
    else { issues.push(`heading font: source uses "${visual.typography.headingFont}"`); score += 5; }
  } else {
    score += 10;
  }

  // Type scale matches
  const scaleMap: Record<string, string> = { compact: "compact", modern: "modern", editorial: "editorial", bold: "bold" };
  const dnaScale = dna.typeScale.display.includes("6vw") || dna.typeScale.display.includes("5rem")
    ? "editorial"
    : dna.typeScale.display.includes("7vw") || dna.typeScale.display.includes("6rem")
      ? "bold"
      : dna.typeScale.display.includes("4.5vw") || dna.typeScale.display.includes("3.5rem")
        ? "compact"
        : "modern";
  if (dnaScale === visual.typography.editorialScale) score += 15;
  else { issues.push(`type scale: ${dnaScale} vs extracted ${visual.typography.editorialScale}`); score += 5; }

  // Heading weight matches
  if (visual.typography.headingWeight !== null) {
    if (Math.abs(dna.typeScale.headingWeight - visual.typography.headingWeight) <= 100) score += 10;
    else { issues.push(`heading weight: ${dna.typeScale.headingWeight} vs ${visual.typography.headingWeight}`); score += 3; }
  } else {
    score += 5;
  }

  // Tracking matches
  if (visual.typography.trackingTight && trackingVal < 0) score += 5;
  else if (!visual.typography.trackingTight && (isNaN(trackingVal) || trackingVal >= 0)) score += 5;
  else { issues.push("tracking preference mismatch"); score += 2; }

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scoreBrandFidelity(
  schema: SiteSchema,
  dna: DesignDNA,
  analysis?: SiteAnalysis,
  visual?: VisualDNA,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  // Dark/light mode matches
  if (visual) {
    const schemaDark = schema.theme.dark === true;
    if (schemaDark === visual.brand.isDark) score += 20;
    else { issues.push("dark/light mode mismatch"); fixes.push("match source dark/light preference"); }
  } else {
    score += 15;
  }

  // Accent color preserved
  if (analysis?.brand?.accentColor && schema.theme.accent) {
    if (schema.theme.accent.toLowerCase() === analysis.brand.accentColor.toLowerCase()) score += 20;
    else { issues.push("accent color differs from source"); score += 10; }
  } else {
    score += 10;
  }

  // Logo present
  if (schema.brand.logo) score += 15;
  else if (analysis?.brand?.logoUrl) {
    issues.push("logo not included");
    fixes.push("include extracted logo URL");
  } else {
    score += 10;
  }

  // Brand name correct
  if (analysis?.brandName && schema.brand.name === analysis.brandName) score += 15;
  else if (schema.brand.name) score += 10;
  else { issues.push("brand name missing"); }

  // Premium score within ±20 of source
  if (visual) {
    const schemaPremium = estimateSchemaPremium(dna);
    if (Math.abs(schemaPremium - visual.brand.premiumScore) <= 20) score += 15;
    else { issues.push(`premium perception gap: schema=${schemaPremium} vs source=${visual.brand.premiumScore}`); score += 5; }
  } else {
    score += 10;
  }

  // Personality alignment
  if (visual && visual.brand.personality.length > 0) {
    score += 15;
  } else {
    score += 10;
  }

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scoreFramerFidelity(
  visual?: VisualDNA,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];

  if (!visual?.framer) {
    return { score: 80, maxScore: 100, issues: ["not a Framer site"], fixes: [] };
  }

  let score = 0;
  const framer = visual.framer;

  // Section identities detected
  if (framer.sectionIdentities.length > 0) score += 30;
  else { issues.push("no Framer section identities detected"); }

  // Component names extracted
  if (framer.componentNames.length > 0) score += 20;
  else { issues.push("no Framer component names"); }

  // Responsive variants were collapsed (count should be low after pass-framer)
  if (framer.responsiveVariants <= framer.sectionIdentities.length) score += 25;
  else { issues.push("responsive variants not fully collapsed"); fixes.push("ensure pass-framer removes all Tablet/Phone variants"); }

  // Layout hints available
  if (framer.layoutHints.length > 0) score += 15;
  else score += 5;

  // Named sections mapped
  if (framer.namedSections.length >= 3) score += 10;
  else score += 5;

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

function scoreProductionReadiness(
  schema: SiteSchema,
  dna: DesignDNA,
): DimensionScore {
  const issues: string[] = [];
  const fixes: string[] = [];
  let score = 0;

  const types = schema.blocks.map((b) => b.type);

  // Hero has CTA
  const hero = schema.blocks.find((b) => b.type === "hero");
  if (hero?.props.ctaLabel || hero?.props.primaryCta) score += 20;
  else { issues.push("hero has no CTA"); fixes.push("add primary CTA to hero"); }

  // Contact section present
  if (types.includes("contact")) score += 15;
  else { issues.push("no contact section"); fixes.push("add a contact section"); }

  // Footer present
  if (types.includes("footer")) score += 15;
  else { issues.push("no footer"); fixes.push("add a footer section"); }

  // No consecutive duplicate sections
  let hasDupes = false;
  for (let i = 1; i < schema.blocks.length; i++) {
    if (schema.blocks[i].type === schema.blocks[i - 1].type) { hasDupes = true; break; }
  }
  if (!hasDupes) score += 15;
  else { issues.push("consecutive duplicate sections"); fixes.push("deduplicate adjacent same-type sections"); }

  // Fluid type (responsive)
  if (dna.typeScale.display.includes("clamp(")) score += 15;
  else { issues.push("display type not responsive"); fixes.push("use clamp() for fluid typography"); }

  // Enough sections for complete experience
  if (schema.blocks.length >= 5) score += 10;
  else { issues.push("too few sections"); fixes.push("add more sections"); }

  // CTA section present
  if (types.includes("cta")) score += 10;
  else { issues.push("no closing CTA section"); fixes.push("add a call-to-action section"); }

  return { score: clamp(score), maxScore: 100, issues, fixes };
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function clamp(score: number): number {
  return Math.min(Math.max(Math.round(score), 0), 100);
}

function estimateSchemaPremium(dna: DesignDNA): number {
  let score = 0;
  if (dna.rhythm.density === "editorial" || dna.rhythm.density === "generous") score += 25;
  if (dna.motion.level >= 2) score += 20;
  if (dna.cardSystem.style === "glass" || dna.cardSystem.style === "editorial") score += 15;
  if (dna.heroDirection.heightVh >= 90) score += 15;
  const tracking = parseFloat(dna.typeScale.tracking);
  if (!isNaN(tracking) && tracking < 0) score += 15;
  if (dna.colorStrategy.mode === "accent-rare") score += 10;
  return Math.min(score, 100);
}

/* -------------------------------------------------------------------------- */
/*  Main scoring function                                                     */
/* -------------------------------------------------------------------------- */

export function evaluateQuality(
  schema: SiteSchema,
  dna: DesignDNA,
  profile: BusinessProfile,
  analysis?: SiteAnalysis,
): QualityScore {
  const visual = analysis?.visualDna;

  const contentFidelity = scoreContentFidelity(schema, analysis);
  const designFidelity = scoreDesignFidelity(dna, visual);
  const layoutFidelity = scoreLayoutFidelity(schema, dna, visual);
  const motionFidelity = scoreMotionFidelity(dna, visual);
  const typographyFidelity = scoreTypographyFidelity(dna, analysis, visual);
  const brandFidelity = scoreBrandFidelity(schema, dna, analysis, visual);
  const framerFidelity = scoreFramerFidelity(visual);
  const productionReadiness = scoreProductionReadiness(schema, dna);

  const total = Math.round(
    contentFidelity.score * WEIGHTS.contentFidelity +
    designFidelity.score * WEIGHTS.designFidelity +
    layoutFidelity.score * WEIGHTS.layoutFidelity +
    motionFidelity.score * WEIGHTS.motionFidelity +
    typographyFidelity.score * WEIGHTS.typographyFidelity +
    brandFidelity.score * WEIGHTS.brandFidelity +
    framerFidelity.score * WEIGHTS.framerFidelity +
    productionReadiness.score * WEIGHTS.productionReadiness
  );

  const allFixes = [
    ...contentFidelity.fixes,
    ...brandFidelity.fixes,
    ...typographyFidelity.fixes,
    ...layoutFidelity.fixes,
    ...designFidelity.fixes,
    ...productionReadiness.fixes,
    ...motionFidelity.fixes,
    ...framerFidelity.fixes,
  ];

  return {
    contentFidelity,
    designFidelity,
    layoutFidelity,
    motionFidelity,
    typographyFidelity,
    brandFidelity,
    framerFidelity,
    productionReadiness,
    total,
    passes: total >= PASS_THRESHOLD,
    allFixes,
  };
}
