import type { Industry, DetectedIntegration } from "@/lib/generation/types";
import type { HTMLElement } from "node-html-parser";

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

export interface PassContext {
  url: string;
  html: string;
  root: HTMLElement;
  bodyText: string;
  platform: SourcePlatform;
  result: Partial<ExtractionResult>;
}

export interface PassResult {
  updates: Partial<ExtractionResult>;
}
