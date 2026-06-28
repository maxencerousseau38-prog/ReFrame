/**
 * Visual DNA Merge — bridges extraction measurements to generation DNA.
 *
 * Takes the preset-based DesignDNA from compileDNA() and overrides specific
 * fields with deterministic measurements from the VisualDNA. The measured
 * value always wins when present and valid; the preset is the fallback.
 */

import type { DesignDNA, HeroDirection, CardSystem, MotionDirection, CtaDirection, GalleryDirection, SectionRhythm, ColorStrategy } from "./dna";
import type { VisualDNA } from "@/lib/extraction/types";

export function applyVisualDNA(
  base: DesignDNA,
  visual: VisualDNA | undefined
): DesignDNA {
  if (!visual) return base;

  const dna = { ...base };

  dna.heroDirection = mergeHeroDirection(base.heroDirection, visual);
  dna.rhythm = mergeRhythm(base.rhythm, visual);
  dna.typeScale = mergeTypeScale(base.typeScale, visual);
  dna.cardSystem = mergeCardSystem(base.cardSystem, visual);
  dna.motion = mergeMotion(base.motion, visual);
  dna.ctaDirection = mergeCtaDirection(base.ctaDirection, visual);
  dna.galleryDirection = mergeGalleryDirection(base.galleryDirection, visual);
  dna.colorStrategy = mergeColorStrategy(base.colorStrategy, visual);

  if (visual.layout.containerWidth) {
    dna.contentMaxWidth = `${visual.layout.containerWidth}px`;
  }

  dna.signature = `${base.signature}+vdna`;

  return dna;
}

// ---------------------------------------------------------------------------
// Sub-mergers
// ---------------------------------------------------------------------------

function mergeHeroDirection(
  base: HeroDirection,
  visual: VisualDNA
): HeroDirection {
  const hero = visual.hero;

  const styleMap: Record<string, HeroDirection["style"]> = {
    split: "split",
    fullbleed: "fullbleed",
    editorial: "editorial",
    minimal: "minimal",
    cinematic: "cinematic",
  };

  return {
    ...base,
    style: styleMap[hero.compositionType] || base.style,
    heightVh: hero.viewportOccupation > 0 ? hero.viewportOccupation : base.heightVh,
    hasParallax: visual.motion.parallaxDetected,
    hasOverlay: hero.hasOverlay,
    overlayOpacity: hero.hasOverlay ? base.overlayOpacity : 0,
    imagePosition: hero.imagePosition,
    ctaCount: hero.ctaCount > 0
      ? (Math.min(hero.ctaCount, 2) as 1 | 2)
      : base.ctaCount,
  };
}

function mergeRhythm(base: SectionRhythm, visual: VisualDNA): SectionRhythm {
  const layout = visual.layout;

  let spacingMultiplier = base.spacingMultiplier;
  if (layout.verticalSpacing) {
    if (layout.verticalSpacing >= 128) spacingMultiplier = 2;
    else if (layout.verticalSpacing >= 96) spacingMultiplier = 1.5;
    else if (layout.verticalSpacing >= 64) spacingMultiplier = 1.25;
    else spacingMultiplier = 1;
  }

  return {
    ...base,
    density: layout.spacingScale,
    spacingMultiplier,
    hasDividers: visual.component.dividerUsage,
  };
}

function mergeTypeScale(
  base: DesignDNA["typeScale"],
  visual: VisualDNA
): DesignDNA["typeScale"] {
  const typo = visual.typography;
  const result = { ...base };

  if (typo.headingWeight !== null) {
    result.headingWeight = typo.headingWeight;
  }

  if (typo.trackingTight) {
    result.tracking = "-0.025em";
  }

  return result;
}

function mergeCardSystem(base: CardSystem, visual: VisualDNA): CardSystem {
  const comp = visual.component;
  const result = { ...base };

  if (comp.cardRadius !== null) {
    result.radius = `${comp.cardRadius}px`;
  }

  // Map extracted shadow + border to card style
  const style = inferCardStyle(comp.cardShadow, comp.cardBorder, comp.cardRadius);
  if (style) result.style = style;

  // Map shadow level to shadow string
  if (comp.cardShadow === "none") result.shadow = "none";
  else if (comp.cardShadow === "subtle")
    result.shadow = "0 1px 3px rgba(0,0,0,0.08)";
  else if (comp.cardShadow === "elevated")
    result.shadow = "0 4px 16px rgba(0,0,0,0.08)";
  else if (comp.cardShadow === "dramatic")
    result.shadow = "0 8px 32px rgba(0,0,0,0.12)";

  return result;
}

function inferCardStyle(
  shadow: string,
  border: string,
  radius: number | null
): CardSystem["style"] | null {
  if (shadow === "none" && border === "none" && (radius === null || radius === 0))
    return "editorial";
  if (shadow === "none" && border !== "none") return "outlined";
  if (shadow === "elevated" || shadow === "dramatic") return "elevated";
  if (shadow === "subtle" && border === "hairline") return "glass";
  if (shadow === "none" && border === "none") return "flat";
  return null;
}

function mergeMotion(base: MotionDirection, visual: VisualDNA): MotionDirection {
  const motion = visual.motion;

  const entranceMap: Record<string, MotionDirection["entranceType"]> = {
    fade: "fade",
    "slide-up": "slide-up",
    "blur-fade": "blur-fade",
    reveal: "reveal",
    stagger: "stagger",
  };

  return {
    ...base,
    level: motion.animationIntensity,
    entranceType:
      motion.entranceAnimations[0]
        ? entranceMap[motion.entranceAnimations[0]] || base.entranceType
        : base.entranceType,
    scrollBehavior: motion.parallaxDetected
      ? "parallax"
      : motion.scrollAnimations
        ? "reveal"
        : base.scrollBehavior,
    microInteractions: motion.hoverBehavior.length > 0,
    duration: motion.transitionDuration
      ? motion.transitionDuration / 1000
      : base.duration,
  };
}

function mergeCtaDirection(
  base: CtaDirection,
  visual: VisualDNA
): CtaDirection {
  const ctaMap: Record<string, CtaDirection["style"]> = {
    pill: "pill",
    sharp: "sharp",
    ghost: "ghost",
    "text-arrow": "text-arrow",
  };

  return {
    ...base,
    style: ctaMap[visual.component.ctaStyle] || base.style,
  };
}

function mergeGalleryDirection(
  base: GalleryDirection,
  visual: VisualDNA
): GalleryDirection {
  const image = visual.image;

  const galleryMap: Record<string, GalleryDirection["style"]> = {
    grid: "grid",
    masonry: "masonry",
    strip: "strip",
    editorial: "editorial",
    single: "feature",
  };

  const aspectMap: Record<string, GalleryDirection["aspectRatio"]> = {
    landscape: "landscape",
    portrait: "portrait",
    square: "square",
    mixed: "mixed",
  };

  return {
    ...base,
    style: galleryMap[image.galleryRhythm] || base.style,
    aspectRatio: aspectMap[image.dominantAspectRatio] || base.aspectRatio,
  };
}

function mergeColorStrategy(
  base: ColorStrategy,
  visual: VisualDNA
): ColorStrategy {
  const brand = visual.brand;

  let mode = base.mode;
  if (brand.premiumScore >= 70 && brand.minimalismScore >= 50) mode = "accent-rare";
  else if (brand.modernityScore >= 70) mode = "duotone";
  else if (brand.minimalismScore >= 70) mode = "monochrome";

  return {
    ...base,
    preferDark: brand.isDark,
    mode,
  };
}
