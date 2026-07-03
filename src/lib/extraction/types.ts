import type { Industry, DetectedIntegration } from "@/lib/generation/types";
import type { HTMLElement } from "node-html-parser";

// ---------------------------------------------------------------------------
// Visual DNA — deterministic measurements of artistic decisions
// ---------------------------------------------------------------------------

export interface HeroDNA {
  viewportOccupation: number;
  imageRatio: "landscape" | "portrait" | "square" | null;
  imagePosition: "behind" | "right" | "left" | "below" | "none";
  textAlignment: "left" | "center" | "right";
  headlineWordCount: number;
  hasOverlay: boolean;
  layering: "flat" | "overlapping" | "stacked";
  compositionType: "split" | "fullbleed" | "editorial" | "minimal" | "cinematic";
  ctaCount: number;
  ctaPlacement: "below-headline" | "inline" | "bottom";
  visualWeight: "image-heavy" | "text-heavy" | "balanced";
}

export interface TypographyDNA {
  headingFont: string | null;
  bodyFont: string | null;
  accentFont: string | null;
  editorialScale: "compact" | "modern" | "editorial" | "bold";
  headingWeight: number | null;
  uppercaseUsage: "none" | "nav-only" | "headings" | "extensive";
  trackingTight: boolean;
  fontHierarchyDepth: number;
  textDensity: "sparse" | "moderate" | "dense";
}

export interface LayoutDNA {
  containerWidth: number | null;
  columnCount: number;
  asymmetry: boolean;
  sectionCount: number;
  spacingScale: "tight" | "standard" | "generous" | "editorial";
  verticalSpacing: number | null;
  alignmentPhilosophy: "centered" | "left-aligned" | "mixed";
  overlapPatterns: boolean;
  sectionRhythm: string[];
}

export interface ImageDNA {
  dominantAspectRatio: "landscape" | "portrait" | "square" | "mixed";
  fullscreenUsage: boolean;
  galleryRhythm: "grid" | "masonry" | "strip" | "editorial" | "single";
  backgroundTreatment: "none" | "overlay" | "blur" | "duotone";
  imageCount: number;
  heroImagePresent: boolean;
  portfolioStyle: "cards" | "fullbleed" | "editorial" | null;
}

export interface ComponentDNA {
  cardRadius: number | null;
  cardBorder: "none" | "hairline" | "solid";
  cardShadow: "none" | "subtle" | "elevated" | "dramatic";
  iconStyle: "line" | "filled" | "none" | null;
  ctaStyle: "pill" | "sharp" | "ghost" | "text-arrow";
  ctaCount: number;
  badgeLanguage: "rounded" | "pill" | "none";
  dividerUsage: boolean;
}

export interface MotionDNAExtracted {
  animationIntensity: 0 | 1 | 2 | 3;
  entranceAnimations: string[];
  scrollAnimations: boolean;
  parallaxDetected: boolean;
  hoverBehavior: string[];
  interactionPhilosophy: "restrained" | "playful" | "cinematic";
  staggerDetected: boolean;
  transitionDuration: number | null;
}

export interface BrandDNA {
  luxuryScore: number;
  modernityScore: number;
  editorialScore: number;
  minimalismScore: number;
  visualDensity: "sparse" | "moderate" | "dense";
  premiumScore: number;
  emotionalDirection: "warm" | "cool" | "neutral";
  personality: string[];
  surfaceColor: string | null;
  inkColor: string | null;
  accentColor: string | null;
  isDark: boolean;
}

export interface FramerDNA {
  sectionIdentities: { name: string; type: string }[];
  componentNames: string[];
  responsiveVariants: number;
  richTextContainers: number;
  namedSections: string[];
  layoutHints: { section: string; columns: number }[];
}

export interface VisualDNA {
  hero: HeroDNA;
  typography: TypographyDNA;
  layout: LayoutDNA;
  image: ImageDNA;
  component: ComponentDNA;
  motion: MotionDNAExtracted;
  brand: BrandDNA;
  framer?: FramerDNA;
}

export type SourcePlatform =
  | "framer"
  | "webflow"
  | "wordpress"
  | "shopify"
  | "squarespace"
  | "wix"
  | "custom";

export interface ExtractionResult {
  source: {
    url: string;
    platform?: SourcePlatform;
    dark?: boolean;
    fetched: boolean;
  };

  business: {
    name: string;
    tagline: string;
    description: string;
    industry: Industry;
    industryLabel: string;
    contact?: {
      phone?: string;
      email?: string;
      address?: string;
      bookingUrl?: string;
    };
    socialLinks?: { platform: string; url: string }[];
  };

  tokens: {
    colors: {
      primary?: string;
      accent?: string;
      surface?: string;
      ink?: string;
    };
    typography: {
      headingFont?: string;
      bodyFont?: string;
      scale?: number[];
      weights?: number[];
    };
    spacing: {
      base?: number;
      scale?: number[];
    };
    radii: number[];
    shadows?: string[];
    breakpoints?: number[];
    containerWidth?: number;
  };

  motion: {
    level: 0 | 1 | 2 | 3;
    reveals?: string[];
    stagger?: number;
    parallax?: boolean;
    hoverEffects?: string[];
    transitions?: {
      property: string;
      duration: number;
      easing: string;
    }[];
  };

  content: {
    headline: string;
    description: string;
    /** ISO 639-1 language of the source content (V2 Chantier 3). */
    language?: string;
    /** The site's real primary call-to-action copy (V2 Chantier 3). */
    primaryCtaLabel?: string;
    aboutBody?: string;
    services?: { title: string; description?: string }[];
    projects?: {
      title: string;
      description?: string;
      image?: string;
      category?: string;
    }[];
    testimonials?: { quote: string; name: string; role?: string }[];
    faqItems?: { question: string; answer: string }[];
    stats?: { value: string; label: string }[];
    team?: {
      name: string;
      role?: string;
      image?: string;
      bio?: string;
    }[];
    products?: {
      name: string;
      price?: string;
      image?: string;
      url?: string;
    }[];
    collection?: {
      items: { name: string; price?: string; description?: string }[];
    };
  };

  images: {
    hero?: string;
    logo?: string;
    gallery: string[];
    backgrounds?: string[];
  };

  navigation: {
    items: { label: string; path: string; isAnchor: boolean }[];
    pages?: { path: string; label: string }[];
  };

  sections: {
    order: { type: string; heading?: string; confidence: number }[];
    hasHero: boolean;
    hasContact: boolean;
    hasFooter: boolean;
  };

  integrations: DetectedIntegration[];

  visualDna?: VisualDNA;

  quality: {
    score: number;
    completeness: number;
    consistency: number;
    duplication: number;
    hierarchy: number;
    mediaRecovery: number;
    businessUnderstanding: number;
    confidence: "full" | "partial" | "fallback";
    notice?: string;
    assetConfidence: {
      logo: number;
      images: number;
      colors: number;
      text: number;
      structure: number;
    };
    passes: number;
  };
}

export interface FramerSection {
  name: string;
  type: string;
  element: HTMLElement;
}

export interface PassContext {
  url: string;
  html: string;
  root: HTMLElement;
  bodyText: string;
  platform: SourcePlatform;
  result: Partial<ExtractionResult>;
  framerSections?: FramerSection[];
}

export interface PassResult {
  updates: Partial<ExtractionResult>;
}
