/**
 * Brand Personality Engine — ReFrame's sense of WHO a brand is.
 *
 * Sits at the very front of the production path:
 *   runPipeline → deriveBrandPersonality → selectDesignDNA → artDirect → compose
 *
 * A Design DNA gives a brand a grammar (Luxury Editorial, Performance…). But two
 * gastronomic restaurants can share that grammar and still be opposite worlds:
 * one serene, ceremonial, breathing; the other raw, industrial, fast. That
 * difference is TEMPERAMENT, and it must be felt before a single word is read.
 *
 * This engine reads the business — content, sector, tier, audience, positioning
 * — and produces a personality: five numeric levers (boldness, energy,
 * sophistication, warmth, playfulness) plus descriptors, and, crucially, a set
 * of art-direction LEVERS that flow downstream to steer rhythm, motion, spacing,
 * density, hero, contrast, CTA, typography and narration. The personality is
 * deterministic per brand, with a per-brand seed so two same-profile businesses
 * still diverge.
 */

import type { Industry, SiteAnalysis, Theme } from "./types";
import type { BusinessProfile } from "./business";
import type { ArtDirection } from "./art-direction";
import { INDUSTRY_PROFILES } from "./industries";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface PersonalityLevers {
  rhythm: ArtDirection["sectionRhythm"];
  motion: ArtDirection["motionPhilosophy"];
  whitespace: ArtDirection["whitespaceStrategy"];
  hero: ArtDirection["heroPhilosophy"];
  contrast: ArtDirection["contrastStrategy"];
  cta: ArtDirection["ctaHierarchy"];
  typography: ArtDirection["typographyRhythm"];
  narrative: ArtDirection["pageStorytelling"];
  /** 0 (airy, contemplative) → 100 (packed, kinetic). */
  density: number;
}

export interface BrandPersonality {
  // Five continuous traits (0–100), the brand's temperament in numbers.
  boldness: number;
  energy: number;
  sophistication: number;
  warmth: number;
  playfulness: number;

  // Human-readable identity (diagnostics + copy voice).
  temperament: "serene" | "measured" | "confident" | "energetic" | "fierce";
  character: string;
  tone: BusinessProfile["tone"];
  values: string[];
  emotionalWorld: string;

  // The exploitable levers the rest of the pipeline steers by.
  levers: PersonalityLevers;
  signature: string;
}

/* -------------------------------------------------------------------------- */
/*  Deterministic hashing (avalanche-mixed, like the art director)            */
/* -------------------------------------------------------------------------- */

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function fmix32(h: number): number {
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}
function seededPick<T>(options: readonly T[], seed: number, salt: string): T {
  return options[fmix32(fnv1a(seed.toString() + salt)) % options.length];
}
/** Signed jitter in [-amp, amp], deterministic per (seed, salt). */
function jitter(seed: number, salt: string, amp: number): number {
  return ((fmix32(fnv1a(seed.toString() + salt)) % 1000) / 1000 - 0.5) * 2 * amp;
}
const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/* -------------------------------------------------------------------------- */
/*  Trait vocabulary (EN + FR) — the brand tells you who it is                 */
/* -------------------------------------------------------------------------- */

const TRAIT_WORDS = {
  bold: [
    "bold", "daring", "fearless", "disruptive", "radical", "brutalist", "industrial",
    "raw", "statement", "uncompromising", "audacieux", "brut", "radical", "sans compromis",
    "osé", "affirmé", "puissant", "cru",
  ],
  calm: [
    "calm", "serene", "quiet", "gentle", "slow", "mindful", "contemplative", "still",
    "understated", "serein", "paisible", "calme", "doux", "lenteur", "zen", "épuré",
    "silence", "apaisant", "sobre",
  ],
  energetic: [
    "dynamic", "fast", "vibrant", "energetic", "kinetic", "electric", "punchy", "lively",
    "fresh", "dynamique", "énergique", "vif", "rapide", "pulsé", "vibrant", "pétillant",
    "vivant",
  ],
  sophisticated: [
    "refined", "elegant", "sophisticated", "curated", "bespoke", "couture", "timeless",
    "exquisite", "gastronomic", "gastronomique", "étoilé", "michelin", "haute", "prestige",
    "raffiné", "élégant", "sophistiqué", "intemporel", "d'exception", "d'excellence",
  ],
  warm: [
    "warm", "welcoming", "cozy", "family", "heartfelt", "homemade", "convivial",
    "chaleureux", "familial", "authentique", "généreux", "accueillant", "fait maison",
    "humain", "proche",
  ],
  playful: [
    "playful", "fun", "quirky", "colorful", "cheeky", "joyful", "bold", "vibrant",
    "ludique", "décalé", "fun", "joyeux", "coloré", "espiègle", "malicieux",
  ],
} satisfies Record<string, string[]>;

function count(text: string, words: readonly string[]): number {
  let n = 0;
  for (const w of words) if (text.includes(w)) n++;
  return n;
}

/* -------------------------------------------------------------------------- */
/*  Derivation                                                                */
/* -------------------------------------------------------------------------- */

const AUDACIOUS_INDUSTRIES: Industry[] = ["gym", "agency", "fashion", "automotive"];
const REFINED_INDUSTRIES: Industry[] = ["architect", "hotel", "fashion", "lawyer", "finance"];
const CALM_INDUSTRIES: Industry[] = ["medical", "health", "lawyer", "coach"];

export function deriveBrandPersonality(
  analysis: SiteAnalysis,
  profile: BusinessProfile,
  mood: Theme["mood"],
): BrandPersonality {
  const industry = analysis.industry;
  const seed = fnv1a(`${analysis.brandName.toLowerCase().trim()}|${analysis.url.toLowerCase()}|persona`);
  const text = [
    analysis.extractedContent.headline,
    analysis.extractedContent.description,
    analysis.brandName,
    ...(analysis.extractedContent.services || []),
    analysis.extractedContent.aboutBody || "",
    ...(analysis.extractedContent.testimonials || []).map((t) => t.quote || ""),
  ]
    .join(" ")
    .toLowerCase();

  const hits = {
    bold: count(text, TRAIT_WORDS.bold),
    calm: count(text, TRAIT_WORDS.calm),
    energetic: count(text, TRAIT_WORDS.energetic),
    sophisticated: count(text, TRAIT_WORDS.sophisticated),
    warm: count(text, TRAIT_WORDS.warm),
    playful: count(text, TRAIT_WORDS.playful),
  };

  // Start neutral; content is the primary voice, sector/tier/mood are nudges,
  // and a per-brand jitter guarantees two same-profile brands still differ.
  const tierSoph: Record<BusinessProfile["tier"], number> = { luxury: 26, premium: 14, mid: 0, budget: -8 };

  let boldness = 46 + hits.bold * 13 - hits.calm * 8 + (AUDACIOUS_INDUSTRIES.includes(industry) ? 12 : 0)
    + (mood === "bold" ? 16 : 0) + (profile.tier === "budget" ? 6 : 0) + jitter(seed, "bold", 9);
  let energy = 46 + hits.energetic * 13 + hits.playful * 6 - hits.calm * 12
    + (mood === "bold" ? 12 : 0) + (mood === "warm" ? 4 : 0) - (mood === "elegant" ? 8 : 0)
    + (CALM_INDUSTRIES.includes(industry) ? -12 : 0) + jitter(seed, "energy", 10);
  let sophistication = 48 + hits.sophisticated * 12 - hits.playful * 6 + tierSoph[profile.tier]
    + (REFINED_INDUSTRIES.includes(industry) ? 10 : 0) + (mood === "elegant" ? 12 : 0)
    + (mood === "minimal" ? 6 : 0) + jitter(seed, "soph", 8);
  let warmth = 46 + hits.warm * 13 - hits.bold * 5 + (mood === "warm" ? 18 : 0)
    + (profile.audience?.type === "b2c" ? 6 : profile.audience?.type === "b2b" ? -8 : 0)
    + jitter(seed, "warm", 9);
  let playfulness = 40 + hits.playful * 14 + hits.energetic * 4 - hits.sophisticated * 6
    - (REFINED_INDUSTRIES.includes(industry) ? 8 : 0) + (profile.tone === "playful" ? 14 : 0)
    + jitter(seed, "play", 10);

  boldness = clamp100(boldness);
  energy = clamp100(energy);
  sophistication = clamp100(sophistication);
  warmth = clamp100(warmth);
  playfulness = clamp100(playfulness);

  const temperament = deriveTemperament(energy, boldness, sophistication);
  const levers = deriveLevers({ boldness, energy, sophistication, warmth, playfulness }, mood, seed);
  const character = deriveCharacter({ boldness, energy, sophistication, warmth, playfulness }, industry);
  const values = deriveValues({ boldness, energy, sophistication, warmth, playfulness }, profile);
  const emotionalWorld = deriveEmotionalWorld(temperament, { sophistication, warmth, energy });

  return {
    boldness, energy, sophistication, warmth, playfulness,
    temperament, character, tone: profile.tone, values, emotionalWorld,
    levers,
    signature: `p:${temperament}:b${boldness}:e${energy}:s${sophistication}:w${warmth}:${seed.toString(16).slice(0, 5)}`,
  };
}

function deriveTemperament(energy: number, boldness: number, sophistication: number): BrandPersonality["temperament"] {
  if (energy < 34 && sophistication >= 52) return "serene";
  if (energy < 44) return "measured";
  if (energy < 62) return "confident";
  if (energy < 78 || boldness < 72) return "energetic";
  return "fierce";
}

function deriveLevers(
  t: { boldness: number; energy: number; sophistication: number; warmth: number; playfulness: number },
  mood: Theme["mood"],
  seed: number,
): PersonalityLevers {
  const { boldness, energy, sophistication, warmth, playfulness } = t;
  const calm = 100 - energy;

  const rhythm: ArtDirection["sectionRhythm"] =
    energy >= 72 ? seededPick(["staccato", "crescendo"] as const, seed, "rhythm")
    : energy >= 56 ? "wave"
    : sophistication >= 60 && calm >= 55 ? "editorial-pause"
    : "steady";

  const motion: ArtDirection["motionPhilosophy"] =
    energy >= 70 ? seededPick(["cinematic", "playful"] as const, seed, "motion")
    : energy <= 36 && sophistication >= 55 ? "restrained"
    : sophistication >= 68 ? "cinematic"
    : "purposeful";

  const whitespace: ArtDirection["whitespaceStrategy"] =
    sophistication >= 66 && energy <= 46 ? "editorial-breathing"
    : sophistication >= 56 && energy <= 56 ? "generous"
    : energy >= 70 ? "dense"
    : "balanced";

  const hero: ArtDirection["heroPhilosophy"] =
    boldness >= 66 ? seededPick(["immersive", "statement"] as const, seed, "hero")
    : sophistication >= 62 && energy <= 50 ? "editorial"
    : energy >= 60 ? "atmospheric"
    : "product-first";

  const contrast: ArtDirection["contrastStrategy"] =
    boldness >= 62 && energy >= 58 ? seededPick(["dark-anchor", "gradient-flow"] as const, seed, "contrast")
    : sophistication >= 62 && energy <= 50 ? "monochrome"
    : warmth >= 62 ? "alternating"
    : "light-dominant";

  const cta: ArtDirection["ctaHierarchy"] =
    boldness >= 66 ? "single-dominant"
    : energy >= 64 ? "progressive"
    : sophistication >= 64 && energy <= 46 ? "soft-repeated"
    : "dual-balanced";

  const typography: ArtDirection["typographyRhythm"] =
    boldness >= 62 || energy >= 66 ? seededPick(["contrasting", "escalating"] as const, seed, "typo")
    : sophistication >= 62 ? "editorial-mix"
    : energy <= 40 ? "uniform"
    : "contrasting";

  const narrative: ArtDirection["pageStorytelling"] =
    sophistication >= 62 && energy <= 50 ? "editorial"
    : warmth >= 62 ? "journey"
    : boldness >= 64 ? "manifesto"
    : "showcase";

  const density = clamp100(energy * 0.5 + (100 - sophistication) * 0.35 + playfulness * 0.15);

  return { rhythm, motion, whitespace, hero, contrast, cta, typography, narrative, density };
}

const CHARACTERS: { when: (t: any) => boolean; name: string }[] = [
  { when: (t) => t.sophistication >= 64 && t.energy <= 44, name: "The Curator" },
  { when: (t) => t.boldness >= 66 && t.energy >= 62, name: "The Challenger" },
  { when: (t) => t.playfulness >= 62, name: "The Maverick" },
  { when: (t) => t.warmth >= 64, name: "The Host" },
  { when: (t) => t.sophistication >= 60 && t.boldness >= 58, name: "The Auteur" },
  { when: (t) => t.energy >= 62, name: "The Instigator" },
];
function deriveCharacter(t: any, _industry: Industry): string {
  return CHARACTERS.find((c) => c.when(t))?.name ?? "The Craftsman";
}

function deriveValues(
  t: { boldness: number; energy: number; sophistication: number; warmth: number; playfulness: number },
  profile: BusinessProfile,
): string[] {
  const v: [number, string][] = [
    [t.sophistication, "refinement"],
    [t.warmth, "hospitality"],
    [t.boldness, "conviction"],
    [t.energy, "momentum"],
    [t.playfulness, "delight"],
    [100 - t.energy, "restraint"],
  ];
  const top = v.sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, name]) => name);
  // Blend in a real trust signal if the profile carries one.
  if (profile.trustSignals?.length) top.push(profile.trustSignals[0]);
  return Array.from(new Set(top)).slice(0, 3);
}

function deriveEmotionalWorld(
  temperament: BrandPersonality["temperament"],
  t: { sophistication: number; warmth: number; energy: number },
): string {
  if (temperament === "serene") return "hushed, ceremonial, considered";
  if (temperament === "fierce") return "charged, unapologetic, kinetic";
  if (t.warmth >= 62) return "warm, generous, human";
  if (t.sophistication >= 62) return "poised, elevated, quietly confident";
  if (t.energy >= 62) return "bright, quick, alive";
  return "grounded, honest, dependable";
}
