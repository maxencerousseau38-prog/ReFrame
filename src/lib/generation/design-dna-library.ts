/**
 * Design Intelligence — Design DNA Library.
 *
 * This is NOT a style catalogue and it copies NO interface. Each entry distils
 * the *mechanisms* that make a class of premium design system work — the reasons
 * a Nike page reads as ambition or an Aesop page reads as restraint — and maps
 * them onto ReFrame's own exploitable vocabulary (mood, hero philosophy,
 * narrative, contrast, motion, image rhythm) so the Art Director can reason with
 * them, not merely quote them.
 *
 * The intelligence is in the *selection*: `selectDesignDNA` reads the business
 * (sector, tier, audience, positioning, derived style) and chooses the DNA whose
 * mechanisms fit — and, just as importantly, refuses the ones a business must
 * never wear (a law firm is not a sportswear brand). "Never apply Nike
 * everywhere" is enforced here, in `avoid_business_types` + `forbidden_usage`.
 */

import type { Industry, Theme } from "./types";
import type { ArtDirection } from "./art-direction";
import type { BusinessProfile } from "./business";
import type { SiteAnalysis } from "./types";
import type { BrandPersonality } from "./brand-personality";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type DnaCategory =
  | "performance"
  | "product-innovation"
  | "technical-editorial"
  | "human-warmth"
  | "luxury-editorial"
  | "bold-fintech"
  | "craft-provenance"
  | "calm-minimal";

/**
 * The machine-exploitable core of a DNA — every field is an existing
 * ArtDirection axis, so the Art Director can bias its own decisions with it.
 */
export interface DnaMechanisms {
  mood: Theme["mood"];
  heroPhilosophy: ArtDirection["heroPhilosophy"];
  narrative: ArtDirection["pageStorytelling"];
  contrast: ArtDirection["contrastStrategy"];
  motion: ArtDirection["motionPhilosophy"];
  imageRhythm: ArtDirection["imageRhythm"];
  /** Breathing room → biases whitespace / luxury level. */
  density: "airy" | "balanced" | "dense";
  /** Type scale drama → biases typography rhythm. */
  typeContrast: "high" | "medium" | "uniform";
}

export interface DesignDNAProfile {
  name: string;
  category: DnaCategory;
  /** Prose — what makes this system feel the way it does. */
  visual_identity: string;
  layout_patterns: string[];
  typography_rules: string;
  spacing_rules: string;
  image_rules: string;
  animation_rules: string;
  component_behavior: string;
  emotional_goal: string;
  /** The named narrative arc a visitor walks through. */
  creative_direction: string;
  ideal_business_types: Industry[];
  /** Machine-checkable refusal — the engine never dresses these in this DNA. */
  avoid_business_types: Industry[];
  /** Human rationale for the refusal (kept prose, per the brief). */
  forbidden_usage: string[];
  mechanisms: DnaMechanisms;
}

/* -------------------------------------------------------------------------- */
/*  The library — mechanisms distilled, never interfaces copied               */
/* -------------------------------------------------------------------------- */

export const DESIGN_DNA_LIBRARY: DesignDNAProfile[] = [
  {
    name: "Performance",
    category: "performance",
    visual_identity:
      "A single dominant image carries the whole frame; the claim is short and physical; the type is loud enough to feel like a shout. Energy comes from contrast and scale, not decoration.",
    layout_patterns: ["full-bleed image hero", "one idea per screen", "edge-to-edge media", "minimal chrome"],
    typography_rules: "Oversized condensed display, few words, tight leading; body text is almost absent.",
    spacing_rules: "Cinematic — big empty margins around a big image so the subject dominates.",
    image_rules: "One hero image, high contrast, motion implied; people in action, never static product shots.",
    animation_rules: "Subtle momentum — slow parallax and confident reveals, never bouncy.",
    component_behavior: "Components recede; the image and the verb lead. Cards are rare and quiet.",
    emotional_goal: "ambition, drive, transcendence",
    creative_direction: "Kinetic Statement: image → claim → proof of performance → conversion",
    ideal_business_types: ["gym", "automotive", "coach", "ecommerce"],
    avoid_business_types: ["lawyer", "medical", "finance"],
    forbidden_usage: [
      "Regulated / trust-first brands (law, medical, finance) — aggression reads as unserious.",
      "Delicate hospitality where warmth, not intensity, is the point.",
    ],
    mechanisms: {
      mood: "bold",
      heroPhilosophy: "immersive",
      narrative: "manifesto",
      contrast: "dark-anchor",
      motion: "cinematic",
      imageRhythm: "hero-only",
      density: "airy",
      typeContrast: "high",
    },
  },
  {
    name: "Product Innovation",
    category: "product-innovation",
    visual_identity:
      "The product is the hero; a calm dark canvas makes the interface glow; every pixel feels engineered. Confidence through precision, not noise.",
    layout_patterns: ["product-first split hero", "feature bento", "precise grids", "dark canvas with a single glow"],
    typography_rules: "Neutral grotesque, medium weights, negative tracking on display; hierarchy by grey, not colour.",
    spacing_rules: "Balanced and exact — tight, rhythmic, engineered gaps.",
    image_rules: "The product UI itself, framed with restraint; never stock lifestyle.",
    animation_rules: "Purposeful and quick — one curve, no bounce; motion clarifies, never entertains.",
    component_behavior: "Components are the show — crisp cards, exact borders, tasteful depth.",
    emotional_goal: "precision, trust, modernity",
    creative_direction: "Product Innovation: vision → problem → solution → demonstration → features → CTA",
    ideal_business_types: ["saas", "finance", "agency"],
    avoid_business_types: ["restaurant", "hotel", "gym"],
    forbidden_usage: [
      "Warmth-led hospitality — a dark engineered canvas kills the invitation.",
      "Craft/artisan brands whose value is the human hand, not the machine.",
    ],
    mechanisms: {
      mood: "minimal",
      heroPhilosophy: "product-first",
      narrative: "problem-solution",
      contrast: "dark-anchor",
      motion: "purposeful",
      imageRhythm: "section-paired",
      density: "balanced",
      typeContrast: "medium",
    },
  },
  {
    name: "Technical Editorial",
    category: "technical-editorial",
    visual_identity:
      "Documentation-grade clarity dressed with one confident gradient. Light canvas, generous columns, a sense that complex things are being made simple.",
    layout_patterns: ["centered editorial hero", "column features", "gradient accents on light", "structured grids"],
    typography_rules: "Clean sans, strong size contrast between lead and body, comfortable measure.",
    spacing_rules: "Generous, orderly — reading rhythm over drama.",
    image_rules: "Diagrams, abstract gradients and product frames over people; explanatory, not emotional.",
    animation_rules: "Purposeful — gentle fades and reveals that respect reading.",
    component_behavior: "Cards explain; contrast between a light surface and one gradient anchor carries the eye.",
    emotional_goal: "clarity, competence, calm confidence",
    creative_direction: "Clarity Ladder: promise → how it works → proof → depth → CTA",
    ideal_business_types: ["saas", "finance", "agency", "medical"],
    avoid_business_types: ["restaurant", "fashion", "gym"],
    forbidden_usage: [
      "Emotion-led brands where reading rhythm reads as cold.",
      "Image-first hospitality / fashion where clarity is not the promise.",
    ],
    mechanisms: {
      mood: "minimal",
      heroPhilosophy: "editorial",
      narrative: "problem-solution",
      contrast: "gradient-flow",
      motion: "purposeful",
      imageRhythm: "section-paired",
      density: "balanced",
      typeContrast: "high",
    },
  },
  {
    name: "Human Warmth",
    category: "human-warmth",
    visual_identity:
      "People and places over product; rounded, welcoming, sunlit. The page feels like an invitation from someone who wants you to feel at home.",
    layout_patterns: ["alternating image/text journey", "rounded cards", "warm full-width photos", "soft sections"],
    typography_rules: "Friendly humanist sans, comfortable body, warm not loud display.",
    spacing_rules: "Balanced and soft — nothing crowded, nothing austere.",
    image_rules: "Real people, real places, natural light; alternating imagery keeps a human pulse.",
    animation_rules: "Restrained and gentle — soft fades, nothing that shows off.",
    component_behavior: "Rounded cards and soft dividers; the imagery leads, components support.",
    emotional_goal: "belonging, warmth, trust",
    creative_direction: "Human Storytelling: person → story → process → outcomes → trust",
    ideal_business_types: ["hotel", "restaurant", "health", "coach", "realestate"],
    avoid_business_types: ["finance", "saas"],
    forbidden_usage: [
      "Precision-led tech / fintech where warmth reads as unserious.",
      "Bold performance brands where softness kills the drive.",
    ],
    mechanisms: {
      mood: "warm",
      heroPhilosophy: "atmospheric",
      narrative: "journey",
      contrast: "alternating",
      motion: "restrained",
      imageRhythm: "alternating",
      density: "balanced",
      typeContrast: "medium",
    },
  },
  {
    name: "Luxury Editorial",
    category: "luxury-editorial",
    visual_identity:
      "Restraint as luxury. Vast whitespace, monochrome discipline, one exquisite image at a time, type that whispers. Nothing hurries; everything is considered.",
    layout_patterns: ["monumental editorial hero", "asymmetric magazine grid", "one image per breath", "wide margins"],
    typography_rules: "High-contrast serif or refined display; small, precise labels; sentence case.",
    spacing_rules: "Airy — editorial pauses, generous vertical silence between movements.",
    image_rules: "Few, flawless, cinematic; monochrome grading; the image is the object of desire.",
    animation_rules: "Slow reveal — long, calm transitions; motion as poise, never spectacle.",
    component_behavior: "Components almost disappear; the composition and the image carry prestige.",
    emotional_goal: "prestige, desire, timelessness",
    creative_direction: "Luxury Editorial: cinema → story → savoir-faire → gallery → proof → conversion",
    ideal_business_types: ["fashion", "architect", "hotel", "restaurant"],
    avoid_business_types: ["plumber", "electrician", "saas"],
    forbidden_usage: [
      "Budget / utility trades where restraint reads as empty.",
      "Feature-dense software where whitespace hides the value.",
    ],
    mechanisms: {
      mood: "elegant",
      heroPhilosophy: "editorial",
      narrative: "editorial",
      contrast: "monochrome",
      motion: "cinematic",
      imageRhythm: "gallery-burst",
      density: "airy",
      typeContrast: "high",
    },
  },
  {
    name: "Bold Fintech",
    category: "bold-fintech",
    visual_identity:
      "Confident, saturated, kinetic. A statement wordmark, vivid gradients on near-black, motion that signals momentum. The brand as a challenger.",
    layout_patterns: ["statement wordmark hero", "vivid gradient panels", "bold number callouts", "dark base"],
    typography_rules: "Large tight sans, heavy display moments, punchy short lines.",
    spacing_rules: "Balanced with bold anchors — dark sections that punctuate.",
    image_rules: "Abstract gradient art and product frames; bold, not soft.",
    animation_rules: "Kinetic but controlled — energetic reveals, momentum on scroll.",
    component_behavior: "Cards are vivid and confident; gradient anchors drive the rhythm.",
    emotional_goal: "confidence, momentum, challenger energy",
    creative_direction: "Challenger: bold claim → why now → capability → proof → CTA",
    ideal_business_types: ["finance", "saas", "ecommerce", "agency"],
    avoid_business_types: ["lawyer", "medical", "architect"],
    forbidden_usage: [
      "Heritage / trust professions where loudness reads as reckless.",
      "Quiet luxury where saturation cheapens the brand.",
    ],
    mechanisms: {
      mood: "bold",
      heroPhilosophy: "statement",
      narrative: "manifesto",
      contrast: "gradient-flow",
      motion: "cinematic",
      imageRhythm: "section-paired",
      density: "balanced",
      typeContrast: "high",
    },
  },
  {
    name: "Craft Provenance",
    category: "craft-provenance",
    visual_identity:
      "The value is the human hand and the origin story. Textured warmth, paired imagery of maker and made, type with character. Heritage without nostalgia kitsch.",
    layout_patterns: ["image-paired story sections", "process timeline", "warm textured surfaces", "provenance detail shots"],
    typography_rules: "Characterful serif or humanist display for headings, honest body.",
    spacing_rules: "Balanced with room for detail shots to breathe.",
    image_rules: "Maker + material + place; section-paired imagery that documents craft.",
    animation_rules: "Restrained — quiet reveals that respect the subject.",
    component_behavior: "Cards frame process steps; imagery and story alternate to build trust.",
    emotional_goal: "authenticity, heritage, care",
    creative_direction: "Provenance: origin → craft → the work → the people → trust",
    ideal_business_types: ["restaurant", "construction", "realestate", "architect"],
    avoid_business_types: ["saas", "finance"],
    forbidden_usage: [
      "Abstract software where there is no physical craft to document.",
      "Fast-conversion funnels where the slow story loses the lead.",
    ],
    mechanisms: {
      mood: "warm",
      heroPhilosophy: "editorial",
      narrative: "journey",
      contrast: "alternating",
      motion: "restrained",
      imageRhythm: "section-paired",
      density: "balanced",
      typeContrast: "medium",
    },
  },
  {
    name: "Calm Minimal",
    category: "calm-minimal",
    visual_identity:
      "Quiet competence. Light, uncluttered, almost clinical calm; a lot of white, a little ink, no drama. Reassurance through order.",
    layout_patterns: ["centered light hero", "sparse grids", "light-dominant sections", "hairline structure"],
    typography_rules: "Neutral sans, restrained sizes, generous measure; hierarchy by weight and grey.",
    spacing_rules: "Airy and orderly — calm vertical rhythm.",
    image_rules: "Minimal imagery, soft and light; presence over spectacle.",
    animation_rules: "Near-none — the calm is the point; only essential motion.",
    component_behavior: "Quiet cards, hairline dividers; nothing competes for attention.",
    emotional_goal: "calm, reassurance, competence",
    creative_direction: "Reassurance: promise → how we help → proof → gentle CTA",
    ideal_business_types: ["medical", "health", "lawyer", "coach"],
    avoid_business_types: ["gym", "ecommerce"],
    forbidden_usage: [
      "High-energy retail / fitness where calm reads as flat.",
      "Brands whose whole promise is excitement.",
    ],
    mechanisms: {
      mood: "minimal",
      heroPhilosophy: "editorial",
      narrative: "problem-solution",
      contrast: "light-dominant",
      motion: "restrained",
      imageRhythm: "minimal",
      density: "airy",
      typeContrast: "medium",
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  Selection — the intelligence                                              */
/* -------------------------------------------------------------------------- */

export interface DesignDNASelection {
  dna: DesignDNAProfile;
  /** Why this DNA won — a short, human-readable rationale (for diagnostics). */
  rationale: string;
  /** Runners-up considered but not chosen (name + score), for tracing. */
  considered: { name: string; score: number }[];
}

/** Cheap deterministic hash so ties break per-brand, not globally. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0xffffffff;
}

/** How close two moods are (0..1) — a soft affinity, not a hard equality. */
function moodAffinity(a: Theme["mood"], b: Theme["mood"]): number {
  if (a === b) return 1;
  const near: Record<Theme["mood"], Theme["mood"][]> = {
    warm: ["elegant"],
    elegant: ["warm", "minimal"],
    minimal: ["elegant"],
    bold: [],
  };
  return near[a]?.includes(b) ? 0.5 : 0;
}

/**
 * Choose the Design DNA whose mechanisms fit this business — and never one it
 * forbids. Deterministic: same business → same DNA, different businesses → the
 * DNA that actually suits them.
 */
/**
 * How well a DNA category fits a brand's temperament (0..3). This is what makes
 * two same-mood restaurants pick different grammars: a serene, sophisticated one
 * leans Luxury Editorial / Calm Minimal, an energetic bold one leans Performance
 * / Bold Fintech — from the SAME sector and mood.
 */
function personalityCategoryFit(category: DnaCategory, p: BrandPersonality): number {
  const s = p.sophistication, e = p.energy, b = p.boldness, w = p.warmth, calm = 100 - e;
  const norm = (n: number) => Math.max(0, n) / 100 * 3;
  switch (category) {
    case "luxury-editorial": return norm(s * 0.6 + calm * 0.4 - e * 0.2);
    case "calm-minimal": return norm(calm * 0.6 + s * 0.3 - b * 0.2);
    case "performance": return norm(e * 0.5 + b * 0.5 - s * 0.2);
    case "bold-fintech": return norm(b * 0.5 + e * 0.4);
    case "human-warmth": return norm(w * 0.7 - b * 0.2);
    case "craft-provenance": return norm(w * 0.4 + s * 0.3 + calm * 0.2);
    case "product-innovation": return norm(s * 0.35 + e * 0.3 + (100 - w) * 0.2);
    case "technical-editorial": return norm(s * 0.35 + calm * 0.25 + (100 - w) * 0.2);
    default: return 0;
  }
}

export function selectDesignDNA(
  analysis: SiteAnalysis,
  profile: BusinessProfile,
  mood: Theme["mood"],
  personality?: BrandPersonality,
): DesignDNASelection {
  const industry = analysis.industry;
  const scored = DESIGN_DNA_LIBRARY.map((dna) => {
    // Hard refusal: a business in a DNA's avoid list can never wear it.
    if (dna.avoid_business_types.includes(industry)) {
      return { dna, score: -Infinity };
    }
    let score = 0;
    // Sector fit is the strongest signal.
    if (dna.ideal_business_types.includes(industry)) score += 5;
    // Style fit: the DNA should agree with the business-derived mood.
    score += moodAffinity(dna.mechanisms.mood, mood) * 4;
    // Temperament fit: the brand's personality is a strong grammar signal — this
    // is what separates two same-sector, same-mood brands.
    if (personality) score += personalityCategoryFit(dna.category, personality);
    // Tier fit: luxury lifts editorial/craft, budget lifts warmth/calm.
    if (profile.tier === "luxury" && (dna.category === "luxury-editorial" || dna.category === "craft-provenance")) score += 2;
    if (profile.tier === "premium" && (dna.category === "product-innovation" || dna.category === "technical-editorial")) score += 1;
    if (profile.tier === "budget" && (dna.category === "human-warmth" || dna.category === "calm-minimal")) score += 1;
    // Audience fit: B2B leans technical/product, B2C leans human/warmth.
    if (profile.audience?.type === "b2b" && (dna.category === "product-innovation" || dna.category === "technical-editorial" || dna.category === "bold-fintech")) score += 1.5;
    if (profile.audience?.type === "b2c" && (dna.category === "human-warmth" || dna.category === "luxury-editorial" || dna.category === "performance")) score += 1.5;
    // Per-brand tiebreak so two same-profile brands can still diverge.
    score += hash(`${analysis.brandName}|${analysis.url}|${dna.name}`) * 0.9;
    return { dna, score };
  }).sort((a, b) => b.score - a.score);

  const winner = scored[0];
  const rationale =
    winner.score === -Infinity
      ? `No ideal DNA; defaulting to ${winner.dna.name}`
      : `${winner.dna.name} — ${winner.dna.emotional_goal}; fits ${industry} (${profile.tier}/${profile.audience?.type ?? "mixed"}), style ${mood}`;

  return {
    dna: winner.dna,
    rationale,
    considered: scored.slice(0, 4).map((s) => ({ name: s.dna.name, score: Math.round(s.score * 10) / 10 })),
  };
}
