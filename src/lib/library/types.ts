/**
 * Premium Composition Library — complete type system.
 *
 * A "composition" is not a component. It is a complete, measurable description
 * of how a section should be laid out: grid, columns, spacing, image ratios,
 * headline sizing, motion, reading flow. Pure data — no JSX, no markup.
 *
 * Compositions are fed into the generation engine as prop enrichment.
 * The block components themselves never change.
 */

import type { BlockType } from "@/lib/generation/types";

/**
 * Extended industry taxonomy for the composition library.
 * A strict superset of the generation engine's `Industry` type —
 * all values from generation/types.ts are included, plus richer
 * categories used for composition matching.
 */
export type LibraryIndustry =
  // ── Original generation/types.ts values (verbatim) ────────────────────────
  | "restaurant" | "artisan" | "realestate" | "saas" | "agency"
  | "ecommerce" | "health" | "hotel" | "architect" | "lawyer"
  | "gym" | "coach" | "plumber" | "electrician" | "construction"
  | "finance" | "fashion" | "automotive" | "medical" | "generic"
  // ── Extended vocabulary ────────────────────────────────────────────────────
  | "technology" | "startup" | "fintech" | "ai" | "platform"
  | "product" | "developer-tools" | "b2b" | "enterprise" | "scale-up"
  | "creative" | "design" | "art" | "photography" | "film"
  | "media" | "publishing" | "news" | "blog" | "culture"
  | "architecture" | "interior-design"
  | "luxury" | "hospitality" | "spa" | "resort" | "wellness" | "beauty"
  | "jewelry" | "perfume"
  | "real-estate"
  | "consulting" | "professional-services" | "legal" | "B2B"
  | "nonprofit" | "education" | "government" | "community"
  | "healthcare" | "dental" | "veterinary"
  | "lifestyle" | "travel" | "adventure" | "outdoor" | "sport"
  | "food" | "beverage"
  | "events" | "wedding"
  | "gaming" | "entertainment"
  | "museum" | "gallery"
  | "mobile-app" | "freelance" | "coaching"
  | "subscription" | "corporate"
  | "services" | "retail" | "consumer"
  | "law" | "insurance"
  | "illustration" | "typography" | "studio"
  | "all"; // wildcard — matches any industry

/* -------------------------------------------------------------------------- */
/*  Enumerations                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The 17 categories the library covers, aligned to BlockType.
 * (logos / emergency / before-after / map / schedule / products
 * are excluded — they're data-driven, not composition-driven.)
 */
export type CompositionCategory =
  | "hero" | "features" | "about" | "portfolio" | "gallery"
  | "services" | "pricing" | "stats" | "timeline" | "process"
  | "team" | "testimonials" | "faq" | "contact" | "booking"
  | "newsletter" | "cta" | "footer";

/** Block types the library directly maps to. */
export const COMPOSITION_CATEGORIES: CompositionCategory[] = [
  "hero", "features", "about", "portfolio", "gallery",
  "services", "pricing", "stats", "timeline", "process",
  "team", "testimonials", "faq", "contact", "booking",
  "newsletter", "cta", "footer",
];

// ── Hero families ──────────────────────────────────────────────────────────
export type HeroFamily =
  | "editorial" | "luxury" | "magazine" | "split" | "fullscreen"
  | "offset" | "asymmetrical" | "centered" | "diagonal" | "bento"
  | "typographic" | "cinematic";

// ── Portfolio families ─────────────────────────────────────────────────────
export type PortfolioFamily =
  | "editorial-grid" | "magazine-grid" | "offset-grid" | "floating-cards"
  | "masonry" | "collage" | "timeline" | "image-wall" | "minimal-list"
  | "fullbleed-scroll";

// ── Gallery families ───────────────────────────────────────────────────────
export type GalleryFamily =
  | "editorial" | "luxury" | "masonry" | "offset" | "fullscreen"
  | "magazine" | "floating" | "collage" | "strip" | "mosaic";

// ── Features families ──────────────────────────────────────────────────────
export type FeaturesFamily =
  | "editorial" | "cards" | "magazine" | "alternating" | "image-left"
  | "image-right" | "timeline" | "minimal" | "bento" | "metrics"
  | "centered-list" | "icon-grid";

// ── About families ─────────────────────────────────────────────────────────
export type AboutFamily =
  | "editorial" | "split" | "centered" | "magazine" | "immersive"
  | "minimal" | "team-led" | "story" | "luxury" | "manifesto";

// ── Services families ──────────────────────────────────────────────────────
export type ServicesFamily =
  | "editorial" | "cards" | "magazine" | "alternating" | "numbered"
  | "minimal" | "icon-grid" | "accordion" | "featured" | "luxury";

// ── Pricing families ───────────────────────────────────────────────────────
export type PricingFamily =
  | "editorial" | "cards" | "comparison" | "minimal" | "featured"
  | "luxury" | "stacked" | "toggle";

// ── Stats families ─────────────────────────────────────────────────────────
export type StatsFamily =
  | "editorial" | "magazine" | "minimal" | "immersive" | "marquee"
  | "centered" | "staggered";

// ── Timeline families ──────────────────────────────────────────────────────
export type TimelineFamily =
  | "editorial" | "vertical" | "horizontal" | "minimal" | "magazine"
  | "alternating" | "immersive";

// ── Process families ───────────────────────────────────────────────────────
export type ProcessFamily =
  | "numbered" | "editorial" | "cards" | "sticky-stack" | "minimal"
  | "horizontal" | "magazine" | "luxury";

// ── Team families ──────────────────────────────────────────────────────────
export type TeamFamily =
  | "editorial" | "cards" | "magazine" | "minimal" | "luxury"
  | "founders" | "grid" | "featured";

// ── Testimonials families ──────────────────────────────────────────────────
export type TestimonialsFamily =
  | "editorial" | "magazine" | "minimal" | "luxury" | "immersive"
  | "marquee" | "cards" | "featured" | "pull-quote";

// ── FAQ families ───────────────────────────────────────────────────────────
export type FaqFamily =
  | "editorial" | "minimal" | "magazine" | "accordion" | "two-column"
  | "luxury" | "inline";

// ── Contact families ───────────────────────────────────────────────────────
export type ContactFamily =
  | "editorial" | "split" | "minimal" | "magazine" | "luxury"
  | "centered" | "immersive" | "sidebar";

// ── Booking families ───────────────────────────────────────────────────────
export type BookingFamily =
  | "editorial" | "minimal" | "split" | "luxury" | "centered"
  | "calendar" | "steps";

// ── Newsletter families ────────────────────────────────────────────────────
export type NewsletterFamily =
  | "editorial" | "minimal" | "split" | "magazine" | "centered"
  | "luxury" | "inline";

// ── CTA families ───────────────────────────────────────────────────────────
export type CtaFamily =
  | "editorial" | "minimal" | "fullscreen" | "split" | "magazine"
  | "luxury" | "centered" | "dark" | "floating" | "testimonial-led";

// ── Footer families ────────────────────────────────────────────────────────
export type FooterFamily =
  | "editorial" | "minimal" | "magazine" | "luxury" | "centered"
  | "split" | "stacked" | "dark" | "immersive";

/** Union of all family types (discriminated by category). */
export type CompositionFamily =
  | HeroFamily | PortfolioFamily | GalleryFamily | FeaturesFamily
  | AboutFamily | ServicesFamily | PricingFamily | StatsFamily
  | TimelineFamily | ProcessFamily | TeamFamily | TestimonialsFamily
  | FaqFamily | ContactFamily | BookingFamily | NewsletterFamily
  | CtaFamily | FooterFamily;

/* -------------------------------------------------------------------------- */
/*  Layout primitives                                                         */
/* -------------------------------------------------------------------------- */

export type GridSystem = "12" | "10" | "8" | "6" | "custom" | "full";

/**
 * Columns in the grid occupied by each zone.
 * e.g. [5, 7] = text 5 cols, image 7 cols (asymmetric split).
 * [] = full-width (no column split).
 */
export type ColumnDistribution = number[];

export type ContainerWidth =
  | "640" | "720" | "800" | "960" | "1024" | "1100"
  | "1280" | "1440" | "1680" | "1920" | "full" | "narrow" | "reading";

export type NegativeSpace = "low" | "medium" | "high" | "very_high" | "extreme";

export type TextPosition = "left" | "center" | "right" | "overlay" | "split";

export type ImagePosition = "left" | "right" | "behind" | "below" | "above" | "none";

export type ImageRatio =
  | "1:1" | "4:3" | "3:2" | "16:9" | "4:5" | "3:4" | "2:3" | "5:4"
  | "9:16" | "21:9" | "square" | "landscape" | "portrait" | "custom";

export type CtaVariant =
  | "pill" | "ghost" | "text-arrow" | "floating" | "inline" | "underline"
  | "sharp" | "gradient";

export type OverlayType =
  | "none" | "subtle" | "gradient" | "duotone" | "full" | "color-block";

export type MotionType =
  | "none" | "subtle" | "parallax" | "reveal" | "stagger" | "cinematic"
  | "scroll-driven" | "spring" | "float";

export type ReadingFlow =
  | "linear" | "diagonal" | "z-pattern" | "f-pattern" | "circular"
  | "spiral" | "vertical";

export type HeadlineFont = "display" | "serif" | "sans" | "mono" | "variable";

export type VisualWeight = "light" | "medium" | "heavy";

export type BalanceType = "symmetric" | "asymmetric" | "dynamic" | "tension";

export type BreathingRoom = "tight" | "comfortable" | "generous" | "editorial" | "extreme";

export type ContentDensity = "sparse" | "moderate" | "dense";

export type LayoutAlignment = "left" | "center" | "right" | "mixed";

/* -------------------------------------------------------------------------- */
/*  Composition Spec                                                          */
/* -------------------------------------------------------------------------- */

/**
 * The measurable description of a section's visual composition.
 * Every field maps to a CSS or design property — no conceptual abstractions.
 */
export interface CompositionSpec {
  /** Column system. */
  grid: GridSystem;
  /** Column distribution between zones. [] = full-width. */
  columns: ColumnDistribution;
  /** Section height. CSS value or semantic token. */
  sectionHeight: string;
  /** Max-width of the inner container (px, or keyword). */
  container: ContainerWidth;
  /** Ratio of whitespace to content area. */
  negativeSpace: NegativeSpace;
  /** Dominant text alignment / position. */
  textPosition: TextPosition;
  /** Image placement relative to text. */
  imagePosition: ImagePosition;
  /** Dominant image aspect ratio. */
  imageRatio?: ImageRatio;
  /** Does the image overflow its column/container? */
  imageOverflow?: boolean;
  /** Max-width of headline text block (px). */
  headlineWidth?: number;
  /** Maximum lines the headline may wrap to. */
  headlineMaxLines?: number;
  /** Font personality used for headlines. */
  headlineFont: HeadlineFont;
  /**
   * Headline font size. CSS value with fluid fallback.
   * e.g. "clamp(52px,6vw,104px)".
   */
  headlineSize: string;
  /** Max-width of subtitle / description block (px or %). */
  subtitleWidth?: string;
  /** CTA button style. */
  cta: CtaVariant;
  /** Image/section overlay style. */
  overlay: OverlayType;
  /** Motion design approach. */
  motion: MotionType;
  /** Dominant reading flow path for the eye. */
  readingFlow: ReadingFlow;
  /** Named layout style (kebab-case). */
  layout: string;
  /** Vertical section padding (top & bottom). CSS value. */
  sectionPadding?: string;
  /** Gap between columns (CSS value). */
  columnGap?: string;
  /** Whether card/content elements overlap each other. */
  usesOverlap?: boolean;
  /** Whether the section uses full-viewport height (100vh). */
  isFullViewport?: boolean;
  /** Section color mode. */
  colorMode?: "light" | "dark" | "accent" | "surface";
  /** Additional compositional notes. */
  notes?: string;
}

/* -------------------------------------------------------------------------- */
/*  Responsive variants                                                       */
/* -------------------------------------------------------------------------- */

/** Per-breakpoint overrides (only changed properties needed). */
export type ResponsiveOverride = Partial<Pick<CompositionSpec,
  | "columns" | "sectionHeight" | "container" | "negativeSpace"
  | "textPosition" | "imagePosition" | "imageRatio" | "headlineSize"
  | "headlineMaxLines" | "subtitleWidth" | "cta" | "motion" | "layout"
  | "sectionPadding" | "columnGap" | "usesOverlap" | "colorMode" | "overlay"
>>;

export interface ResponsiveComposition {
  /** 1440+ px — primary composition. */
  desktop: CompositionSpec;
  /** 1280 px — minor adjustments (often none needed). */
  laptop?: ResponsiveOverride;
  /** 768 px — tablet reflow. */
  tablet: ResponsiveOverride;
  /** 390 px — mobile reflow. */
  mobile: ResponsiveOverride;
}

/* -------------------------------------------------------------------------- */
/*  Editorial Rhythm                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Measurable editorial quality metrics derived from the composition.
 * Calculated by visual-rhythm.ts — never manually set.
 */
export interface EditorialRhythm {
  /** 0–1. Fraction of the section that is empty space. */
  negativeSpaceRatio: number;
  readingFlow: ReadingFlow;
  visualWeight: VisualWeight;
  balance: BalanceType;
  breathingRoom: BreathingRoom;
  density: ContentDensity;
  /** 0–100. How "luxury" the composition feels. */
  luxuryScore: number;
  /** 0–100. Editorial quality (magazine-like precision). */
  editorialScore: number;
  /** 0–100. Typographic hierarchy strength. */
  hierarchyScore: number;
}

/* -------------------------------------------------------------------------- */
/*  Premium Score                                                             */
/* -------------------------------------------------------------------------- */

/** All 13 scoring dimensions from the premium-rules engine. */
export interface PremiumScoreBreakdown {
  editorialQuality: number;
  luxuryFeeling: number;
  framerSimilarity: number;
  balance: number;
  hierarchy: number;
  whitespace: number;
  typography: number;
  motion: number;
  gridQuality: number;
  conversion: number;
  imageRhythm: number;
  storytelling: number;
  originality: number;
}

export interface PremiumScore {
  overall: number;          // weighted sum, 0–100. MINIMUM 95 for library inclusion.
  breakdown: PremiumScoreBreakdown;
}

/** Minimum premium score for a composition to be accepted into the library. */
export const MINIMUM_PREMIUM_SCORE = 95;

/* -------------------------------------------------------------------------- */
/*  Diversity constraints                                                     */
/* -------------------------------------------------------------------------- */

/**
 * What this composition "blocks" when it is the previous section.
 * The selector uses this to enforce diversity between consecutive sections.
 */
export interface DiversityConstraints {
  /** Layouts that should not immediately follow this one. */
  blockedLayouts: string[];
  /** Column distributions that should not immediately follow this one. */
  blockedColumns: ColumnDistribution[];
  /** Image ratios that should not immediately follow this one. */
  blockedImageRatios: ImageRatio[];
  /** Motion types that should not immediately follow this one. */
  blockedMotions: MotionType[];
  /** CTA styles that should not immediately follow this one. */
  blockedCtas: CtaVariant[];
  /** Text alignments that should not immediately follow this one. */
  blockedAlignments: TextPosition[];
}

/* -------------------------------------------------------------------------- */
/*  Composition Entry — the core data unit                                    */
/* -------------------------------------------------------------------------- */

export interface CompositionEntry {
  /**
   * Stable unique identifier.
   * Convention: `{category}_{family}_{zero-padded-index}`
   * e.g. "hero_editorial_001", "portfolio_masonry_012"
   */
  id: string;
  category: CompositionCategory;
  family: CompositionFamily;
  /**
   * Visual complexity level.
   * 1 = very simple (safe, generic). 5 = highly editorial (risky, distinctive).
   */
  complexity: 1 | 2 | 3 | 4 | 5;
  /** Pre-computed premium score. All library entries must score ≥ 95. */
  premium: number;
  /** Industries this composition fits well. */
  industries: LibraryIndustry[];
  /** Composition data + responsive variants. */
  responsive: ResponsiveComposition;
  /** Editorial rhythm metrics (auto-computed, stored for fast lookups). */
  rhythm: EditorialRhythm;
  /** Premium score breakdown. */
  score: PremiumScoreBreakdown;
  /** Diversity constraints: what should not follow this composition. */
  constraints: DiversityConstraints;
  /**
   * Reference sites / templates that inspired the compositional language.
   * Names only — no HTML, no JSX, no copied design. Purely directional.
   */
  inspirations: string[];
  /** Descriptive tags for search and filtering. */
  tags: string[];
  /**
   * Human-readable description of the editorial intent.
   * One sentence maximum.
   */
  description: string;
}

/* -------------------------------------------------------------------------- */
/*  Selection API                                                             */
/* -------------------------------------------------------------------------- */

/** Record of which compositions have already been used in this site. */
export interface HistoricalSelection {
  compositionId: string;
  category: CompositionCategory;
  layout: string;
  columns: ColumnDistribution;
  imageRatio?: ImageRatio;
  motion: MotionType;
  cta: CtaVariant;
  textPosition: TextPosition;
}

/** Everything the selector needs to pick the best composition. */
export interface SelectionContext {
  category: CompositionCategory;
  industry: LibraryIndustry;
  /** 0–100 luxury target derived from BusinessProfile. */
  luxuryTarget?: number;
  /** 0–100 editorial target derived from DesignDNA. */
  editorialTarget?: number;
  /** 0–100 modernity target. */
  modernityTarget?: number;
  /** Dominant mood from the theme. */
  mood?: "minimal" | "bold" | "warm" | "elegant";
  /** Dark mode active? */
  isDark?: boolean;
  /** History of already-used compositions (for diversity enforcement). */
  history?: HistoricalSelection[];
  /** Prefer a specific family. */
  preferFamily?: CompositionFamily;
  /**
   * Deterministic seed for reproducible selection.
   * Same seed + same context → same output.
   */
  seed?: string;
  /** Maximum complexity to consider. Default: 5. */
  maxComplexity?: 1 | 2 | 3 | 4 | 5;
  /** Minimum premium score to consider. Default: MINIMUM_PREMIUM_SCORE. */
  minPremium?: number;
}

/** What the selector returns. */
export interface SelectedComposition {
  composition: CompositionEntry;
  /** Final selection score (0–100). Higher = better match. */
  score: number;
  /** Breakdown of selection scoring. */
  scoring: SelectionScoring;
  /** The composition to record in history. */
  historyEntry: HistoricalSelection;
}

/** Per-dimension scores that drove the selection. */
export interface SelectionScoring {
  industryMatch: number;
  luxuryMatch: number;
  editorialMatch: number;
  visualDiversity: number;
  premiumScore: number;
  originality: number;
  referenceMatch: number;
  negativeSpaceMatch: number;
  visualRhythm: number;
  compositionBalance: number;
  /** Weighted total. */
  total: number;
}

/* -------------------------------------------------------------------------- */
/*  Validation                                                                */
/* -------------------------------------------------------------------------- */

export interface CompositionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  /** Auto-computed premium score (may differ from stored value). */
  computedPremium: number;
}

/* -------------------------------------------------------------------------- */
/*  Registry types                                                            */
/* -------------------------------------------------------------------------- */

export interface RegistryStats {
  total: number;
  byCategory: Partial<Record<CompositionCategory, number>>;
  byFamily: Partial<Record<string, number>>;
  averagePremium: number;
  minPremium: number;
  /** Number of compositions with premium ≥ 95. */
  premiumCount: number;
}

/* -------------------------------------------------------------------------- */
/*  Editorial Rhythm Engine types                                             */
/* -------------------------------------------------------------------------- */

export interface RhythmAnalysis {
  rhythm: EditorialRhythm;
  flags: string[];    // warnings about the composition
  suggestions: string[];
}

/* -------------------------------------------------------------------------- */
/*  Layout Rules types                                                        */
/* -------------------------------------------------------------------------- */

export interface DiversityPenalty {
  /** 0–1. 0 = no penalty, 1 = maximum penalty (blocked). */
  penalty: number;
  /** Why the penalty was applied. */
  reasons: string[];
}

export interface LayoutRule {
  name: string;
  description: string;
  /** Check if this rule is violated. Returns penalty 0–1. */
  check(candidate: CompositionEntry, history: HistoricalSelection[]): DiversityPenalty;
}
