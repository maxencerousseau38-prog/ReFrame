/**
 * Art Director Engine — the creative brain of ReFrame.
 *
 * Sits between VisualDNA/DNA compilation and the Composer. Consumes all upstream
 * artifacts (BusinessProfile, DesignDNA, Moodboard, VisualDNA) and produces a
 * single deterministic ArtDirection object. The Composer blindly executes it.
 *
 * Every artistic decision — hero variant, section order, feature layout, CTA
 * positioning, typography rhythm — is made HERE. The Composer never improvises.
 *
 * Variation is deterministic: same brand → same art direction. Different brands
 * (even same industry, same tier) → different art direction, because the seed
 * derived from brand identity differs.
 */

import type { BlockType, Industry, SiteAnalysis, Theme } from "./types";
import type { BusinessProfile } from "./business";
import type { DesignDNA } from "./dna";
import type { Moodboard } from "./references";
import type { VisualDNA } from "@/lib/extraction/types";
import { sceneOrderMeasured } from "@/lib/measure/scenes";
import { BLOCK_CATALOG } from "./catalog";
import { INDUSTRY_PROFILES } from "./industries";
import { planSmart, type Plan } from "./planner";
import { renderableCategory } from "./structure";

/* -------------------------------------------------------------------------- */
/*  ArtDirection type                                                         */
/* -------------------------------------------------------------------------- */

export interface ArtDirection {
  seed: number;
  signature: string;

  // 17 Artistic Properties
  pageStorytelling: "problem-solution" | "journey" | "showcase" | "editorial" | "manifesto";
  sectionRhythm: "steady" | "crescendo" | "wave" | "staccato" | "editorial-pause";
  visualHierarchy: "hero-dominant" | "distributed" | "progressive" | "bookend";
  editorialFlow: "linear" | "zigzag" | "asymmetric" | "centered" | "magazine";
  heroPhilosophy: "immersive" | "statement" | "product-first" | "editorial" | "atmospheric";
  whitespaceStrategy: "generous" | "balanced" | "dense" | "editorial-breathing";
  imageRhythm: "hero-only" | "alternating" | "section-paired" | "gallery-burst" | "minimal";
  compositionStyle: "symmetric" | "asymmetric" | "editorial-grid" | "fluid" | "structured";
  asymmetry: "none" | "subtle" | "bold" | "editorial";
  typographyRhythm: "uniform" | "contrasting" | "escalating" | "editorial-mix";
  ctaHierarchy: "single-dominant" | "dual-balanced" | "progressive" | "soft-repeated";
  contrastStrategy: "alternating" | "dark-anchor" | "light-dominant" | "gradient-flow" | "monochrome";
  emotionalDirection: "warm-inviting" | "cool-professional" | "bold-confident" | "elegant-restrained" | "playful-energetic";
  luxuryLevel: number;
  minimalismLevel: number;
  visualDensity: number;
  motionPhilosophy: "restrained" | "purposeful" | "cinematic" | "playful" | "none";

  // 12 Layout Decisions
  heroVariant: string;
  sectionOrder: BlockType[];
  imagePlacements: Record<string, "left" | "right" | "behind" | "above" | "below" | "none">;
  overlapUsage: "none" | "hero-bleed" | "section-overlap" | "card-overlap";
  galleryStyle: "grid" | "masonry" | "strip" | "editorial" | "feature" | "none";
  splitSections: string[];
  editorialSections: string[];
  featureLayout: "grid-2" | "grid-3" | "grid-4" | "bento" | "alternating" | "columns" | "sticky" | "spotlight" | "bigtype" | "timeline" | "showcase";
  ctaPositioning: "before-contact" | "after-features" | "after-testimonials" | "dual" | "closing-only";
  testimonialLayout: "slider" | "grid" | "editorial" | "spotlight" | "stacked" | "none";
  faqLayout: "accordion" | "grid" | "none";
  footerComposition: "columns" | "minimal" | "editorial";

  variantMap: Record<string, string>;
}

/* -------------------------------------------------------------------------- */
/*  Deterministic seed system                                                 */
/* -------------------------------------------------------------------------- */

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function generateSeed(brandName: string, url: string, industry: string): number {
  let domain: string;
  try { domain = new URL(url).hostname.replace(/^www\./, ""); }
  catch { domain = url; }
  return fnv1a(`${brandName.toLowerCase().trim()}|${domain.toLowerCase()}|${industry}`);
}

/**
 * Avalanche finalizer (Murmur3 fmix32). FNV-1a has weak low-bit avalanche: two
 * different seeds hashed with the same salt can share their low bits, so a bare
 * `% n` collapsed same-sector brands onto the same seeded choice (three
 * restaurants all opened on the same hero). Mixing the bits before the modulo
 * decorrelates the low bits and restores real per-brand variety on EVERY seeded
 * decision — hero, rhythm, flow, contrast, gallery, cta, about, footer.
 */
function fmix32(h: number): number {
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}

function seededPick<T>(options: readonly T[], seed: number, salt: string): T {
  const h = fmix32(fnv1a(seed.toString() + salt));
  return options[h % options.length];
}

function seededFloat(seed: number, salt: string): number {
  return (fmix32(fnv1a(seed.toString() + salt)) % 10000) / 10000;
}

/* -------------------------------------------------------------------------- */
/*  Hero variant mapping                                                      */
/* -------------------------------------------------------------------------- */

const HERO_STYLE_VARIANTS: Record<string, string[]> = {
  // HeroCollage is a split editorial-collage first impression — it exists so two
  // same-sector brands don't both open on the same full-bleed photo. It must be
  // reachable from the image-led philosophies, not just the legacy pickVariant.
  fullbleed: ["HeroImageFull", "HeroArchform", "HeroMonumental", "HeroCollage"],
  split: ["HeroSplitPremium", "HeroPremium2", "HeroCollage"],
  editorial: ["HeroEditorial", "HeroCollage"],
  monumental: ["HeroMonumental", "HeroArchform"],
  cinematic: ["HeroAurora", "HeroAgencia", "HeroBeam", "HeroSpotlight"],
  minimal: ["HeroPremium1", "HeroCanvas", "HeroBento"],
  bento: ["HeroBento"],
};

const HERO_PHILOSOPHY_STYLES: Record<ArtDirection["heroPhilosophy"], string[]> = {
  immersive: ["fullbleed", "monumental", "cinematic"],
  statement: ["monumental", "cinematic", "fullbleed"],
  "product-first": ["split", "bento", "minimal"],
  editorial: ["editorial", "split"],
  atmospheric: ["cinematic", "minimal"],
};

/* -------------------------------------------------------------------------- */
/*  Feature layout → catalog variant                                          */
/* -------------------------------------------------------------------------- */

const FEATURE_LAYOUT_VARIANT: Record<ArtDirection["featureLayout"], string> = {
  "grid-2": "FeaturesGrid1",
  "grid-3": "FeaturesGrid1",
  "grid-4": "FeaturesGrid1",
  bento: "FeaturesBento",
  alternating: "FeaturesAlternating",
  columns: "FeaturesColumns",
  sticky: "FeaturesSticky",
  spotlight: "FeaturesSpotlight",
  bigtype: "FeaturesBigType",
  timeline: "ProcessTimeline",
  showcase: "FeaturesShowcase",
};

/* -------------------------------------------------------------------------- */
/*  Testimonial layout → variant                                              */
/* -------------------------------------------------------------------------- */

const TESTIMONIAL_LAYOUT_VARIANT: Record<string, string> = {
  slider: "TestimonialsSlider1",
  grid: "TestimonialsGrid",
  editorial: "TestimonialsEditorial",
  spotlight: "TestimonialsSpotlight",
  stacked: "TestimonialsStacked",
};

/* -------------------------------------------------------------------------- */
/*  Sub-directors: 17 artistic properties                                     */
/* -------------------------------------------------------------------------- */

type Mood = Theme["mood"];
type Tier = BusinessProfile["tier"];

function directPageStorytelling(
  profile: BusinessProfile,
  seed: number,
): ArtDirection["pageStorytelling"] {
  const industryArc: Partial<Record<Industry, ArtDirection["pageStorytelling"][]>> = {
    restaurant: ["journey", "editorial"],
    hotel: ["journey", "editorial"],
    architect: ["showcase", "editorial"],
    fashion: ["editorial", "showcase"],
    agency: ["showcase", "manifesto"],
    saas: ["problem-solution", "manifesto"],
    ecommerce: ["showcase", "problem-solution"],
    lawyer: ["problem-solution", "journey"],
    medical: ["problem-solution", "journey"],
    plumber: ["problem-solution", "manifesto"],
    electrician: ["problem-solution", "manifesto"],
    construction: ["showcase", "problem-solution"],
    realestate: ["showcase", "journey"],
    health: ["journey", "problem-solution"],
    coach: ["journey", "manifesto"],
    gym: ["manifesto", "problem-solution"],
    finance: ["problem-solution", "journey"],
    automotive: ["showcase", "editorial"],
  };

  if (profile.tier === "luxury") return "editorial";
  if (profile.tier === "budget") return "problem-solution";

  const options = industryArc[profile.industry] || ["problem-solution", "journey"];
  return seededPick(options, seed, "storytelling");
}

function directSectionRhythm(
  profile: BusinessProfile,
  dna: DesignDNA,
  seed: number,
): ArtDirection["sectionRhythm"] {
  if (profile.tier === "luxury") return seededPick(["editorial-pause", "wave"] as const, seed, "rhythm");
  if (profile.tier === "budget") return "steady";

  const moodRhythms: Record<Mood, ArtDirection["sectionRhythm"][]> = {
    bold: ["crescendo", "staccato", "wave"],
    elegant: ["editorial-pause", "wave", "steady"],
    warm: ["wave", "steady", "crescendo"],
    minimal: ["steady", "wave", "editorial-pause"],
  };
  return seededPick(moodRhythms[dna.mood], seed, "sectionRhythm");
}

function directVisualHierarchy(
  profile: BusinessProfile,
  dna: DesignDNA,
  seed: number,
): ArtDirection["visualHierarchy"] {
  if (dna.heroDirection.heightVh >= 90) return "hero-dominant";
  if (profile.tier === "luxury") return seededPick(["hero-dominant", "bookend"] as const, seed, "hierarchy");
  if (profile.tier === "budget") return "distributed";

  return seededPick(
    ["hero-dominant", "distributed", "progressive", "bookend"] as const,
    seed, "hierarchy",
  );
}

function directEditorialFlow(
  profile: BusinessProfile,
  visualDna: VisualDNA | undefined,
  mood: Mood,
  seed: number,
): ArtDirection["editorialFlow"] {
  if (visualDna?.layout.asymmetry) return seededPick(["asymmetric", "zigzag", "magazine"] as const, seed, "flow");
  if (profile.tier === "luxury") return seededPick(["magazine", "asymmetric"] as const, seed, "flow");

  const moodFlows: Record<Mood, ArtDirection["editorialFlow"][]> = {
    bold: ["zigzag", "asymmetric", "magazine"],
    elegant: ["centered", "magazine", "linear"],
    warm: ["linear", "centered", "zigzag"],
    minimal: ["centered", "linear", "zigzag"],
  };
  return seededPick(moodFlows[mood], seed, "editorialFlow");
}

function directHeroPhilosophy(
  profile: BusinessProfile,
  dna: DesignDNA,
  visualDna: VisualDNA | undefined,
  seed: number,
): ArtDirection["heroPhilosophy"] {
  if (visualDna) {
    const comp = visualDna.hero.compositionType;
    if (comp === "fullbleed") return "immersive";
    if (comp === "editorial") return "editorial";
    if (comp === "cinematic") return "atmospheric";
    if (comp === "split") return seededPick(["product-first", "statement"] as const, seed, "hero");
    if (comp === "minimal") return seededPick(["product-first", "editorial"] as const, seed, "hero");
  }

  const industryHero: Partial<Record<Industry, ArtDirection["heroPhilosophy"][]>> = {
    restaurant: ["immersive", "editorial"],
    hotel: ["immersive", "atmospheric"],
    architect: ["immersive", "statement"],
    fashion: ["statement", "editorial"],
    agency: ["statement", "atmospheric"],
    saas: ["product-first", "atmospheric"],
    ecommerce: ["product-first", "statement"],
    lawyer: ["editorial", "statement"],
    medical: ["editorial", "product-first"],
    plumber: ["product-first", "statement"],
    electrician: ["product-first", "statement"],
  };

  if (profile.tier === "luxury") return seededPick(["immersive", "statement"] as const, seed, "hero");

  const options = industryHero[profile.industry] || ["product-first", "statement"];
  return seededPick(options, seed, "heroPhilosophy");
}

function directWhitespace(
  profile: BusinessProfile,
  dna: DesignDNA,
  seed: number,
): ArtDirection["whitespaceStrategy"] {
  if (profile.tier === "luxury") return seededPick(["generous", "editorial-breathing"] as const, seed, "ws");
  if (profile.tier === "budget") return "dense";
  if (dna.rhythm.density === "editorial") return "editorial-breathing";
  if (dna.rhythm.density === "generous") return "generous";
  if (dna.rhythm.density === "tight") return "dense";
  return seededPick(["balanced", "generous"] as const, seed, "whitespace");
}

function directImageRhythm(
  analysis: SiteAnalysis,
  visualDna: VisualDNA | undefined,
  seed: number,
): ArtDirection["imageRhythm"] {
  const imageCount = analysis.extractedContent.images.length;
  if (imageCount === 0) return "minimal";
  if (imageCount === 1) return "hero-only";
  if (imageCount >= 6) return seededPick(["gallery-burst", "alternating", "section-paired"] as const, seed, "img");
  return seededPick(["alternating", "section-paired", "hero-only"] as const, seed, "imageRhythm");
}

function directCompositionStyle(
  profile: BusinessProfile,
  visualDna: VisualDNA | undefined,
  mood: Mood,
  seed: number,
): ArtDirection["compositionStyle"] {
  if (visualDna?.layout.asymmetry) return seededPick(["asymmetric", "editorial-grid"] as const, seed, "comp");
  if (profile.tier === "luxury") return seededPick(["editorial-grid", "asymmetric"] as const, seed, "comp");
  if (profile.tier === "budget") return "structured";

  const moodComp: Record<Mood, ArtDirection["compositionStyle"][]> = {
    bold: ["asymmetric", "fluid", "structured"],
    elegant: ["editorial-grid", "symmetric", "asymmetric"],
    warm: ["symmetric", "fluid", "structured"],
    minimal: ["structured", "symmetric", "editorial-grid"],
  };
  return seededPick(moodComp[mood], seed, "composition");
}

function directAsymmetry(
  profile: BusinessProfile,
  visualDna: VisualDNA | undefined,
  seed: number,
): ArtDirection["asymmetry"] {
  if (visualDna?.layout.asymmetry) return seededPick(["subtle", "bold"] as const, seed, "asym");
  if (profile.tier === "luxury") return seededPick(["subtle", "editorial"] as const, seed, "asym");
  if (profile.tier === "budget") return "none";
  return seededPick(["none", "subtle", "none"] as const, seed, "asymmetry");
}

function directTypographyRhythm(
  dna: DesignDNA,
  visualDna: VisualDNA | undefined,
  seed: number,
): ArtDirection["typographyRhythm"] {
  if (visualDna?.typography.editorialScale === "editorial" || visualDna?.typography.editorialScale === "bold") {
    return seededPick(["editorial-mix", "contrasting"] as const, seed, "typo");
  }
  const scaleMap: Record<string, ArtDirection["typographyRhythm"][]> = {
    editorial: ["editorial-mix", "contrasting"],
    bold: ["contrasting", "escalating"],
    modern: ["uniform", "contrasting"],
    compact: ["uniform", "escalating"],
  };
  const typeKey = dna.typeScale.display.includes("6vw") ? "editorial" :
    dna.typeScale.display.includes("7vw") ? "bold" :
    dna.typeScale.display.includes("4.5vw") ? "compact" : "modern";
  return seededPick(scaleMap[typeKey] || ["uniform"], seed, "typographyRhythm");
}

function directCtaHierarchy(
  profile: BusinessProfile,
  dna: DesignDNA,
  seed: number,
): ArtDirection["ctaHierarchy"] {
  if (dna.heroDirection.ctaCount >= 2) {
    return seededPick(["dual-balanced", "progressive"] as const, seed, "cta");
  }
  if (profile.tier === "luxury") return "soft-repeated";
  if (profile.tier === "budget") return "single-dominant";
  return seededPick(["single-dominant", "dual-balanced", "progressive"] as const, seed, "ctaHierarchy");
}

function directContrastStrategy(
  dna: DesignDNA,
  visualDna: VisualDNA | undefined,
  seed: number,
): ArtDirection["contrastStrategy"] {
  if (dna.colorStrategy.preferDark) {
    return seededPick(["dark-anchor", "monochrome", "gradient-flow"] as const, seed, "contrast");
  }
  if (dna.colorStrategy.useGradients) return "gradient-flow";
  if (dna.colorStrategy.mode === "monochrome") return "monochrome";

  return seededPick(
    ["alternating", "light-dominant", "dark-anchor"] as const,
    seed, "contrastStrategy",
  );
}

function directEmotionalDirection(
  mood: Mood,
  seed: number,
): ArtDirection["emotionalDirection"] {
  const moodEmotion: Record<Mood, ArtDirection["emotionalDirection"][]> = {
    // Elegant leads with restraint (dropping "warm-inviting", which misfired on
    // stone-grey luxury brands); the mood now genuinely steers the emotion.
    warm: ["warm-inviting", "playful-energetic"],
    elegant: ["elegant-restrained", "cool-professional"],
    bold: ["bold-confident", "cool-professional"],
    minimal: ["cool-professional", "elegant-restrained"],
  };
  return seededPick(moodEmotion[mood], seed, "emotion");
}

function directLuxuryLevel(
  profile: BusinessProfile,
  dna: DesignDNA,
  visualDna: VisualDNA | undefined,
): number {
  if (visualDna?.brand.luxuryScore !== undefined) {
    return Math.max(visualDna.brand.luxuryScore, profile.tier === "luxury" ? 70 : 0);
  }
  const tierBase: Record<Tier, number> = { luxury: 85, premium: 55, mid: 30, budget: 10 };
  let score = tierBase[profile.tier];
  if (dna.rhythm.density === "editorial") score += 10;
  if (dna.motion.level >= 3) score += 5;
  return Math.min(score, 100);
}

function directMinimalismLevel(
  profile: BusinessProfile,
  dna: DesignDNA,
  visualDna: VisualDNA | undefined,
): number {
  if (visualDna?.brand.minimalismScore !== undefined) return visualDna.brand.minimalismScore;
  let score = 50;
  if (dna.cardSystem.shadow === "none") score += 15;
  if (dna.colorStrategy.mode === "monochrome") score += 15;
  if (dna.rhythm.density === "generous" || dna.rhythm.density === "editorial") score += 10;
  if (dna.motion.level <= 1) score += 10;
  return Math.min(score, 100);
}

function directVisualDensity(
  profile: BusinessProfile,
  dna: DesignDNA,
  seed: number,
): number {
  const densityBase: Record<Tier, number> = { luxury: 25, premium: 35, mid: 55, budget: 70 };
  let score = densityBase[profile.tier];
  if (dna.rhythm.density === "tight") score += 15;
  if (dna.rhythm.density === "editorial") score -= 15;
  const jitter = (seededFloat(seed, "density") - 0.5) * 10;
  return Math.min(Math.max(Math.round(score + jitter), 0), 100);
}

function directMotionPhilosophy(
  dna: DesignDNA,
  visualDna: VisualDNA | undefined,
  seed: number,
): ArtDirection["motionPhilosophy"] {
  if (visualDna?.motion.interactionPhilosophy === "restrained") return "restrained";
  if (visualDna?.motion.interactionPhilosophy === "cinematic") return "cinematic";
  if (dna.motion.level === 0) return "none";
  if (dna.motion.level === 1) return "restrained";
  if (dna.motion.level >= 3) return seededPick(["cinematic", "playful"] as const, seed, "motion");
  return "purposeful";
}

/* -------------------------------------------------------------------------- */
/*  Sub-directors: 12 layout decisions                                        */
/* -------------------------------------------------------------------------- */

function pickHeroVariant(
  heroPhilosophy: ArtDirection["heroPhilosophy"],
  dna: DesignDNA,
  visualDna: VisualDNA | undefined,
  industry: Industry,
  hasImages: boolean,
  seed: number,
): string {
  // 1. If VisualDNA has a composition type, use it directly
  if (visualDna) {
    const comp = visualDna.hero.compositionType;
    const candidates = HERO_STYLE_VARIANTS[comp];
    if (candidates) {
      const available = candidates.filter((v) => {
        const meta = BLOCK_CATALOG.find((b) => b.variant === v);
        return meta && (meta.sectors === "all" || (meta.sectors as Industry[]).includes(industry));
      });
      if (available.length > 0) return seededPick(available, seed, "heroVariant");
    }
  }

  // 2. Map hero philosophy to compatible styles, then to variants.
  // The whole UNION of eligible variants across the philosophy's styles is the
  // candidate pool — not the first non-empty style. The old fixed-order loop
  // collapsed every "immersive" brand onto the `fullbleed` group (and, for
  // image-led sectors, onto a single variant), so three restaurants all opened
  // on the same hero. Pooling across styles + a real seed makes the single most
  // visible element diverge brand-to-brand — the biggest "AI template" tell.
  const styles = HERO_PHILOSOPHY_STYLES[heroPhilosophy] || ["split"];
  const pool: string[] = [];
  for (const style of styles) {
    for (const v of HERO_STYLE_VARIANTS[style] || []) {
      if (pool.includes(v)) continue;
      const meta = BLOCK_CATALOG.find((b) => b.variant === v);
      if (!meta) continue;
      if (meta.sectors !== "all" && !(meta.sectors as Industry[]).includes(industry)) continue;
      // Don't pick a photo-led hero without images to fill it.
      if (!hasImages && (v.includes("ImageFull") || v.includes("Monumental") || v.includes("Archform") || v.includes("Collage"))) continue;
      pool.push(v);
    }
  }
  if (pool.length > 0) return seededPick(pool, seed, "heroVariant:" + heroPhilosophy);

  // 3. Fallback to the DNA style
  const dnaStyle = dna.heroDirection.style;
  const fallbacks = HERO_STYLE_VARIANTS[dnaStyle] || ["HeroPremium1"];
  const available = fallbacks.filter((v) => {
    const meta = BLOCK_CATALOG.find((b) => b.variant === v);
    return meta && (meta.sectors === "all" || (meta.sectors as Industry[]).includes(industry));
  });
  return available.length > 0 ? seededPick(available, seed, "heroFallback") : "HeroPremium1";
}

function directFeatureLayout(
  profile: BusinessProfile,
  dna: DesignDNA,
  analysis: SiteAnalysis,
  mood: Mood,
  seed: number,
): ArtDirection["featureLayout"] {
  const serviceCount = analysis.extractedContent.serviceItems?.length ||
    analysis.extractedContent.services.length;

  // Industry affinities
  const tradeIndustries: Industry[] = ["plumber", "electrician", "construction", "artisan"];
  if (tradeIndustries.includes(profile.industry)) {
    return seededPick(["timeline", "columns", "alternating"] as const, seed, "feat");
  }

  const editorialIndustries: Industry[] = ["architect", "fashion", "hotel", "restaurant"];
  if (editorialIndustries.includes(profile.industry) && profile.tier !== "budget") {
    return seededPick(["bigtype", "sticky", "showcase", "alternating"] as const, seed, "feat");
  }

  // Mood-based options
  const moodLayouts: Record<Mood, ArtDirection["featureLayout"][]> = {
    bold: ["bento", "spotlight", "grid-3", "showcase"],
    elegant: ["sticky", "alternating", "bigtype", "columns"],
    warm: ["showcase", "alternating", "grid-3", "columns"],
    minimal: ["grid-3", "columns", "alternating", "sticky"],
  };

  let options = moodLayouts[mood];

  // Content density filter
  if (serviceCount <= 3) {
    options = options.filter((l) => !["grid-4", "bento"].includes(l));
    if (options.length === 0) options = ["alternating", "columns"];
  } else if (serviceCount >= 6) {
    options = [...options, "grid-4"];
  }

  return seededPick(options, seed, "featureLayout");
}

function directTestimonialLayout(
  hasTestimonials: boolean,
  mood: Mood,
  seed: number,
): ArtDirection["testimonialLayout"] {
  if (!hasTestimonials) return "none";

  const moodTestimonials: Record<Mood, ArtDirection["testimonialLayout"][]> = {
    bold: ["slider", "spotlight", "stacked"],
    elegant: ["editorial", "stacked", "grid"],
    warm: ["grid", "editorial", "slider"],
    minimal: ["slider", "grid", "stacked"],
  };
  return seededPick(moodTestimonials[mood], seed, "testimonials");
}

function directGalleryStyle(
  analysis: SiteAnalysis,
  dna: DesignDNA,
  mood: Mood,
  seed: number,
): ArtDirection["galleryStyle"] {
  if (analysis.extractedContent.images.length < 2) return "none";

  const moodGallery: Record<Mood, ArtDirection["galleryStyle"][]> = {
    bold: ["masonry", "strip", "feature"],
    elegant: ["editorial", "grid", "masonry"],
    warm: ["grid", "feature", "editorial"],
    minimal: ["grid", "strip", "editorial"],
  };
  return seededPick(moodGallery[mood], seed, "gallery");
}

function directCtaPositioning(
  storytelling: ArtDirection["pageStorytelling"],
  seed: number,
): ArtDirection["ctaPositioning"] {
  const arcCta: Record<ArtDirection["pageStorytelling"], ArtDirection["ctaPositioning"][]> = {
    "problem-solution": ["after-features", "before-contact"],
    journey: ["after-testimonials", "before-contact"],
    showcase: ["after-features", "closing-only"],
    editorial: ["before-contact", "closing-only"],
    manifesto: ["after-features", "dual"],
  };
  return seededPick(arcCta[storytelling], seed, "ctaPos");
}

function directFaqLayout(
  hasFaq: boolean,
  mood: Mood,
  seed: number,
): ArtDirection["faqLayout"] {
  if (!hasFaq) return "none";
  const moodFaq: Record<Mood, ArtDirection["faqLayout"][]> = {
    bold: ["accordion", "grid"],
    elegant: ["grid", "accordion"],
    warm: ["accordion", "grid"],
    minimal: ["accordion", "grid"],
  };
  return seededPick(moodFaq[mood], seed, "faq");
}

function directFooterComposition(
  mood: Mood,
  profile: BusinessProfile,
  seed: number,
): ArtDirection["footerComposition"] {
  const options: Record<Mood, ArtDirection["footerComposition"][]> = {
    bold: ["minimal", "columns"],
    elegant: ["editorial", "minimal"],
    warm: ["columns", "editorial"],
    minimal: ["columns", "minimal"],
  };
  return seededPick(options[mood], seed, "footer");
}

function directSplitSections(
  sectionOrder: BlockType[],
  profile: BusinessProfile,
  seed: number,
): string[] {
  if (profile.tier === "budget") return [];
  const candidates: BlockType[] = ["about", "features", "contact"];
  const splits: string[] = [];
  for (const c of candidates) {
    if (sectionOrder.includes(c) && seededFloat(seed, "split:" + c) > 0.5) {
      splits.push(c);
    }
  }
  return splits;
}

function directEditorialSections(
  sectionOrder: BlockType[],
  profile: BusinessProfile,
  luxuryLevel: number,
  seed: number,
): string[] {
  if (luxuryLevel < 40) return [];
  const candidates: BlockType[] = ["about", "cta"];
  if (luxuryLevel >= 70) candidates.push("features");
  const editorials: string[] = [];
  for (const c of candidates) {
    if (sectionOrder.includes(c) && seededFloat(seed, "editorial:" + c) > 0.4) {
      editorials.push(c);
    }
  }
  return editorials;
}

function directImagePlacements(
  sectionOrder: BlockType[],
  dna: DesignDNA,
  visualDna: VisualDNA | undefined,
  seed: number,
): Record<string, "left" | "right" | "behind" | "above" | "below" | "none"> {
  const placements: Record<string, "left" | "right" | "behind" | "above" | "below" | "none"> = {};

  // Hero image position from DNA or VisualDNA
  if (visualDna) {
    const pos = visualDna.hero.imagePosition;
    placements.hero = (pos === "behind" || pos === "left" || pos === "right" || pos === "below")
      ? pos : (pos === "none" ? "none" : "right");
  } else {
    placements.hero = dna.heroDirection.imagePosition;
  }

  // Alternate image placement for content sections
  const contentSections = sectionOrder.filter((s) =>
    s !== "hero" && s !== "footer" && s !== "cta" && s !== "faq" && s !== "contact" && s !== "stats",
  );
  const sides: Array<"left" | "right"> = ["left", "right"];
  contentSections.forEach((section, i) => {
    placements[section] = seededPick(sides, seed, "imgpos:" + section + i);
  });

  return placements;
}

function directOverlapUsage(
  profile: BusinessProfile,
  visualDna: VisualDNA | undefined,
): ArtDirection["overlapUsage"] {
  if (visualDna?.layout.overlapPatterns) return "section-overlap";
  if (profile.tier === "luxury") return "hero-bleed";
  if (profile.tier === "premium") return "hero-bleed";
  return "none";
}

/* -------------------------------------------------------------------------- */
/*  Section order variation                                                   */
/* -------------------------------------------------------------------------- */

function varySectionOrder(
  basePlan: Plan,
  storytelling: ArtDirection["pageStorytelling"],
  visualDna: VisualDNA | undefined,
  seed: number,
  measuredOrder?: string[],
): BlockType[] {
  const order = basePlan.slots.map((s) => s.type);

  // Preserve hero first, footer last
  if (order.length < 4) return order;
  const hero = order[0];
  const footer = order[order.length - 1];
  const middle = order.slice(1, -1);

  // If VisualDNA has a section rhythm, prefer it — but never DROP planned
  // slots it doesn't mention: the plan only contains real content (F14), so
  // a slot lost here is real content lost (P0: a real FAQ vanished this way).
  if (visualDna?.layout.sectionRhythm && visualDna.layout.sectionRhythm.length >= 3) {
    const observed = visualDna.layout.sectionRhythm.map((s) => s as BlockType);
    const missing = middle.filter((t) => !observed.includes(t));
    return [hero, ...observed, ...missing, footer];
  }

  // Apply storytelling-driven reordering
  if (storytelling === "showcase") {
    // Move portfolio/gallery early
    const portfolioIdx = middle.indexOf("portfolio");
    const galleryIdx = middle.indexOf("gallery");
    const visualIdx = portfolioIdx >= 0 ? portfolioIdx : galleryIdx;
    if (visualIdx > 0) {
      const [item] = middle.splice(visualIdx, 1);
      middle.unshift(item);
    }
  } else if (storytelling === "journey") {
    // Move about before features
    const aboutIdx = middle.indexOf("about");
    const featIdx = middle.indexOf("features");
    if (aboutIdx > 0 && featIdx >= 0 && aboutIdx > featIdx) {
      const [about] = middle.splice(aboutIdx, 1);
      middle.splice(featIdx, 0, about);
    }
  }

  // Seed-driven adjacent swap for variation (only swap compatible sections)
  const swappable = new Set<BlockType>(["features", "about", "services", "stats", "portfolio", "gallery"]);
  for (let i = 0; i < middle.length - 1; i++) {
    if (swappable.has(middle[i]) && swappable.has(middle[i + 1])) {
      if (seededFloat(seed, "swap:" + i) > 0.65) {
        const tmp = middle[i];
        middle[i] = middle[i + 1];
        middle[i + 1] = tmp;
        i++; // skip next to avoid cascading swaps
      }
    }
  }

  // Ensure contact is near the end (before footer)
  const contactIdx = middle.indexOf("contact");
  if (contactIdx >= 0 && contactIdx < middle.length - 2) {
    const [contact] = middle.splice(contactIdx, 1);
    middle.push(contact);
  }

  // C7d — the source's MEASURED scene order outranks storytelling variation
  // (I1). Scene types are coarse (hero/gallery/section/footer), so only the
  // signal they genuinely carry is applied: where the gallery sits on the
  // page. Nothing measured → nothing changes.
  if (measuredOrder && measuredOrder.length >= 3) {
    const flow = measuredOrder.filter((t) => t !== "nav" && t !== "footer");
    const galleryPos = flow.indexOf("gallery");
    if (galleryPos >= 0) {
      const visualIdx = middle.findIndex((t) => t === "portfolio" || t === "gallery" || t === "products");
      if (visualIdx >= 0) {
        // Position among the middle sections mirroring the measured page flow
        // (hero occupies flow[0] → offset by one, clamped to the middle).
        const target = Math.min(Math.max(galleryPos - 1, 0), middle.length - 1);
        if (target !== visualIdx) {
          const [visual] = middle.splice(visualIdx, 1);
          middle.splice(target, 0, visual);
        }
      }
    }
  }

  return [hero, ...middle, footer];
}

/* -------------------------------------------------------------------------- */
/*  Variant map construction                                                  */
/* -------------------------------------------------------------------------- */

function buildVariantMap(
  ad: Omit<ArtDirection, "variantMap" | "signature">,
  industry: Industry,
  mood: Mood,
  seed: number,
): Record<string, string> {
  const map: Record<string, string> = {};

  // Hero
  map.hero = ad.heroVariant;

  // Features / services
  map.features = FEATURE_LAYOUT_VARIANT[ad.featureLayout];
  map.services = seededPick(["ServicesList", "ServicesCards"] as const, seed, "servicesVariant");

  // Testimonials
  if (ad.testimonialLayout !== "none") {
    map.testimonials = TESTIMONIAL_LAYOUT_VARIANT[ad.testimonialLayout] || "TestimonialsSlider1";
  }

  // CTA
  const ctaOptions: Record<Mood, string[]> = {
    bold: ["CTASection1", "CTAAsterisk", "CTAGradient", "CTABanner"],
    elegant: ["CTAEditorial", "CTABanner", "CTASection1"],
    warm: ["CTAEditorial", "CTABanner", "CTASection1"],
    minimal: ["CTASection1", "CTABanner", "CTAGradient"],
  };
  map.cta = seededPick(ctaOptions[mood], seed, "ctaVariant");

  // FAQ
  if (ad.faqLayout === "accordion") map.faq = "FAQAccordion1";
  else if (ad.faqLayout === "grid") map.faq = "FaqGrid";

  // Footer
  const footerMap: Record<ArtDirection["footerComposition"], string[]> = {
    columns: ["FooterColumns", "Footer1"],
    minimal: ["FooterMinimal", "Footer1"],
    editorial: ["Footer1", "FooterMinimal"],
  };
  map.footer = seededPick(footerMap[ad.footerComposition], seed, "footerVariant");

  // Contact
  const contactOptions: Record<Mood, string[]> = {
    bold: ["ContactBanner", "ContactFormPremium1"],
    elegant: ["ContactDetailsCard", "ContactFormPremium1"],
    warm: ["ContactDetailsCard", "ContactFormPremium1"],
    minimal: ["ContactFormPremium1", "ContactDetailsCard"],
  };
  map.contact = seededPick(contactOptions[mood], seed, "contactVariant");

  // About
  const aboutOptions: Record<Mood, string[]> = {
    bold: ["StatementAgencia", "StatementEditorial", "AboutSplit"],
    elegant: ["StatementEditorial", "AboutSplit"],
    warm: ["AboutSplit", "StatementEditorial"],
    minimal: ["AboutSplit", "StatementEditorial"],
  };
  map.about = seededPick(aboutOptions[mood], seed, "aboutVariant");

  // Gallery/Portfolio
  if (ad.galleryStyle !== "none") {
    const galleryMap: Record<string, string[]> = {
      grid: ["PortfolioGrid", "GalleryMasonry"],
      masonry: ["GalleryMasonry", "PortfolioGrid"],
      strip: ["GalleryStrip"],
      editorial: ["GalleryFeature", "PortfolioGrid"],
      feature: ["GalleryFeature"],
    };
    map.portfolio = seededPick(galleryMap[ad.galleryStyle] || ["PortfolioGrid"], seed, "galleryVariant");
    map.gallery = map.portfolio;
  }

  // Stats
  map.stats = "StatsCounter";

  // Process
  map.process = "ProcessTimeline";

  return map;
}

/* -------------------------------------------------------------------------- */
/*  Main entry point                                                          */
/* -------------------------------------------------------------------------- */

export function artDirect(
  profile: BusinessProfile,
  dna: DesignDNA,
  moodboard: Moodboard,
  analysis: SiteAnalysis,
  plan: Plan,
): ArtDirection {
  const seed = generateSeed(analysis.brandName, analysis.url, analysis.industry);
  const industry = analysis.industry;
  // Business-derived STYLE, carried on the DNA — never the industry default.
  const mood = dna.mood;
  const visualDna = analysis.visualDna;
  const hasImages = analysis.extractedContent.images.length > 0 || !!analysis.extractedContent.heroImageUrl;
  const hasTestimonials = !!analysis.extractedContent.testimonials?.length;
  const hasFaq = !!analysis.extractedContent.faqItems?.length;

  // 17 artistic properties
  const pageStorytelling = directPageStorytelling(profile, seed);
  const sectionRhythm = directSectionRhythm(profile, dna, seed);
  const visualHierarchy = directVisualHierarchy(profile, dna, seed);
  const editorialFlow = directEditorialFlow(profile, visualDna, mood, seed);
  const heroPhilosophy = directHeroPhilosophy(profile, dna, visualDna, seed);
  const whitespaceStrategy = directWhitespace(profile, dna, seed);
  const imageRhythm = directImageRhythm(analysis, visualDna, seed);
  const compositionStyle = directCompositionStyle(profile, visualDna, mood, seed);
  const asymmetryDir = directAsymmetry(profile, visualDna, seed);
  const typographyRhythm = directTypographyRhythm(dna, visualDna, seed);
  const ctaHierarchy = directCtaHierarchy(profile, dna, seed);
  const contrastStrategy = directContrastStrategy(dna, visualDna, seed);
  const emotionalDirection = directEmotionalDirection(mood, seed);
  const luxuryLevel = directLuxuryLevel(profile, dna, visualDna);
  const minimalismLevel = directMinimalismLevel(profile, dna, visualDna);
  const visualDensityVal = directVisualDensity(profile, dna, seed);
  const motionPhilosophy = directMotionPhilosophy(dna, visualDna, seed);

  // 12 layout decisions
  const heroVariant = pickHeroVariant(heroPhilosophy, dna, visualDna, industry, hasImages, seed);
  const sectionOrder = varySectionOrder(
    plan, pageStorytelling, visualDna, seed,
    analysis.measuredScenes ? sceneOrderMeasured(analysis.measuredScenes)?.value : undefined,
  );
  const featureLayout = directFeatureLayout(profile, dna, analysis, mood, seed);
  const testimonialLayout = directTestimonialLayout(hasTestimonials, mood, seed);
  const galleryStyleVal = directGalleryStyle(analysis, dna, mood, seed);
  const ctaPositioning = directCtaPositioning(pageStorytelling, seed);
  // F14: no more "|| true" — a FAQ layout is only directed when a real FAQ
  // exists (defaults were deleted with the no-fabrication rule, C3).
  const faqLayout = directFaqLayout(hasFaq, mood, seed);
  const footerComposition = directFooterComposition(mood, profile, seed);
  const splitSections = directSplitSections(sectionOrder, profile, seed);
  const editorialSectionsList = directEditorialSections(sectionOrder, profile, luxuryLevel, seed);
  const imagePlacements = directImagePlacements(sectionOrder, dna, visualDna, seed);
  const overlapUsage = directOverlapUsage(profile, visualDna);

  const partialAd = {
    seed,
    pageStorytelling,
    sectionRhythm,
    visualHierarchy,
    editorialFlow,
    heroPhilosophy,
    whitespaceStrategy,
    imageRhythm,
    compositionStyle,
    asymmetry: asymmetryDir,
    typographyRhythm,
    ctaHierarchy,
    contrastStrategy,
    emotionalDirection,
    luxuryLevel,
    minimalismLevel,
    visualDensity: visualDensityVal,
    motionPhilosophy,
    heroVariant,
    sectionOrder,
    imagePlacements,
    overlapUsage,
    galleryStyle: galleryStyleVal,
    splitSections,
    editorialSections: editorialSectionsList,
    featureLayout,
    ctaPositioning,
    testimonialLayout,
    faqLayout,
    footerComposition,
  };

  const variantMap = buildVariantMap(partialAd, industry, mood, seed);
  const signature = `ad:${industry}:${profile.tier}:${mood}:${seed.toString(16).slice(0, 6)}`;

  return { ...partialAd, variantMap, signature };
}
