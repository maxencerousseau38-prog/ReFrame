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
  | "footer";

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
