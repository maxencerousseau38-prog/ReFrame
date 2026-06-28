import type { SiteAnalysis, Industry, DetectedSection, SiteStructure } from "@/lib/generation/types";
import type { ExtractionResult } from "./types";
import { INDUSTRY_PROFILES, detectIndustry } from "@/lib/generation/industries";

export function toSiteAnalysis(ext: ExtractionResult): SiteAnalysis {
  const profile = INDUSTRY_PROFILES[ext.business.industry] ?? INDUSTRY_PROFILES.generic;

  const sections: DetectedSection[] = ext.sections.order.map((s, i) => ({
    type: s.type as DetectedSection["type"],
    order: i,
    confidence: s.confidence,
    label: s.heading,
  }));

  const structure: SiteStructure = {
    sections,
    nav: ext.navigation.items.map((n) => n.label),
  };

  const scores = {
    design: scoreFromQuality(ext.quality.score, 52, 70),
    performance: scoreFromQuality(ext.quality.score, 40, 80),
    seo: scoreFromQuality(ext.quality.completeness, 60, 92),
    mobile: scoreFromQuality(ext.quality.hierarchy, 65, 90),
    accessibility: scoreFromQuality(ext.quality.score, 60, 90),
  };

  const issues: string[] = [];
  if (!ext.content.headline) issues.push("No headline found");
  if (!ext.images.hero) issues.push("No hero image found");
  if (ext.quality.duplication < 80) issues.push("Content duplication detected");
  if (!ext.business.contact?.email && !ext.business.contact?.phone)
    issues.push("No contact information found");

  return {
    url: ext.source.url,
    brandName: ext.business.name,
    industry: ext.business.industry,
    industryLabel: ext.business.industryLabel,
    fetched: ext.source.fetched,
    confidence: ext.quality.confidence === "fallback" ? "partial" : ext.quality.confidence,
    notice: ext.quality.notice,
    sourceDark: ext.source.dark,
    fontHint: fontHintFromTokens(ext.tokens.typography.headingFont),
    assetConfidence: ext.quality.assetConfidence,
    brand: {
      logoUrl: ext.images.logo,
      accentColor: ext.tokens.colors.accent || ext.tokens.colors.primary,
    },
    detectedSections: ext.sections.order.map(
      (s) => s.heading || s.type
    ),
    integrations: ext.integrations.length ? ext.integrations : undefined,
    structure,
    navItems: ext.navigation.items.map((n) => n.label),
    extractedContent: {
      headline: ext.content.headline || profile.defaults.headline,
      description: ext.content.description || profile.defaults.description,
      services: ext.content.services?.map((s) => s.title) ?? profile.defaults.services,
      heroImageUrl: ext.images.hero,
      images: ext.images.gallery,
      contactHint: ext.business.contact ? "Contact found" : undefined,
      contact: ext.business.contact,
      stats: ext.content.stats,
      testimonials: ext.content.testimonials,
      faqItems: ext.content.faqItems,
      socialLinks: ext.business.socialLinks,
      collection: ext.content.collection,
      team: ext.content.team,
      products: ext.content.products,
      aboutBody: ext.content.aboutBody,
      serviceItems: ext.content.services,
    },
    scores,
    issues,
  };
}

function scoreFromQuality(q: number, lo: number, hi: number): number {
  return Math.round(lo + (q / 100) * (hi - lo));
}

function fontHintFromTokens(
  headingFont: string | undefined
): "inter" | "geist" | "serif" | "manrope" | "space-grotesk" | undefined {
  if (!headingFont) return undefined;
  const lower = headingFont.toLowerCase();
  if (/serif|playfair|merriweather|lora|georgia|cormorant|garamond|baskerville/i.test(lower))
    return "serif";
  if (/manrope/i.test(lower)) return "manrope";
  if (/space.?grotesk/i.test(lower)) return "space-grotesk";
  if (/geist/i.test(lower)) return "geist";
  return undefined;
}
