/**
 * V7 extraction types — the full TypeScript interface spec for the Scrapling
 * Visual Reverse Engineering Engine.
 *
 * Architecture overview:
 *   RawPage (from ScraplingEngine)
 *     → 12 independent analyzers (parallel where possible)
 *     → CompositionEngine + PremiumScorer (depend on analyzer outputs)
 *     → VisualDNABuilder → VisualDNAV7
 *     → DesignKnowledgeEngine → DesignKnowledgeEntry
 *
 * All types here are purely additive. VisualDNAV7 extends VisualDNA so every
 * existing consumer of VisualDNA continues to work unchanged.
 */

import type { VisualDNA, SourcePlatform } from "@/lib/extraction/types";

/* -------------------------------------------------------------------------- */
/*  1. CSS Analyzer output                                                    */
/* -------------------------------------------------------------------------- */

export interface CSSAnalysis {
  /** --custom-property → computed value, across all stylesheets. */
  customProperties: Record<string, string>;
  /**
   * Light/dark theme custom-property buckets inferred from
   * :root, [data-theme], .dark selectors.
   */
  customPropertyThemes: {
    default: Record<string, string>;
    dark: Record<string, string>;
  };
  colorValues: CSSColorValue[];
  fontFamilies: string[];
  fontSizes: CSSLength[];
  fontWeights: number[];
  lineHeights: number[];
  letterSpacings: CSSLength[];
  borderRadii: number[];       // px
  boxShadows: string[];
  zIndexLevels: number[];
  keyframes: KeyframeInfo[];
  transitions: TransitionInfo[];
  animations: AnimationInfo[];
  mediaQueries: MediaQueryInfo[];
  containerQueries: ContainerQueryInfo[];
  gridDefinitions: GridDefinition[];
  /** Has any CSS custom property (--foo: ...). */
  hasCustomProperties: boolean;
  /** Has clamp() — fluid typography. */
  hasClamp: boolean;
  hasCSSGrid: boolean;
  hasFlexbox: boolean;
  hasContainerQueries: boolean;
  hasScrollSnap: boolean;
  /** animation-timeline / scroll() — native scroll-driven animation. */
  hasScrollDrivenAnimation: boolean;
  /** Detected CSS framework: tailwind, bootstrap, etc. */
  cssFramework: "tailwind" | "bootstrap" | "none" | "unknown";
  flexboxUsage: {
    justifyContent: string[];
    alignItems: string[];
  };
}

export interface CSSColorValue {
  raw: string;
  hex: string | null;
  /** Inferred role from selector/property context. */
  role: "surface" | "ink" | "accent" | "border" | "shadow" | "unknown";
  frequency: number;  // how many times this value appears
}

export interface CSSLength {
  value: number;
  unit: "px" | "rem" | "em" | "%" | "vw" | "vh" | "other";
  /** Computed px value when unit is known and base is 16px. */
  px: number | null;
}

export interface KeyframeInfo {
  name: string;
  /** Inferred animation role. */
  role: "fade" | "slide" | "scale" | "rotate" | "reveal" | "blur" | "other";
  steps: number;
}

export interface TransitionInfo {
  property: string;
  durationMs: number;
  easing: string;
  delayMs: number;
}

export interface AnimationInfo {
  keyframeName: string;
  durationMs: number;
  easing: string;
  delayMs: number;
  iterationCount: string;
  fillMode: string;
}

export interface MediaQueryInfo {
  type: "min-width" | "max-width" | "other";
  valuePx: number | null;
  features: string[];
  /** Number of CSS rules inside this media query. */
  ruleCount: number;
}

export interface ContainerQueryInfo {
  name: string | null;
  type: "inline-size" | "size" | "other";
  valuePx: number | null;
  ruleCount: number;
}

export interface GridDefinition {
  columns: string;             // e.g. "repeat(3, 1fr)"
  rows: string;
  gap: { row: string; col: string };
  /** Inferred number of columns. */
  columnCount: number | null;
}

/* -------------------------------------------------------------------------- */
/*  2. Typography Analyzer output                                             */
/* -------------------------------------------------------------------------- */

export interface TypographyAnalysis {
  families: FontFamily[];
  scale: TypeScale;
  hierarchy: TypographyHierarchy;
  /** Actual used font weights, sorted ascending. */
  usedWeights: number[];
  lineHeightRatio: number | null;   // leading / font-size
  /** Negative = tight, positive = wide. In em. */
  dominantTracking: number | null;
  /** Max-width of body text containers (px). */
  readingColumnWidth: number | null;
  /** Max-width of headline elements (px). */
  headlineColumnWidth: number | null;
  textAlignDistribution: TextAlignDistribution;
  usesFluidType: boolean;           // clamp() on font-size
  usesVariableFont: boolean;        // font-variation-settings
  usesOpticalSizing: boolean;       // font-optical-sizing
  uppercaseUsage: "none" | "nav-only" | "headings" | "extensive";
}

export interface FontFamily {
  name: string;
  /** Primary role inferred from element usage. */
  role: "heading" | "body" | "accent" | "mono" | "ui" | "unknown";
  weights: number[];
  fallbacks: string[];
  /** How the font is loaded. */
  source: "google" | "adobe" | "system" | "custom" | "unknown";
  /** Is it a variable font axis? */
  isVariable: boolean;
}

export interface TypeScale {
  /** Largest heading in px. */
  maxHeadingPx: number | null;
  /** Body text size in px. */
  bodyPx: number | null;
  /** Actual distinct font sizes in use, sorted desc. */
  steps: number[];
  /** Computed ratio between consecutive steps (geometric mean). */
  ratio: number | null;
  /** Number of distinct type levels in the visual hierarchy. */
  levelCount: number;
  /** Is the scale fluid (clamp-based)? */
  isFluid: boolean;
}

export interface TypographyHierarchy {
  /** Dominant heading weight. */
  headingWeight: number | null;
  bodyWeight: number | null;
  /**
   * Editorial sophistication: how well-differentiated are the type levels?
   * 0 = no hierarchy, 1 = perfect hierarchy.
   */
  hierarchyScore: number;
  editorialScale: "compact" | "modern" | "editorial" | "bold" | "monumental";
}

export interface TextAlignDistribution {
  left: number;    // fraction 0–1
  center: number;
  right: number;
  justify: number;
}

/* -------------------------------------------------------------------------- */
/*  3. Layout Analyzer output                                                 */
/* -------------------------------------------------------------------------- */

export interface LayoutAnalysis {
  /** Distinct container max-widths found, sorted desc. */
  containerWidths: number[];
  /** Primary content max-width (px). */
  primaryContainerWidth: number | null;
  gridSystems: GridSystemInfo[];
  spacingSystem: SpacingSystem;
  /** Number of sections detected. */
  sectionCount: number;
  /** Estimated page height (px). */
  pageHeight: number | null;
  /** Number of elements with negative margin. */
  negativeMarginCount: number;
  stickyElements: StickyElementInfo[];
  /** Number of elements with position:absolute. */
  absoluteCount: number;
  /** Number of visual overlaps detected. */
  overlapCount: number;
  /** Max z-index depth. */
  zDepth: number;
  /** Does the layout use asymmetric compositions? */
  usesAsymmetry: boolean;
  /** Do sections have overlapping content (editorial technique)? */
  usesOverlap: boolean;
  alignmentPhilosophy: "centered" | "left-aligned" | "mixed";
  /** Is the layout mobile-first (min-width media queries)? */
  isMobileFirst: boolean;
}

export interface GridSystemInfo {
  type: "css-grid" | "flexbox" | "columns" | "unknown";
  columnCount: number | null;
  gapPx: number | null;
  maxWidthPx: number | null;
  /** Inferred role: page-level or component-level. */
  scope: "page" | "section" | "component";
}

export interface SpacingSystem {
  /** Detected base spacing unit (px). Typically 4 or 8. */
  baseUnit: number | null;
  /** All distinct spacing values found, sorted asc. */
  allValues: number[];
  /** Top section vertical padding (px). */
  sectionPaddingMin: number | null;
  sectionPaddingMax: number | null;
  /** Does the spacing follow a consistent scale? */
  isConsistent: boolean;
  philosophy: "tight" | "standard" | "generous" | "editorial";
}

export interface StickyElementInfo {
  /** Element role. */
  role: "nav" | "sidebar" | "cta" | "unknown";
  offsetPx: number;
}

/* -------------------------------------------------------------------------- */
/*  4. Component Detector output                                              */
/* -------------------------------------------------------------------------- */

export type ComponentType =
  | "navbar" | "hero" | "gallery" | "portfolio" | "about"
  | "services" | "features" | "stats" | "timeline" | "faq"
  | "pricing" | "testimonials" | "cta" | "contact" | "footer"
  | "forms" | "cards" | "accordions" | "tabs" | "sliders"
  | "marquee" | "logos" | "team" | "maps" | "process"
  | "booking" | "newsletter" | "before-after" | "emergency"
  | "schedules" | "unknown";

export interface ComponentDetection {
  detected: DetectedComponent[];
  /** Ordered list of detected section types (top to bottom). */
  sectionOrder: ComponentType[];
  /** Inferred page type from composition of sections. */
  pageType: "landing" | "portfolio" | "ecommerce" | "blog" | "service" | "unknown";
}

export interface DetectedComponent {
  type: ComponentType;
  /** 0–1. */
  confidence: number;
  /** Index in document order. */
  order: number;
  /** Detected heading text. */
  heading: string | null;
  childElementCount: number;
  hasImages: boolean;
  hasVideo: boolean;
  hasForm: boolean;
  hasAnimation: boolean;
  colorMode: "light" | "dark" | "accent";
}

/* -------------------------------------------------------------------------- */
/*  5. Image Analyzer output                                                  */
/* -------------------------------------------------------------------------- */

export interface ImageAnalysis {
  totalImages: number;
  heroImage: ImageInfo | null;
  galleryImages: ImageInfo[];
  backgroundImages: string[];
  /** Dominant aspect ratio across all gallery images. */
  dominantAspectRatio: "landscape" | "portrait" | "square" | "mixed";
  galleryStyle: "grid" | "masonry" | "strip" | "editorial" | "carousel" | "single" | "none";
  backgroundTreatment: "none" | "overlay" | "blur" | "duotone" | "gradient-scrim";
  usesLazyLoading: boolean;
  usesResponsiveSrcset: boolean;
  /** Are images using WebP/AVIF? */
  usesModernFormats: boolean;
  imageDensity: "minimal" | "moderate" | "image-heavy";
}

export interface ImageInfo {
  src: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  /** Computed from width/height or src heuristics. */
  aspectRatio: number | null;
  /** Is the image used as a section background? */
  isBackground: boolean;
  role: "hero" | "gallery" | "logo" | "avatar" | "decorative" | "unknown";
}

/* -------------------------------------------------------------------------- */
/*  6. Motion Analyzer output                                                 */
/* -------------------------------------------------------------------------- */

export interface MotionAnalysisV7 {
  /** 0–3. */
  intensity: 0 | 1 | 2 | 3;
  entranceType: "none" | "fade" | "slide-up" | "blur-fade" | "reveal" | "stagger";
  scrollBehavior: "none" | "parallax" | "sticky" | "reveal" | "scroll-driven";
  microInteractions: boolean;
  /** Is parallax used on the hero or backgrounds? */
  hasParallax: boolean;
  /** Does the site use CSS scroll-driven animations? */
  hasScrollDrivenCSS: boolean;
  /** Is Framer Motion detected (data-framer-* or framer-motion bundle)? */
  usesFramerMotion: boolean;
  /** Is GSAP detected? */
  usesGSAP: boolean;
  /** Is Intersection Observer used for reveals? */
  usesIntersectionObserver: boolean;
  stagger: StaggerConfig | null;
  spring: SpringConfig | null;
  dominantDuration: number | null;  // ms
  dominantEasing: string | null;
  hoverEffects: HoverEffect[];
  interactionPhilosophy: "restrained" | "purposeful" | "cinematic" | "playful";
  /** Is prefers-reduced-motion respected? */
  respectsReducedMotion: boolean;
}

export interface StaggerConfig {
  detected: boolean;
  delayMs: number | null;
  /** Element count in the stagger group. */
  count: number | null;
}

export interface SpringConfig {
  detected: boolean;
  type: "light" | "heavy" | "critically-damped" | "unknown";
}

export interface HoverEffect {
  type: "scale" | "lift" | "glow" | "color" | "opacity" | "translate" | "shadow" | "other";
  durationMs: number | null;
}

/* -------------------------------------------------------------------------- */
/*  7. Responsive Analyzer output                                             */
/* -------------------------------------------------------------------------- */

export interface ResponsiveAnalysis {
  /** Detected breakpoints in px, sorted asc. */
  breakpoints: number[];
  /** Mobile-first (min-width) vs desktop-first (max-width). */
  strategy: "mobile-first" | "desktop-first" | "mixed";
  usesFluidType: boolean;
  usesFluidSpacing: boolean;   // clamp() on padding/margin
  /** Does the layout reorder on mobile? */
  reordersOnMobile: boolean;
  /** Element types hidden on mobile (via display:none in media query). */
  hiddenOnMobile: string[];
  /** Element types hidden on desktop. */
  hiddenOnDesktop: string[];
  mobileNavType: "hamburger" | "bottom-bar" | "drawer" | "inline" | "none";
  stackingPattern: "all-stack" | "selective-stack" | "reorder" | "none";
  /** Supports reduced-motion via @media (prefers-reduced-motion). */
  supportsReducedMotion: boolean;
  /** Supports dark mode via @media (prefers-color-scheme). */
  supportsDarkMode: boolean;
}

/* -------------------------------------------------------------------------- */
/*  8. Brand Analyzer output                                                  */
/* -------------------------------------------------------------------------- */

export interface BrandAnalysis {
  palette: ColorSwatch[];
  colorCount: number;
  accentCount: number;
  colorModel: "monochrome" | "accent-rare" | "duotone" | "rich";
  /** Perceptual temperature. */
  colorTemperature: "warm" | "cool" | "neutral";
  saturationLevel: "desaturated" | "muted" | "vibrant";
  usesGradients: boolean;
  isDark: boolean;
  supportsDarkMode: boolean;
  /** Perceptual distance between surface and ink (0–100). */
  contrastIndex: number;
  surfaceColor: string | null;
  inkColor: string | null;
  accentColor: string | null;
}

export interface ColorSwatch {
  hex: string;
  role: "surface" | "ink" | "accent" | "secondary" | "border" | "unknown";
  /** Relative usage frequency in the CSS (0–1). */
  frequency: number;
  /** WCAG contrast against white. */
  contrastOnWhite: number;
  /** WCAG contrast against black. */
  contrastOnBlack: number;
}

/* -------------------------------------------------------------------------- */
/*  9. Framer Intelligence output                                             */
/* -------------------------------------------------------------------------- */

export interface FramerIntelligence {
  isFramer: boolean;
  version: string | null;
  /** data-framer-name attribute values found. */
  componentNames: string[];
  /** data-framer-appear-id values — reveal-on-scroll animations. */
  revealIds: string[];
  /** Framer CMS collection slugs. */
  cmsCollections: string[];
  /** Named sections from data-framer-name on section-level containers. */
  namedSections: { name: string; type: string }[];
  /** Per-section column-count hints extracted from Framer layout data. */
  layoutHints: { section: string; columns: number }[];
  responsiveVariantCount: number;
  richTextContainerCount: number;
  /** Is Framer Navigation component present? */
  hasFramerNav: boolean;
  /** Framer-specific override data detected. */
  hasStyleOverrides: boolean;
}

/* -------------------------------------------------------------------------- */
/*  10. Composition Engine output                                             */
/* -------------------------------------------------------------------------- */

export type CompositionType =
  | "monumental-centered"    // Hero as large typographic statement, centered
  | "editorial-asymmetric"   // Hero split left/right with visual tension
  | "cinematic-fullbleed"    // Full-viewport image, text overlaid
  | "split-balanced"         // 50/50 image + text split
  | "bento-grid"             // Non-uniform cards, grid-of-grids
  | "minimal-typographic"    // Text-only, no hero image
  | "feature-image"          // Large feature image, text below
  | "unknown";

export interface SectionComposition {
  type: ComponentType;
  compositionType: CompositionType;
  /** Estimated hero height as CSS string. */
  heroHeight: string | null;
  imagePlacement: "left" | "right" | "behind" | "below" | "none";
  headlinePlacement: "left" | "center" | "right" | "overlay";
  headlineWidthPx: number | null;
  imageAspectRatio: string | null;
  spacingScale: "tight" | "standard" | "generous" | "editorial";
  /** Ratio of whitespace to content area. 0–1. */
  negativeSpaceRatio: number;
  visualWeight: "light" | "medium" | "heavy";
  /** Estimated reading flow direction. */
  readingFlow: "linear" | "z-pattern" | "f-pattern" | "diagonal" | "circular";
  ctaStyle: string | null;
  colorMode: "light" | "dark" | "accent";
  /** 0–100. */
  premiumScore: number;
}

export interface CompositionAnalysis {
  /** Hero section composition. */
  hero: SectionComposition | null;
  /** All detected sections. */
  sections: SectionComposition[];
  /** Weighted mean of per-section premium scores. */
  overallPremiumScore: number;
  /** How varied are the section compositions? 0–1. */
  rhythmVariety: number;
  /** Are there dark "punctuation" sections between light content sections? */
  hasPunctuationSections: boolean;
  /** Does each section feel visually distinct? */
  hasSectionIdentity: boolean;
  sectionRhythm: "steady" | "alternating" | "crescendo" | "editorial-pause";
  /** Overall layout asymmetry index. 0–1. */
  asymmetryIndex: number;
  /** Mean whitespace-to-content ratio across all sections. */
  whitespaceRatio: number;
  /** "sparse" = high whitespace, editorial; "dense" = packed information. */
  contentDensity: "sparse" | "moderate" | "dense";
}

/* -------------------------------------------------------------------------- */
/*  11. Premium Scorer output                                                 */
/* -------------------------------------------------------------------------- */

export interface LuxuryDNA {
  /** Composite luxury score. 0–100. */
  overallScore: number;
  /** Typographic refinement: weight contrast, tracking, hierarchy. */
  typographyRefinement: number;
  /** Generosity of white space. */
  spacingGenerosity: number;
  /** Color palette sophistication: restraint, contrast, consistency. */
  colorSophistication: number;
  /** Component craft: radii consistency, shadow quality, CTA refinement. */
  componentCraft: number;
  /** Motion quality: purposeful, easing quality, reduced-motion support. */
  motionQuality: number;
  /** Image quality signals: aspect consistency, background treatment. */
  imageQuality: number;
  /** Responsive: fluid type, mobile-first, reflow quality. */
  responsiveQuality: number;
  tier: "utility" | "standard" | "premium" | "luxury";
}

/* -------------------------------------------------------------------------- */
/*  12. Design Knowledge Engine                                               */
/* -------------------------------------------------------------------------- */

/**
 * Storable entry for the Design Knowledge Library.
 * Each analyzed site deposits a DesignKnowledgeEntry that enriches future
 * generation. Deliberately compact (no HTML, no JSX, no copied assets).
 */
export interface DesignKnowledgeEntry {
  id: string;          // sha256(finalUrl)[0..12]
  url: string;
  platform: SourcePlatform;
  analyzedAt: string;  // ISO-8601
  luxuryTier: LuxuryDNA["tier"];
  premiumScore: number;
  visual: VisualDNAV7;
}

/* -------------------------------------------------------------------------- */
/*  V7 VisualDNA — backward-compatible extension                             */
/* -------------------------------------------------------------------------- */

/**
 * VisualDNAV7 extends the existing VisualDNA with richer sub-objects produced
 * by V7's 12 analyzers. Every new field is optional so existing consumers of
 * VisualDNA continue to work without changes.
 */
export interface VisualDNAV7 extends VisualDNA {
  // ── Existing 7 fields (required, inherited) ──────────────────────────────
  // hero, typography, layout, image, component, motion, brand, framer?
  // ── New V7 additions (all optional) ──────────────────────────────────────

  /** Full CSS intelligence from all stylesheets. */
  css?: CSSAnalysis;

  /** Richer typography measurements. */
  typographyV7?: TypographyAnalysis;

  /** Richer layout measurements. */
  layoutV7?: LayoutAnalysis;

  /** Component detection with confidence scores. */
  components?: ComponentDetection;

  /** Rich image analysis. */
  imageV7?: ImageAnalysis;

  /** V7 motion analysis (superset of MotionDNAExtracted). */
  motionV7?: MotionAnalysisV7;

  /** Responsive design analysis. */
  responsive?: ResponsiveAnalysis;

  /** Brand and color palette analysis. */
  brandV7?: BrandAnalysis;

  /** Framer-specific intelligence (extends existing FramerDNA). */
  framerV7?: FramerIntelligence;

  /** Per-section visual composition analysis. */
  composition?: CompositionAnalysis;

  /** Design luxury/premium scoring. */
  luxury?: LuxuryDNA;
}

/* -------------------------------------------------------------------------- */
/*  V7 Pipeline context & result                                              */
/* -------------------------------------------------------------------------- */

/**
 * Inputs shared across all V7 analyzers.
 * Each analyzer receives this and returns its typed output.
 */
export interface V7AnalysisContext {
  rawPage: import("@/lib/scraping/types").RawPage;
  /** Concatenation of all <style> tag contents. */
  inlineCSS: string;
  /** Concatenation of all fetched external stylesheet contents. */
  externalCSS: string;
  /** Combined CSS (inline + external). */
  allCSS: string;
  /** Platform detected from HTML signals. */
  platform: SourcePlatform;
  /** Has Playwright data (computed styles, layout metrics) been populated? */
  hasPlaywrightData: boolean;
}

/**
 * Full V7 pipeline result — extends the existing ExtractionResult shape with
 * V7-specific outputs so no existing bridge code breaks.
 */
export interface V7ExtractionResult {
  /** Same shape as ExtractionResult (V6) — always populated for compatibility. */
  v6Compatible: import("@/lib/extraction/types").ExtractionResult;
  /** V7 visual DNA (superset). Undefined if V7 analysis failed entirely. */
  visualDnaV7?: VisualDNAV7;
  /** Design knowledge entry for the library. */
  knowledgeEntry?: DesignKnowledgeEntry;
  v7Timings?: {
    fetchMs: number;
    cssMs: number;
    typographyMs: number;
    layoutMs: number;
    componentsMs: number;
    motionMs: number;
    compositionMs: number;
    premiumMs: number;
    totalMs: number;
  };
}
