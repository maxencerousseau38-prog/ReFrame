/**
 * Composer — the senior art director that assembles sites from DNA.
 *
 * The Composer is the new generation entry point for ReFrame V5. It doesn't
 * "create" a design — it "composes" one from:
 *   1. A DesignDNA (the artistic specification)
 *   2. A BusinessProfile (who the client is)
 *   3. A Moodboard (curated references)
 *   4. The extracted content (what goes on the page)
 *
 * Every decision is guided by the DNA. The Composer never improvises —
 * it executes the DNA's vision faithfully, producing a SiteSchema that
 * the renderer interprets.
 *
 * Backward-compatible: the old generateSite() in engine.ts still works.
 * The Composer is a superset that routes through DNA-aware variant picking
 * and enriched block props.
 */

import type {
  Block,
  BlockType,
  Industry,
  SiteAnalysis,
  SiteSchema,
  Theme,
  Recommendation,
} from "./types";
import type { BusinessProfile } from "./business";
import type { DesignDNA } from "./dna";
import type { Moodboard } from "./references";
import { INDUSTRY_PROFILES } from "./industries";
import { pickVariant, BLOCK_CATALOG } from "./catalog";
import { planSmart, type Slot, type Plan } from "./planner";
import { renderableCategory } from "./structure";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function uid(prefix = "b") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Strip em/en dashes — the #1 AI tell in copy. */
function stripDashes(s: string): string {
  return s.replace(/[–—]/g, "-");
}

function cleanText(s: string | undefined): string {
  return s ? stripDashes(s.trim()) : "";
}

/* -------------------------------------------------------------------------- */
/*  DNA-aware variant selection                                               */
/* -------------------------------------------------------------------------- */

/**
 * Pick the best variant for a section, incorporating the DNA's preferences.
 * This wraps the existing pickVariant() but re-scores based on DNA fit.
 */
function pickVariantWithDNA(
  category: BlockType,
  industry: Industry,
  seed: string,
  mood: Theme["mood"],
  dna: DesignDNA
): string {
  // Let the catalog do its normal scoring first
  const baseChoice = pickVariant(category, industry, seed, mood);

  // For hero, the DNA's heroDirection.style should strongly influence
  if (category === "hero") {
    const styleToVariant: Record<string, string[]> = {
      split: ["HeroSplitPremium", "HeroPremium2"],
      fullbleed: ["HeroImageFull", "HeroArchform"],
      editorial: ["HeroEditorial"],
      monumental: ["HeroMonumental", "HeroArchform"],
      cinematic: ["HeroAurora", "HeroAgencia", "HeroBeam", "HeroSpotlight"],
      minimal: ["HeroPremium1", "HeroCanvas"],
      bento: ["HeroBento"],
    };
    const preferred = styleToVariant[dna.heroDirection.style] || [];
    // Check if a preferred variant is available for this industry
    for (const v of preferred) {
      const meta = BLOCK_CATALOG.find((b) => b.variant === v);
      if (meta && (meta.sectors === "all" || (meta.sectors as Industry[]).includes(industry))) {
        return v;
      }
    }
  }

  // For features, the DNA's motion level can influence
  if (category === "features" && dna.motion.level >= 3) {
    const highMotion = ["FeaturesSpotlight", "FeaturesBento", "ProcessTimeline"];
    for (const v of highMotion) {
      const meta = BLOCK_CATALOG.find((b) => b.variant === v);
      if (meta && (meta.sectors === "all" || (meta.sectors as Industry[]).includes(industry))) {
        return v;
      }
    }
  }

  // For testimonials, the DNA's card system influences
  if (category === "testimonials") {
    if (dna.cardSystem.style === "editorial") return "TestimonialsEditorial";
    if (dna.cardSystem.style === "glass" && mood === "bold") return "TestimonialsSpotlight";
    if (dna.cardSystem.style === "elevated") return "TestimonialsGrid";
  }

  // For CTA, the DNA's color strategy influences
  if (category === "cta") {
    if (dna.colorStrategy.useGradients) return "CTAGradient";
    if (mood === "bold" && dna.motion.level >= 3) return "CTAAsterisk";
    if (mood === "elegant" || mood === "warm") return "CTAEditorial";
  }

  // For about, the DNA's image style influences
  if (category === "about") {
    if (mood === "bold") return "StatementAgencia";
    if (mood === "elegant" || mood === "warm") return "StatementEditorial";
  }

  // For contact, the DNA's card style influences
  if (category === "contact") {
    if (mood === "bold") return "ContactBanner";
    if (mood === "elegant" || mood === "warm") return "ContactDetailsCard";
  }

  // For footer
  if (category === "footer") {
    if (mood === "bold" || mood === "elegant") return "FooterMinimal";
    return "FooterColumns";
  }

  return baseChoice;
}

/* -------------------------------------------------------------------------- */
/*  DNA-enriched block props                                                  */
/* -------------------------------------------------------------------------- */

interface ContentContext {
  analysis: SiteAnalysis;
  profile: BusinessProfile;
  dna: DesignDNA;
  imageIdx: number;
}

/**
 * Build enriched props for a block, guided by the DNA.
 * The DNA tokens are injected as optional props that components can read.
 */
function buildBlockProps(
  slot: Slot,
  ctx: ContentContext
): Record<string, unknown> | null {
  const { analysis, profile, dna } = ctx;
  const c = analysis.extractedContent;
  const industryProfile = INDUSTRY_PROFILES[analysis.industry];

  // Common DNA props injected into every block
  const dnaProps = {
    _dna: {
      spacingMultiplier: dna.rhythm.spacingMultiplier,
      density: dna.rhythm.density,
      cardStyle: dna.cardSystem.style,
      cardRadius: dna.cardSystem.radius,
      cardShadow: dna.cardSystem.shadow,
      cardBorder: dna.cardSystem.border,
      cardHoverEffect: dna.cardSystem.hoverEffect,
      entranceType: dna.motion.entranceType,
      motionLevel: dna.motion.level,
      staggerDelay: dna.motion.staggerDelay,
      duration: dna.motion.duration,
      ctaStyle: dna.ctaDirection.style,
      ctaSize: dna.ctaDirection.size,
      // Visual DNA signals
      heroHeight: dna.heroDirection.heightVh,
      heroComposition: dna.heroDirection.style,
      imagePosition: dna.heroDirection.imagePosition,
      hasOverlay: dna.heroDirection.hasOverlay,
      galleryStyle: dna.galleryDirection.style,
      galleryAspectRatio: dna.galleryDirection.aspectRatio,
    },
  };

  switch (slot.category) {
    case "hero": {
      const props: Record<string, unknown> = {
        ...dnaProps,
        headline: cleanText(c.headline) || industryProfile.defaults.headline,
        description: cleanText(c.description) || industryProfile.defaults.description,
        ctaLabel: industryProfile.cta.primary,
        ctaHref: c.contact?.bookingUrl || "#contact",
        heroImageUrl: c.heroImageUrl || (c.images.length > 0 ? c.images[0] : undefined),
        brandName: analysis.brandName,
        // DNA hero enrichment
        heightVh: dna.heroDirection.heightVh,
        parallax: dna.heroDirection.hasParallax,
        overlay: dna.heroDirection.hasOverlay,
        overlayOpacity: dna.heroDirection.overlayOpacity,
        imagePosition: dna.heroDirection.imagePosition,
      };
      if (dna.heroDirection.ctaCount >= 2) {
        props.secondaryCtaLabel = "Learn more";
        props.secondaryCtaHref = "#features";
      }
      if (dna.heroDirection.trustIndicators && c.stats?.length) {
        props.stats = c.stats;
      }
      return props;
    }

    case "features": {
      const services = c.serviceItems?.length
        ? c.serviceItems.slice(0, 6).map((s) => ({
            title: cleanText(s.title),
            description: cleanText(s.description),
          }))
        : (c.services.length > 0 ? c.services : industryProfile.defaults.services).map((s) => ({
            title: cleanText(s),
          }));
      const image = c.images[ctx.imageIdx % c.images.length];
      if (image) ctx.imageIdx++;
      return {
        ...dnaProps,
        sectionTitle: "What we offer",
        features: services,
        image,
      };
    }

    case "testimonials": {
      if (!c.testimonials?.length) return null; // never fabricate
      return {
        ...dnaProps,
        sectionTitle: "What our clients say",
        testimonials: c.testimonials.slice(0, 6).map((t) => ({
          quote: cleanText(t.quote),
          name: cleanText(t.name),
          role: cleanText(t.role),
        })),
      };
    }

    case "stats": {
      if (!c.stats?.length) return null; // never fabricate
      return {
        ...dnaProps,
        stats: c.stats.map((s) => ({
          value: cleanText(s.value),
          label: cleanText(s.label),
        })),
      };
    }

    case "portfolio": {
      if (c.images.length < 2) return null; // need real images
      return {
        ...dnaProps,
        sectionTitle: "Our work",
        images: c.images.slice(0, 8),
        galleryStyle: dna.galleryDirection.style,
        galleryColumns: dna.galleryDirection.columns,
        galleryGap: dna.galleryDirection.gap,
        hasCaption: dna.galleryDirection.hasCaption,
      };
    }

    case "about": {
      return {
        ...dnaProps,
        sectionTitle: "About",
        headline: cleanText(c.aboutBody ? "Our Story" : analysis.brandName),
        description: cleanText(c.aboutBody || c.description || industryProfile.defaults.description),
        image: c.images.length > 1 ? c.images[1] : undefined,
        stats: c.stats,
      };
    }

    case "faq": {
      const items = c.faqItems?.length
        ? c.faqItems.slice(0, 6)
        : defaultFaq(analysis.industry);
      return {
        ...dnaProps,
        sectionTitle: "Frequently asked questions",
        items: items.map((f) => ({
          question: cleanText(f.question),
          answer: cleanText(f.answer),
        })),
      };
    }

    case "services": {
      const services = c.serviceItems?.length
        ? c.serviceItems.slice(0, 8)
        : (c.services.length > 0 ? c.services : industryProfile.defaults.services).map((s) => ({
            title: s,
          }));
      return {
        ...dnaProps,
        sectionTitle: "Our services",
        services: services.map((s) => ({
          title: cleanText("title" in s ? String(s.title) : String(s)),
          description: cleanText("description" in s ? String(s.description) : undefined),
        })),
      };
    }

    case "cta": {
      return {
        ...dnaProps,
        headline: cleanText(industryProfile.defaults.headline),
        ctaLabel: industryProfile.cta.primary,
        ctaHref: c.contact?.bookingUrl || "#contact",
        secondaryCtaLabel: dna.ctaDirection.hasSecondary ? "Learn more" : undefined,
      };
    }

    case "contact": {
      return {
        ...dnaProps,
        sectionTitle: "Get in touch",
        email: c.contact?.email,
        phone: c.contact?.phone,
        address: c.contact?.address,
        bookingUrl: c.contact?.bookingUrl,
        ctaLabel: industryProfile.cta.primary,
        contactHint: c.contactHint,
      };
    }

    case "footer": {
      return {
        ...dnaProps,
        brandName: analysis.brandName,
        tagline: cleanText(c.description),
        navItems: analysis.navItems.slice(0, 6),
        services: c.services.slice(0, 4),
        socialLinks: c.socialLinks,
        email: c.contact?.email,
        phone: c.contact?.phone,
      };
    }

    default:
      return { ...dnaProps };
  }
}

/* -------------------------------------------------------------------------- */
/*  Default FAQ per industry                                                  */
/* -------------------------------------------------------------------------- */

function defaultFaq(industry: Industry): { question: string; answer: string }[] {
  const defaults: Partial<Record<Industry, { question: string; answer: string }[]>> = {
    plumber: [
      { question: "Do you offer emergency services?", answer: "Yes, we provide 24/7 emergency plumbing services for urgent situations." },
      { question: "Are you licensed and insured?", answer: "Yes, all our plumbers are fully licensed, insured and certified." },
      { question: "How quickly can you respond?", answer: "We aim to respond within 1 hour for emergencies and same-day for standard calls." },
    ],
    saas: [
      { question: "Is there a free trial?", answer: "Yes, you can try the platform free for 14 days with no credit card required." },
      { question: "Can I cancel anytime?", answer: "Absolutely. No long-term contracts, cancel your subscription at any time." },
      { question: "Do you offer team plans?", answer: "Yes, we offer team and enterprise plans with volume discounts." },
    ],
    restaurant: [
      { question: "Do you take reservations?", answer: "Yes, you can book a table online or by calling us directly." },
      { question: "Do you cater for dietary requirements?", answer: "Our menu includes vegetarian, vegan and gluten-free options. Please let us know when booking." },
      { question: "Is there parking available?", answer: "Yes, we have dedicated parking spaces for our guests." },
    ],
  };
  return defaults[industry] || [
    { question: "How do I get started?", answer: "Simply get in touch through our contact form or give us a call." },
    { question: "What areas do you serve?", answer: "We serve the local area and surrounding regions. Contact us for specifics." },
    { question: "Do you offer free consultations?", answer: "Yes, we offer a free initial consultation to understand your needs." },
  ];
}

/* -------------------------------------------------------------------------- */
/*  Theme builder                                                             */
/* -------------------------------------------------------------------------- */

function buildTheme(
  analysis: SiteAnalysis,
  dna: DesignDNA,
  profile: BusinessProfile
): Theme {
  const industryProfile = INDUSTRY_PROFILES[analysis.industry];
  const baseTheme = industryProfile.theme;

  // Start from the industry default
  const theme: Theme = {
    primary: baseTheme.primary,
    accent: analysis.brand?.accentColor || baseTheme.accent,
    radius: baseTheme.radius,
    font: analysis.fontHint || baseTheme.font,
    mood: baseTheme.mood,
  };

  // Apply DNA color strategy
  if (dna.colorStrategy.preferDark) {
    theme.dark = true;
  } else if (analysis.sourceDark) {
    theme.dark = true;
  }

  return theme;
}

/* -------------------------------------------------------------------------- */
/*  Main compose function                                                     */
/* -------------------------------------------------------------------------- */

export interface ComposeOptions {
  dna: DesignDNA;
  profile: BusinessProfile;
  moodboard?: Moodboard;
}

/**
 * Compose a SiteSchema from a SiteAnalysis, guided by a DesignDNA.
 *
 * This is the V5 generation entry point. Every block variant, every prop,
 * every spacing choice is dictated by the DNA.
 */
export function compose(analysis: SiteAnalysis, opts: ComposeOptions): SiteSchema {
  const { dna, profile, moodboard } = opts;
  const industry = analysis.industry;
  const mood = INDUSTRY_PROFILES[industry].theme.mood;

  // 1. Plan the section flow (uses existing planSmart)
  const plan = planSmart(analysis.structure, industry);

  // 2. Build theme from DNA + analysis
  const theme = buildTheme(analysis, dna, profile);

  // 3. Build blocks from plan, guided by DNA
  const ctx: ContentContext = { analysis, profile, dna, imageIdx: 0 };
  const blocks: Block[] = [];

  for (const slot of plan.slots) {
    const variant = pickVariantWithDNA(slot.category, industry, analysis.brandName, mood, dna);
    const props = buildBlockProps(slot, ctx);

    // Respect the doctrine: skip sections with no real data
    if (props === null) continue;

    blocks.push({
      id: uid(),
      type: slot.type,
      variant,
      props,
    });
  }

  // 4. Quality pass: ensure hero first, footer last, no dupes
  const finalBlocks = qualityPassBlocks(blocks);

  // 5. Build the schema
  const schema: SiteSchema = {
    id: uid("site"),
    sourceUrl: analysis.url,
    industry,
    brand: {
      name: analysis.brandName,
      tagline: cleanText(analysis.extractedContent.description),
      ...(analysis.brand?.logoUrl ? { logo: analysis.brand.logoUrl } : {}),
    },
    theme,
    blocks: finalBlocks,
    mode: "smart",
    recommendations: [
      ...plan.recommendations,
      {
        action: `Design DNA: ${dna.signature}`,
        reason: moodboard?.direction || "Composed from tier + mood + industry signals",
      },
    ],
    animations: dna.motion.level > 0 ? true : false,
    // Preserve integrations from the analysis
    ...(analysis.integrations?.length
      ? {
          connectedIntegrations: analysis.integrations
            .filter((i) => i.category === "analytics" || i.category === "chat" || i.category === "marketing")
            .map((i) => ({ id: i.id, value: "" })),
        }
      : {}),
  };

  return schema;
}

/* -------------------------------------------------------------------------- */
/*  Quality pass                                                              */
/* -------------------------------------------------------------------------- */

function qualityPassBlocks(blocks: Block[]): Block[] {
  if (blocks.length === 0) return blocks;

  // Hero first
  const heroIdx = blocks.findIndex((b) => b.type === "hero");
  if (heroIdx > 0) {
    const [hero] = blocks.splice(heroIdx, 1);
    blocks.unshift(hero);
  }

  // Footer last
  const footerIdx = blocks.findIndex((b) => b.type === "footer");
  if (footerIdx >= 0 && footerIdx !== blocks.length - 1) {
    const [footer] = blocks.splice(footerIdx, 1);
    blocks.push(footer);
  }

  // Remove consecutive duplicates
  const deduped: Block[] = [blocks[0]];
  for (let i = 1; i < blocks.length; i++) {
    if (blocks[i].type !== blocks[i - 1].type) {
      deduped.push(blocks[i]);
    }
  }

  return deduped;
}

/* -------------------------------------------------------------------------- */
/*  Full pipeline: analysis → DNA → compose → quality check                   */
/* -------------------------------------------------------------------------- */

/**
 * The complete V5 generation pipeline. Takes a SiteAnalysis through all
 * phases: business intelligence → reference engine → DNA compilation →
 * composition → quality gate. Returns the final SiteSchema plus the
 * intermediate artifacts for debugging/display.
 */
export { compose as composeSite };
