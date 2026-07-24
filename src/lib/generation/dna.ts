/**
 * Design DNA Engine — the artistic brain of ReFrame V5.
 *
 * A DesignDNA is a rich specification object that pilots every visual decision
 * in the generation pipeline. No block is picked, no spacing set, no animation
 * chosen without the DNA dictating it first.
 *
 * The DNA is compiled from a BusinessProfile (who is the client?) and optionally
 * a Moodboard (what are the best references for this profile?). It is fully
 * deterministic when no LLM is configured, and Claude-augmented when available.
 *
 * The Composer reads the DNA and executes it. Components interpret it. The
 * Quality Gate scores against it.
 */

import type { Industry, Theme } from "./types";
import type { BusinessProfile } from "./business";

/* -------------------------------------------------------------------------- */
/*  Design DNA type                                                           */
/* -------------------------------------------------------------------------- */

export interface TypeScale {
  display: string;
  h2: string;
  h3: string;
  body: string;
  small: string;
  tracking: string;
  headingWeight: number;
}

export interface CardSystem {
  style: "glass" | "flat" | "elevated" | "outlined" | "editorial";
  radius: string;
  shadow: string;
  border: string;
  hoverEffect: "lift" | "glow" | "scale" | "border" | "none";
}

export interface HeroDirection {
  style: "split" | "fullbleed" | "editorial" | "monumental" | "cinematic" | "minimal" | "bento";
  heightVh: number;
  hasParallax: boolean;
  hasOverlay: boolean;
  overlayOpacity: number;
  ctaCount: 1 | 2;
  trustIndicators: boolean;
  imagePosition: "right" | "left" | "behind" | "below" | "none";
}

/**
 * Composition direction (V2 C7d / A4). Premium page-level composition
 * decisions consumed by the Composition Engine (`compileSceneSpecs`).
 * ALL optional and never set by presets: they arrive via the resolver layers
 * (inspirationLayer today, measured/business layers tomorrow), so their mere
 * presence means "a genuine signal exists" — the gate for premium-driven
 * composition on sites without their own scene measurements.
 */
export interface CompositionDirection {
  /** 0–100: share of the viewport the hero should occupy. */
  heroViewportOccupation?: number;
  /** Layout asymmetry appetite of the design language. */
  asymmetry?: "none" | "subtle" | "bold" | "editorial";
  /** How section blocks alternate/progress down the page. */
  sectionRhythm?: "steady" | "alternating" | "crescendo" | "editorial-pause";
}

export interface MotionDirection {
  level: 0 | 1 | 2 | 3;
  entranceType: "fade" | "slide-up" | "blur-fade" | "reveal" | "stagger";
  scrollBehavior: "none" | "parallax" | "sticky" | "reveal";
  microInteractions: boolean;
  staggerDelay: number;
  duration: number;
}

export interface CtaDirection {
  style: "pill" | "sharp" | "ghost" | "text-arrow" | "gradient";
  size: "sm" | "md" | "lg";
  hasSecondary: boolean;
  secondaryStyle: "ghost" | "text-arrow" | "outlined";
}

export interface GalleryDirection {
  style: "masonry" | "grid" | "strip" | "feature" | "editorial";
  columns: 2 | 3 | 4;
  gap: string;
  aspectRatio: "square" | "landscape" | "portrait" | "mixed";
  hasCaption: boolean;
}

export interface SectionRhythm {
  /** Spacing multiplier: 1 = 64px base, 1.5 = 96px, 2 = 128px. */
  spacingMultiplier: number;
  /** Whether sections alternate between surface / surface-2 backgrounds. */
  alternateBackgrounds: boolean;
  /** Whether accent-colored dividers appear between sections. */
  hasDividers: boolean;
  /** "tight" = minimal gaps, "generous" = lots of breathing, "editorial" = intentionally varied. */
  density: "tight" | "standard" | "generous" | "editorial";
}

export interface ColorStrategy {
  mode: "monochrome" | "accent-rare" | "duotone" | "rich";
  /** How many sections can use the accent as a background (0 = text/CTA only). */
  accentSectionLimit: number;
  /** Whether to use gradient treatments in hero/CTA. */
  useGradients: boolean;
  /** Preferred dark/light mode. */
  preferDark: boolean;
}

export interface DesignDNA {
  /** Unique signature for debugging/tracing. */
  signature: string;

  /** The chosen STYLE — business-derived, not industry-locked. Single source of
   *  truth for every downstream mood read (art direction, composer, theme). */
  mood: Theme["mood"];

  /** Global section rhythm. */
  rhythm: SectionRhythm;

  /** Typography system. */
  typeScale: TypeScale;

  /** Card rendering system (features, testimonials, services). */
  cardSystem: CardSystem;

  /** Hero composition (60% of perceived quality). */
  heroDirection: HeroDirection;

  /** Page-level composition direction (C7d) — absent unless a real signal
   *  (premium inspiration / measurement) provided it. */
  composition?: CompositionDirection;

  /** Animation system. */
  motion: MotionDirection;

  /** Call-to-action direction. */
  ctaDirection: CtaDirection;

  /** Gallery/portfolio direction (when applicable). */
  galleryDirection: GalleryDirection;

  /** Color strategy. */
  colorStrategy: ColorStrategy;

  /** Max readable content width. */
  contentMaxWidth: string;
  /** Max reading column width (for long-form prose). */
  readingColumnWidth: string;
}

/* -------------------------------------------------------------------------- */
/*  Presets: tier × mood → DNA skeleton                                       */
/* -------------------------------------------------------------------------- */

const TYPE_SCALES: Record<string, TypeScale> = {
  editorial: {
    display: "clamp(2.75rem, 6vw, 5rem)",
    h2: "clamp(1.75rem, 3.5vw, 3rem)",
    h3: "clamp(1.25rem, 2vw, 1.75rem)",
    body: "1.125rem",
    small: "0.875rem",
    tracking: "-0.025em",
    headingWeight: 510,
  },
  modern: {
    display: "clamp(2.5rem, 5vw, 4.5rem)",
    h2: "clamp(1.75rem, 3vw, 2.5rem)",
    h3: "clamp(1.125rem, 1.8vw, 1.5rem)",
    body: "1.0625rem",
    small: "0.875rem",
    tracking: "-0.022em",
    headingWeight: 590,
  },
  bold: {
    display: "clamp(3rem, 7vw, 6rem)",
    h2: "clamp(2rem, 4vw, 3.5rem)",
    h3: "clamp(1.25rem, 2vw, 1.75rem)",
    body: "1.0625rem",
    small: "0.875rem",
    tracking: "-0.03em",
    headingWeight: 600,
  },
  compact: {
    display: "clamp(2rem, 4.5vw, 3.5rem)",
    h2: "clamp(1.5rem, 2.5vw, 2rem)",
    h3: "clamp(1.125rem, 1.5vw, 1.375rem)",
    body: "1rem",
    small: "0.8125rem",
    tracking: "-0.018em",
    headingWeight: 500,
  },
};

const CARD_SYSTEMS: Record<CardSystem["style"], CardSystem> = {
  glass: {
    style: "glass",
    radius: "16px",
    shadow: "0 8px 32px rgba(0,0,0,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    hoverEffect: "glow",
  },
  flat: {
    style: "flat",
    radius: "12px",
    shadow: "none",
    border: "1px solid rgba(0,0,0,0.06)",
    hoverEffect: "border",
  },
  elevated: {
    style: "elevated",
    radius: "12px",
    shadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
    border: "none",
    hoverEffect: "lift",
  },
  outlined: {
    style: "outlined",
    radius: "8px",
    shadow: "none",
    border: "1px solid rgba(0,0,0,0.12)",
    hoverEffect: "border",
  },
  editorial: {
    style: "editorial",
    radius: "0px",
    shadow: "none",
    border: "none",
    hoverEffect: "none",
  },
};

/* -------------------------------------------------------------------------- */
/*  DNA Compiler                                                              */
/* -------------------------------------------------------------------------- */

interface CompileInput {
  profile: BusinessProfile;
  industry: Industry;
  mood: Theme["mood"];
  font: Theme["font"];
  hasImages: boolean;
  hasTestimonials: boolean;
  hasStats: boolean;
  /** True when the source site is dark-themed. */
  sourceDark: boolean;
}

/**
 * Compile a DesignDNA from a BusinessProfile + context signals.
 * Fully deterministic — same inputs always produce the same DNA.
 */
export function compileDNA(input: CompileInput): DesignDNA {
  const { profile, industry, mood, font, hasImages, sourceDark } = input;
  const tier = profile.tier;

  // --- Rhythm ---
  const rhythm = compileRhythm(tier, mood);

  // --- Type Scale ---
  const typeScale = compileTypeScale(tier, mood, font);

  // --- Card System ---
  const cardSystem = compileCardSystem(tier, mood);

  // --- Hero ---
  const heroDirection = compileHeroDirection(tier, mood, industry, hasImages);

  // --- Motion ---
  const motion = compileMotion(tier, mood, profile.modernityLevel);

  // --- CTA ---
  const ctaDirection = compileCtaDirection(tier, mood);

  // --- Gallery ---
  const galleryDirection = compileGalleryDirection(mood, industry);

  // --- Color ---
  const colorStrategy = compileColorStrategy(mood, tier, sourceDark);

  const signature = `${industry}:${tier}:${mood}:${font}`;

  return {
    signature,
    mood,
    rhythm,
    typeScale,
    cardSystem,
    heroDirection,
    motion,
    ctaDirection,
    galleryDirection,
    colorStrategy,
    contentMaxWidth: tier === "luxury" ? "1280px" : "1320px",
    readingColumnWidth: "624px",
  };
}

/* -------------------------------------------------------------------------- */
/*  Sub-compilers                                                             */
/* -------------------------------------------------------------------------- */

function compileRhythm(tier: BusinessProfile["tier"], mood: Theme["mood"]): SectionRhythm {
  if (tier === "luxury") {
    return {
      spacingMultiplier: 2,
      alternateBackgrounds: false,
      hasDividers: mood === "elegant",
      density: "editorial",
    };
  }
  if (tier === "premium") {
    return {
      spacingMultiplier: 1.5,
      alternateBackgrounds: mood !== "bold",
      hasDividers: false,
      density: "generous",
    };
  }
  if (tier === "mid") {
    return {
      spacingMultiplier: 1.25,
      alternateBackgrounds: true,
      hasDividers: false,
      density: "standard",
    };
  }
  // budget
  return {
    spacingMultiplier: 1,
    alternateBackgrounds: true,
    hasDividers: false,
    density: "tight",
  };
}

function compileTypeScale(
  tier: BusinessProfile["tier"],
  mood: Theme["mood"],
  font: Theme["font"]
): TypeScale {
  const isSerif = font === "serif";

  if (tier === "luxury" || (tier === "premium" && mood === "elegant")) {
    const base = { ...TYPE_SCALES.editorial };
    if (isSerif) base.headingWeight = 400;
    return base;
  }

  if (mood === "bold") {
    return { ...TYPE_SCALES.bold };
  }

  if (tier === "budget") {
    return { ...TYPE_SCALES.compact };
  }

  const base = { ...TYPE_SCALES.modern };
  if (isSerif) base.headingWeight = 500;
  return base;
}

function compileCardSystem(tier: BusinessProfile["tier"], mood: Theme["mood"]): CardSystem {
  if (tier === "luxury") {
    return mood === "elegant"
      ? { ...CARD_SYSTEMS.editorial }
      : { ...CARD_SYSTEMS.glass };
  }

  if (mood === "bold") return { ...CARD_SYSTEMS.glass };
  if (mood === "warm" || mood === "elegant") return { ...CARD_SYSTEMS.elevated };
  if (tier === "budget") return { ...CARD_SYSTEMS.outlined };

  return { ...CARD_SYSTEMS.flat };
}

function compileHeroDirection(
  tier: BusinessProfile["tier"],
  mood: Theme["mood"],
  industry: Industry,
  hasImages: boolean
): HeroDirection {
  // Industries with a strong visual identity → fullbleed or editorial
  const visualIndustries: Industry[] = [
    "restaurant", "hotel", "architect", "fashion", "automotive", "realestate",
  ];
  const isVisual = visualIndustries.includes(industry);

  // Luxury tier: always dramatic
  if (tier === "luxury") {
    if (isVisual && hasImages) {
      return {
        style: mood === "elegant" ? "editorial" : "monumental",
        heightVh: 100,
        hasParallax: true,
        hasOverlay: true,
        overlayOpacity: 0.4,
        ctaCount: 2,
        trustIndicators: true,
        imagePosition: "behind",
      };
    }
    return {
      style: "cinematic",
      heightVh: 100,
      hasParallax: false,
      hasOverlay: false,
      overlayOpacity: 0,
      ctaCount: 2,
      trustIndicators: true,
      imagePosition: hasImages ? "right" : "none",
    };
  }

  // Premium tier
  if (tier === "premium") {
    if (isVisual && hasImages) {
      return {
        style: mood === "bold" ? "monumental" : "fullbleed",
        heightVh: 90,
        hasParallax: mood === "elegant",
        hasOverlay: true,
        overlayOpacity: 0.35,
        ctaCount: 2,
        trustIndicators: true,
        imagePosition: "behind",
      };
    }
    if (industry === "saas" || industry === "agency") {
      return {
        style: industry === "saas" ? "bento" : "cinematic",
        heightVh: 90,
        hasParallax: false,
        hasOverlay: false,
        overlayOpacity: 0,
        ctaCount: 2,
        trustIndicators: true,
        imagePosition: hasImages ? "right" : "none",
      };
    }
    return {
      style: "split",
      heightVh: 85,
      hasParallax: false,
      hasOverlay: false,
      overlayOpacity: 0,
      ctaCount: 2,
      trustIndicators: true,
      imagePosition: hasImages ? "right" : "none",
    };
  }

  // Mid tier
  if (tier === "mid") {
    return {
      style: hasImages && isVisual ? "fullbleed" : "split",
      heightVh: 80,
      hasParallax: false,
      hasOverlay: hasImages && isVisual,
      overlayOpacity: 0.3,
      ctaCount: 1,
      trustIndicators: false,
      imagePosition: hasImages ? (isVisual ? "behind" : "right") : "none",
    };
  }

  // Budget
  return {
    style: "minimal",
    heightVh: 70,
    hasParallax: false,
    hasOverlay: false,
    overlayOpacity: 0,
    ctaCount: 1,
    trustIndicators: false,
    imagePosition: hasImages ? "right" : "none",
  };
}

function compileMotion(
  tier: BusinessProfile["tier"],
  mood: Theme["mood"],
  modernity: BusinessProfile["modernityLevel"]
): MotionDirection {
  if (tier === "luxury") {
    return {
      level: 3,
      entranceType: mood === "elegant" ? "reveal" : "blur-fade",
      scrollBehavior: "parallax",
      microInteractions: true,
      staggerDelay: 0.08,
      duration: 0.5,
    };
  }
  if (tier === "premium") {
    return {
      level: mood === "bold" ? 3 : 2,
      entranceType: mood === "bold" ? "stagger" : "blur-fade",
      scrollBehavior: mood === "elegant" ? "parallax" : "reveal",
      microInteractions: true,
      staggerDelay: 0.06,
      duration: 0.4,
    };
  }
  if (tier === "mid") {
    return {
      level: modernity === "cutting-edge" ? 2 : 1,
      entranceType: "slide-up",
      scrollBehavior: "none",
      microInteractions: false,
      staggerDelay: 0.05,
      duration: 0.3,
    };
  }
  // budget
  return {
    level: 1,
    entranceType: "fade",
    scrollBehavior: "none",
    microInteractions: false,
    staggerDelay: 0.04,
    duration: 0.2,
  };
}

function compileCtaDirection(
  tier: BusinessProfile["tier"],
  mood: Theme["mood"]
): CtaDirection {
  if (tier === "luxury") {
    return {
      style: mood === "elegant" ? "ghost" : "text-arrow",
      size: "lg",
      hasSecondary: true,
      secondaryStyle: "text-arrow",
    };
  }
  if (mood === "bold") {
    return {
      style: "pill",
      size: "lg",
      hasSecondary: true,
      secondaryStyle: "ghost",
    };
  }
  if (mood === "elegant" || mood === "warm") {
    return {
      style: "ghost",
      size: "md",
      hasSecondary: true,
      secondaryStyle: "text-arrow",
    };
  }
  // minimal / budget
  return {
    style: "pill",
    size: "md",
    hasSecondary: tier !== "budget",
    secondaryStyle: "outlined",
  };
}

function compileGalleryDirection(mood: Theme["mood"], industry: Industry): GalleryDirection {
  const editorialIndustries: Industry[] = [
    "architect", "fashion", "hotel", "restaurant",
  ];

  if (editorialIndustries.includes(industry)) {
    return {
      style: mood === "bold" ? "masonry" : "editorial",
      columns: 2,
      gap: "1rem",
      aspectRatio: "mixed",
      hasCaption: true,
    };
  }
  if (industry === "ecommerce") {
    return {
      style: "grid",
      columns: 4,
      gap: "0.5rem",
      aspectRatio: "square",
      hasCaption: false,
    };
  }
  if (industry === "agency") {
    return {
      style: "masonry",
      columns: 3,
      gap: "0.75rem",
      aspectRatio: "mixed",
      hasCaption: true,
    };
  }
  // General
  return {
    style: "grid",
    columns: 3,
    gap: "1rem",
    aspectRatio: "landscape",
    hasCaption: mood === "elegant" || mood === "warm",
  };
}

function compileColorStrategy(
  mood: Theme["mood"],
  tier: BusinessProfile["tier"],
  sourceDark: boolean
): ColorStrategy {
  const preferDark = sourceDark || mood === "bold";

  if (tier === "luxury") {
    return {
      mode: "accent-rare",
      accentSectionLimit: 1,
      useGradients: mood === "bold",
      preferDark,
    };
  }
  if (mood === "bold") {
    return {
      mode: "duotone",
      accentSectionLimit: 2,
      useGradients: true,
      preferDark: true,
    };
  }
  if (mood === "warm" || mood === "elegant") {
    return {
      mode: "accent-rare",
      accentSectionLimit: 1,
      useGradients: false,
      preferDark,
    };
  }
  // minimal
  return {
    mode: "monochrome",
    accentSectionLimit: 1,
    useGradients: false,
    preferDark,
  };
}
