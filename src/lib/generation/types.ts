/**
 * Core data model for ReFrame.
 *
 * A generated site is a `SiteSchema`: ordered, typed UI blocks plus a theme.
 * The generation engine never produces free-form markup — it only selects and
 * configures blocks from a fixed library, which keeps every output coherent.
 */

export type Industry =
  | "restaurant"
  | "artisan" // trades: plumber, electrician, builder...
  | "realestate"
  | "saas"
  | "agency"
  | "ecommerce"
  | "health"
  | "generic";

export type BlockType =
  | "hero"
  | "features"
  | "testimonials"
  | "faq"
  | "cta"
  | "contact"
  | "footer"
  // Extended taxonomy (additive). The structure engine can detect these; the
  // composer maps any type without a dedicated component yet to the closest
  // renderable variant until the premium catalog wave lands.
  | "about"
  | "services"
  | "portfolio"
  | "products"
  | "pricing"
  | "gallery"
  | "logos"
  | "stats";

/** How the generator decides the output structure. */
export type GenerationMode = "classic" | "preserve" | "smart";

/** One section detected on the source site, normalized to our taxonomy. */
export interface DetectedSection {
  type: BlockType;
  order: number;
  /** 0..1 confidence in the classification. */
  confidence: number;
  /** Raw heading/label that produced this detection, for tracing. */
  label?: string;
}

/** Normalized structural model of the source site. */
export interface SiteStructure {
  sections: DetectedSection[];
  nav: string[];
}

/** A Smart-mode optimization applied (or suggested) to the structure. */
export interface Recommendation {
  action: string;
  reason: string;
}

/** A block is `type` + a chosen `variant` + content `props`. */
export interface Block<T = Record<string, unknown>> {
  id: string;
  type: BlockType;
  variant: string;
  props: T;
}

export interface Theme {
  primary: string; // hex
  accent: string; // hex
  radius: "sm" | "md" | "lg" | "xl";
  font: "inter" | "geist" | "serif";
  mood: "minimal" | "bold" | "warm" | "elegant";
  /**
   * Optional surface palette. When omitted, blocks derive sensible values from
   * `mood` so the section background adapts to the brand instead of defaulting
   * to flat white. Lets a warm/elegant brand read as a warm off-white canvas.
   */
  surface?: string; // hex — section canvas
  surface2?: string; // hex — cards / secondary panels
  ink?: string; // hex — body text on the surface
}

export interface SiteSchema {
  id: string;
  sourceUrl: string;
  industry: Industry;
  brand: {
    name: string;
    tagline: string;
  };
  theme: Theme;
  blocks: Block[];
  /** Which mode produced this schema. Defaults to the engine default. */
  mode?: GenerationMode;
  /** Smart-mode optimizations applied, for display in the UI. */
  recommendations?: Recommendation[];
}

/** Result of analyzing an existing website. */
export interface SiteAnalysis {
  url: string;
  brandName: string;
  industry: Industry;
  industryLabel: string;
  /** True when we fetched and parsed real HTML; false when we used a fallback. */
  fetched: boolean;
  /** Real brand assets pulled from the source page, when available. */
  brand?: {
    logoUrl?: string;
    accentColor?: string; // hex
  };
  detectedSections: string[];
  /** Normalized structural model, when the page could be analyzed. */
  structure?: SiteStructure;
  navItems: string[];
  extractedContent: {
    headline: string;
    description: string;
    services: string[];
    heroImageUrl?: string;
    images: string[];
    contactHint?: string;
  };
  scores: {
    design: number;
    performance: number;
    seo: number;
    mobile: number;
    accessibility: number;
  };
  issues: string[];
}
