/**
 * V2 RESOLVE — candidate layer producers.
 *
 * The old pipeline merged VisualDNA measurements into the DNA
 * (visual-dna-merge.ts) and then let the moodboard OVERWRITE them wholesale
 * (references.ts#applyMoodboard) — root cause #2 of the V5 audit. Both merge
 * functions are replaced by these producers: each now emits a PARTIAL
 * candidate tree, and dna/resolver.ts is the only place values meet.
 * Measured beats curated by rank, leaf by leaf, whatever the call order.
 *
 * Field mappings are a faithful port of visual-dna-merge.ts (deleted with
 * this change): a field is offered ONLY when the measurement carries it —
 * absent measurements are `undefined`, never a guessed default.
 */

import type { VisualDNA } from "@/lib/extraction/types";
import type { CardSystem, CtaDirection, DesignDNA, GalleryDirection, HeroDirection, MotionDirection } from "@/lib/generation/dna";
import type { Moodboard } from "@/lib/generation/references";
import type { CandidateLayer } from "./resolver";

export type DeepPartial<T> = T extends object
  ? T extends readonly unknown[]
    ? T
    : { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

/** Uniform confidence of the current VisualDNA extractor (per-field
 *  confidence lands with SourceDNA in Chantier 4). Above the 0.4 demotion
 *  threshold: today's measurements, when present, are trusted. */
const VISUAL_DNA_CONFIDENCE = 0.9;

/* -------------------------------------------------------------------------- */
/*  Measured layer — from VisualDNA                                           */
/* -------------------------------------------------------------------------- */

const HERO_STYLE_MAP: Record<string, HeroDirection["style"]> = {
  split: "split",
  fullbleed: "fullbleed",
  editorial: "editorial",
  minimal: "minimal",
  cinematic: "cinematic",
};

const ENTRANCE_MAP: Record<string, MotionDirection["entranceType"]> = {
  fade: "fade",
  "slide-up": "slide-up",
  "blur-fade": "blur-fade",
  reveal: "reveal",
  stagger: "stagger",
};

const CTA_MAP: Record<string, CtaDirection["style"]> = {
  pill: "pill",
  sharp: "sharp",
  ghost: "ghost",
  "text-arrow": "text-arrow",
};

const GALLERY_MAP: Record<string, GalleryDirection["style"]> = {
  grid: "grid",
  masonry: "masonry",
  strip: "strip",
  editorial: "editorial",
  single: "feature",
};

const ASPECT_MAP: Record<string, GalleryDirection["aspectRatio"]> = {
  landscape: "landscape",
  portrait: "portrait",
  square: "square",
  mixed: "mixed",
};

const CARD_SHADOW_MAP: Record<string, string> = {
  none: "none",
  subtle: "0 1px 3px rgba(0,0,0,0.08)",
  elevated: "0 4px 16px rgba(0,0,0,0.08)",
  dramatic: "0 8px 32px rgba(0,0,0,0.12)",
};

function inferCardStyle(
  shadow: string,
  border: string,
  radius: number | null
): CardSystem["style"] | undefined {
  if (shadow === "none" && border === "none" && (radius === null || radius === 0))
    return "editorial";
  if (shadow === "none" && border !== "none") return "outlined";
  if (shadow === "elevated" || shadow === "dramatic") return "elevated";
  if (shadow === "subtle" && border === "hairline") return "glass";
  if (shadow === "none" && border === "none") return "flat";
  return undefined;
}

function spacingMultiplierFrom(verticalSpacing: number | null): number | undefined {
  if (!verticalSpacing) return undefined;
  if (verticalSpacing >= 128) return 2;
  if (verticalSpacing >= 96) return 1.5;
  if (verticalSpacing >= 64) return 1.25;
  return 1;
}

function colorModeFrom(brand: VisualDNA["brand"]): DesignDNA["colorStrategy"]["mode"] | undefined {
  if (brand.premiumScore >= 70 && brand.minimalismScore >= 50) return "accent-rare";
  if (brand.modernityScore >= 70) return "duotone";
  if (brand.minimalismScore >= 70) return "monochrome";
  return undefined;
}

/** Partial DNA tree carrying ONLY what the VisualDNA actually measured. */
export function visualDnaPartial(visual: VisualDNA): DeepPartial<DesignDNA> {
  const { hero, layout, typography, component, motion, image, brand } = visual;

  return {
    heroDirection: {
      style: HERO_STYLE_MAP[hero.compositionType],
      heightVh: hero.viewportOccupation > 0 ? hero.viewportOccupation : undefined,
      hasParallax: motion.parallaxDetected,
      hasOverlay: hero.hasOverlay,
      // Old semantics preserved: an overlay measured "absent" pins opacity to
      // 0; a present overlay does not measure its opacity (arrives in C6).
      overlayOpacity: hero.hasOverlay ? undefined : 0,
      imagePosition: hero.imagePosition,
      ctaCount: hero.ctaCount > 0 ? (Math.min(hero.ctaCount, 2) as 1 | 2) : undefined,
    },
    rhythm: {
      density: layout.spacingScale,
      spacingMultiplier: spacingMultiplierFrom(layout.verticalSpacing),
      hasDividers: component.dividerUsage,
    },
    typeScale: {
      headingWeight: typography.headingWeight ?? undefined,
      tracking: typography.trackingTight ? "-0.025em" : undefined,
    },
    cardSystem: {
      radius: component.cardRadius !== null ? `${component.cardRadius}px` : undefined,
      style: inferCardStyle(component.cardShadow, component.cardBorder, component.cardRadius),
      shadow: CARD_SHADOW_MAP[component.cardShadow],
    },
    motion: {
      level: motion.animationIntensity,
      entranceType: motion.entranceAnimations[0]
        ? ENTRANCE_MAP[motion.entranceAnimations[0]]
        : undefined,
      scrollBehavior: motion.parallaxDetected
        ? "parallax"
        : motion.scrollAnimations
          ? "reveal"
          : undefined,
      microInteractions: motion.hoverBehavior.length > 0,
      duration: motion.transitionDuration ? motion.transitionDuration / 1000 : undefined,
    },
    ctaDirection: {
      style: CTA_MAP[component.ctaStyle],
    },
    galleryDirection: {
      style: GALLERY_MAP[image.galleryRhythm],
      aspectRatio: ASPECT_MAP[image.dominantAspectRatio],
    },
    colorStrategy: {
      preferDark: brand.isDark,
      mode: colorModeFrom(brand),
    },
    contentMaxWidth: layout.containerWidth ? `${layout.containerWidth}px` : undefined,
  };
}

/* -------------------------------------------------------------------------- */
/*  Layers                                                                    */
/* -------------------------------------------------------------------------- */

export function measuredLayer(visual: VisualDNA | undefined): CandidateLayer | undefined {
  if (!visual) return undefined;
  return {
    data: visualDnaPartial(visual),
    source: "measured",
    origin: "extraction/visual-dna.ts via dna/candidates.ts#visualDnaPartial",
    confidence: VISUAL_DNA_CONFIDENCE,
  };
}

/* -------------------------------------------------------------------------- */
/*  Measured tokens layer — from MeasuredTokens (V2 Chantier 4)               */
/* -------------------------------------------------------------------------- */

import type { MeasuredTokens, MeasuredValue } from "@/lib/measure/tokens";

/**
 * Maps real token measurements onto the DesignDNA fields able to express them
 * today (palette/exact fonts land at render with the C5 token compiler and
 * stay on analysis.measuredTokens until then). Each field carries ITS OWN
 * measured confidence and method-precise origin — the resolver's demotion
 * rule (A2) now operates per field instead of per layer.
 */
export function tokensLayer(tokens: MeasuredTokens | undefined): CandidateLayer | undefined {
  if (!tokens) return undefined;

  const data: DeepPartial<DesignDNA> = {};
  const fieldConfidence: Record<string, number> = {};
  const fieldOrigin: Record<string, string> = {};

  const put = <T>(path: string, mv: MeasuredValue<T> | undefined, map: (v: T) => unknown = (v) => v) => {
    if (mv === undefined) return;
    const mapped = map(mv.value);
    if (mapped === undefined) return; // unmappable measurement → not offered
    const segs = path.split(".");
    let cur = data as Record<string, unknown>;
    for (let i = 0; i < segs.length - 1; i++) {
      cur[segs[i]] = cur[segs[i]] ?? {};
      cur = cur[segs[i]] as Record<string, unknown>;
    }
    cur[segs[segs.length - 1]] = mapped;
    fieldConfidence[path] = mv.confidence;
    fieldOrigin[path] = mv.origin;
  };

  put("typeScale.display", tokens.typography.displayClamp);
  put("typeScale.headingWeight", tokens.typography.headingWeight);
  put("typeScale.tracking", tokens.typography.tracking);
  put("cardSystem.radius", tokens.surfaces.cardRadius, (v) => `${v}px`);
  put("cardSystem.shadow", tokens.surfaces.cardShadow);
  put("ctaDirection.style", tokens.surfaces.buttonRadius, (v) =>
    v >= 999 ? "pill" : v === 0 ? "sharp" : undefined);
  put("rhythm.spacingMultiplier", tokens.spacing.spacingMultiplier);
  put("contentMaxWidth", tokens.spacing.containerWidth, (v) => `${v}px`);
  put("colorStrategy.preferDark", tokens.prefersDark);

  if (Object.keys(fieldConfidence).length === 0) return undefined;

  return {
    data,
    source: "measured",
    origin: "measure/tokens.ts via dna/candidates.ts#tokensLayer",
    fieldConfidence,
    fieldOrigin,
  };
}

export function curatedLayer(moodboard: Moodboard): CandidateLayer | undefined {
  const overrides = moodboard.dnaOverrides;
  if (!overrides || Object.keys(overrides).length === 0) return undefined;
  const refId = moodboard.topReferences[0]?.ref.id ?? "none";
  return {
    data: overrides,
    source: "curated",
    origin: `references.ts#computeDnaOverrides (top: ${refId})`,
  };
}
