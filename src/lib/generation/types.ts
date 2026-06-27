/**
 * Core data model for ReFrame.
 *
 * A generated site is a `SiteSchema`: ordered, typed UI blocks plus a theme.
 * The generation engine never produces free-form markup — it only selects and
 * configures blocks from a fixed library, which keeps every output coherent.
 */

export type Industry =
  | "restaurant"
  | "artisan" // general trades not covered by a dedicated sector
  | "realestate"
  | "saas"
  | "agency"
  | "ecommerce"
  | "health" // wellness, spa, therapy
  | "hotel"
  | "architect"
  | "lawyer"
  | "gym"
  | "coach"
  | "plumber"
  | "electrician"
  | "construction"
  | "finance"
  | "fashion"
  | "automotive"
  | "medical" // clinics, doctors, dentists
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
  | "stats"
  | "team"
  | "emergency"
  | "process"
  | "before-after"
  | "booking"
  | "map"
  | "schedule"
  | "newsletter";

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
  font: "inter" | "geist" | "serif" | "manrope" | "space-grotesk";
  mood: "minimal" | "bold" | "warm" | "elegant";
  /** Dark colour scheme. Off (light) by default; the AI editor can toggle it. */
  dark?: boolean;
  /**
   * Optional surface palette. When omitted, blocks derive sensible values from
   * `mood` so the section background adapts to the brand instead of defaulting
   * to flat white. Lets a warm/elegant brand read as a warm off-white canvas.
   */
  surface?: string; // hex — section canvas
  surface2?: string; // hex — cards / secondary panels
  ink?: string; // hex — body text on the surface
}

/** An additional page beyond the home page (Services, About, Contact...). */
export interface SitePage {
  /** URL-ish path segment, e.g. "services". Home is not represented here. */
  path: string;
  label: string;
  blocks: Block[];
}

export interface SiteSchema {
  id: string;
  sourceUrl: string;
  industry: Industry;
  brand: {
    name: string;
    tagline: string;
    /** Real logo image URL pulled from the source site, when found. The nav
     *  renders it with the wordmark (brand name) as a fallback. */
    logo?: string;
  };
  theme: Theme;
  /** The home page's blocks. */
  blocks: Block[];
  /** Additional pages. When present, the site renders as multi-page (Home + these). */
  pages?: SitePage[];
  /** Which mode produced this schema. Defaults to the engine default. */
  mode?: GenerationMode;
  /**
   * Reconnected third-party tools: the customer's IDs for tools detected on
   * their old site (GA4, GTM, Meta Pixel, Calendly, Crisp, Intercom). The
   * published pages re-inject the real vendor snippets from these, after strict
   * validation, so analytics/chat/booking keep working post-rebuild.
   */
  connectedIntegrations?: { id: string; value: string }[];
  /** Smart-mode optimizations applied, for display in the UI. */
  recommendations?: Recommendation[];
  /**
   * Whether the rendered site plays entrance/scroll/hover motion. Defaults to
   * on (undefined === true); the client can switch it off from the AI editor
   * ("remove the animations") and back on again.
   */
  animations?: boolean;
}

/** Result of analyzing an existing website. */
export type IntegrationCategory =
  | "payments"
  | "scheduling"
  | "analytics"
  | "marketing"
  | "chat"
  | "crm"
  | "booking";

export interface DetectedIntegration {
  id: string;
  name: string;
  category: IntegrationCategory;
  /** What to do about it when republishing on ReFrame. */
  hint: string;
}

export interface SiteAnalysis {
  url: string;
  brandName: string;
  industry: Industry;
  industryLabel: string;
  /** True when we fetched and parsed real HTML; false when we used a fallback. */
  fetched: boolean;
  /**
   * How much of the analysis is real vs. inferred:
   *  - "full": read the page's real content,
   *  - "partial": page was thin/JS-rendered, rebuilt from metadata + defaults,
   *  - "fallback": couldn't fetch at all, used a domain-derived profile.
   */
  confidence?: "full" | "partial" | "fallback";
  /** Human-readable note when the read was incomplete, for honest UI. */
  notice?: string;
  /**
   * True when the source site presents as dark (declared color-scheme or a dark
   * canvas). Used to default the rebuilt theme to dark, preserving identity.
   */
  sourceDark?: boolean;
  /** "serif" when the source site is serif-led, to preserve its type character. */
  fontHint?: Theme["font"];
  /**
   * Per-asset extraction confidence (0–1) — how sure we are we read each thing
   * correctly. Surfaced internally (never hidden) so the recovery flow can ask
   * the owner only for the low-confidence pieces, never fabricating them.
   */
  assetConfidence?: {
    logo: number;
    images: number;
    colors: number;
    text: number;
    structure: number;
  };
  /** Real brand assets pulled from the source page, when available. */
  brand?: {
    logoUrl?: string;
    accentColor?: string; // hex
  };
  detectedSections: string[];
  /**
   * Third-party business tools detected on the source page (payments, booking,
   * analytics, chat, marketing). Rebuilding the site drops the original embeds,
   * so these MUST be surfaced before publish to avoid silently breaking the
   * customer's business. Real detections only.
   */
  integrations?: DetectedIntegration[];
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
    /**
     * Real prose pulled from the source page so the rebuild reuses the client's
     * own words instead of generic copy. `aboutBody` is the real "about"/story
     * paragraph; `serviceItems` are real service headings with their real
     * descriptions. Both optional - absent when nothing solid was extracted.
     */
    aboutBody?: string;
    serviceItems?: { title: string; description?: string }[];
    /**
     * Real social proof / metrics, only when genuinely extracted (or provided
     * by the user via the hybrid flow). We never fabricate these: a testimonials
     * or stats section is rendered only when real data is present.
     */
    testimonials?: { quote: string; name: string; role?: string }[];
    /** Real FAQ pulled from the page; the FAQ block uses it over the default. */
    faqItems?: { question: string; answer: string }[];
    /** Real social profile links pulled from the page, for the footer. */
    socialLinks?: { platform: string; url: string }[];
    /** Real team members (name + role + photo + bio), when the page lists them. */
    team?: { name: string; role?: string; image?: string; bio?: string }[];
    stats?: { value: string; label: string }[];
    /**
     * Real business contact details (user-provided via the hybrid flow). Power
     * the working contact form recipient and the Call / Directions / Book
     * action buttons. Rendered only when present.
     */
    contact?: { phone?: string; email?: string; address?: string; bookingUrl?: string };
    /**
     * An owner-managed collection (menu / price list / service catalogue),
     * rendered as a dedicated page. Real content only - never fabricated.
     */
    collection?: { items: { name: string; price?: string; description?: string }[] };
    /**
     * Real products scraped from the page (JSON-LD Product / repeated product
     * cards): the client's actual catalogue, kept and modernized rather than
     * dropped. Each is real - never fabricated.
     */
    products?: { name: string; price?: string; image?: string; url?: string }[];
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
