/**
 * Premium Composition Library — public API.
 *
 * Primary entry point. Populates the registry and re-exports all public APIs.
 *
 * Usage:
 *   import { selectComposition, getStats } from "@/lib/library";
 */

// Populate the registry (side-effect: registers all compositions).
import "./composition-db";

// Types
export type {
  CompositionCategory,
  CompositionFamily,
  LibraryIndustry,
  CompositionEntry,
  CompositionSpec,
  ResponsiveComposition,
  ResponsiveOverride,
  EditorialRhythm,
  PremiumScore,
  PremiumScoreBreakdown,
  DiversityConstraints,
  HistoricalSelection,
  SelectionContext,
  SelectedComposition,
  SelectionScoring,
  CompositionValidationResult,
  RegistryStats,
  RhythmAnalysis,
  DiversityPenalty,
  LayoutRule,
  // Family types
  HeroFamily,
  PortfolioFamily,
  GalleryFamily,
  FeaturesFamily,
  AboutFamily,
  ServicesFamily,
  PricingFamily,
  StatsFamily,
  TimelineFamily,
  ProcessFamily,
  TeamFamily,
  TestimonialsFamily,
  FaqFamily,
  ContactFamily,
  BookingFamily,
  NewsletterFamily,
  CtaFamily,
  FooterFamily,
} from "./types";

export { COMPOSITION_CATEGORIES, MINIMUM_PREMIUM_SCORE } from "./types";

// Registry
export {
  register,
  get,
  getAll,
  getByCategory,
  getByFamily,
  query,
  getStats,
  _resetForTests,
} from "./composition-registry";

// Selector (main public API)
export { selectComposition, selectMany } from "./composition-selector";

// Scoring
export { scoreComposition } from "./composition-score";

// Premium rules
export { calculatePremiumScore, validatePremiumQuality } from "./premium-rules";

// Editorial rhythm
export { calculateEditorialRhythm, analyzeRhythm } from "./visual-rhythm";

// Layout rules
export { LAYOUT_RULES, calculateDiversityPenalty } from "./layout-rules";

// Validator
export { validateComposition, validateAll } from "./composition-validator";

// Randomizer (exposed for deterministic testing / external tools)
export { fnv1a, seededFloat, seededPick, seededShuffle, applyScoreJitter } from "./composition-randomizer";
