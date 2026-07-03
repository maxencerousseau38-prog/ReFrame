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
import type { ArtDirection } from "./art-direction";
import { INDUSTRY_PROFILES } from "./industries";
import { pickVariant, BLOCK_CATALOG } from "./catalog";
import { planSmart, type Slot, type Plan } from "./planner";
import { renderableCategory } from "./structure";
import { label } from "./labels";
import { buildContentModel, realHeading, type ContentModel } from "@/lib/understand/content-model";

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
  artDirection?: ArtDirection;
  imageIdx: number;
  /** Real content per scene (V2 Chantier 3) — real headings always win. */
  model: ContentModel;
}

/**
 * Build enriched props for a block, guided by the DNA.
 * The DNA tokens are injected as optional props that components can read.
 */
function buildBlockProps(
  slot: Slot,
  ctx: ContentContext
): Record<string, unknown> | null {
  const { analysis, profile, dna, model } = ctx;
  const c = analysis.extractedContent;
  const industryProfile = INDUSTRY_PROFILES[analysis.industry];
  const lang = c.language;
  // Real heading from the source site first; localized generated label only
  // as a fallback (V2 Chantier 3 — content is preserved, never replaced).
  // features/services are one content family: a slot of either category may
  // be fed by a scene detected as the other, so both headings are consulted.
  const CATEGORY_ALIASES: Record<string, string[]> = {
    features: ["features", "services"],
    services: ["services", "features"],
    portfolio: ["portfolio", "gallery"],
    gallery: ["gallery", "portfolio"],
  };
  const title = (category: string, key: Parameters<typeof label>[0]): string => {
    for (const cat of CATEGORY_ALIASES[category] ?? [category]) {
      const real = cleanText(realHeading(model, cat));
      if (real) return real;
    }
    return label(key, lang);
  };
  const primaryCta = cleanText(c.ctaLabel) || industryProfile.cta.primary;

  const { artDirection: ad } = ctx;
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
      // Art Direction signals
      ...(ad ? {
        pageStorytelling: ad.pageStorytelling,
        sectionRhythm: ad.sectionRhythm,
        editorialFlow: ad.editorialFlow,
        whitespaceStrategy: ad.whitespaceStrategy,
        compositionStyle: ad.compositionStyle,
        asymmetry: ad.asymmetry,
        contrastStrategy: ad.contrastStrategy,
        emotionalDirection: ad.emotionalDirection,
        luxuryLevel: ad.luxuryLevel,
        overlapUsage: ad.overlapUsage,
        isEditorialSection: ad.editorialSections.includes(slot.category),
        isSplitSection: ad.splitSections.includes(slot.category),
        imagePlacement: ad.imagePlacements[slot.category],
      } : {}),
    },
  };

  switch (slot.category) {
    case "hero": {
      const props: Record<string, unknown> = {
        ...dnaProps,
        headline: cleanText(c.headline) || industryProfile.defaults.headline,
        description: cleanText(c.description) || industryProfile.defaults.description,
        ctaLabel: primaryCta,
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
        props.secondaryCtaLabel = label("learnMore", lang);
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
        sectionTitle: title("features", "features"),
        features: services,
        image,
      };
    }

    case "testimonials": {
      if (!c.testimonials?.length) return null; // never fabricate
      return {
        ...dnaProps,
        sectionTitle: title("testimonials", "testimonials"),
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
        sectionTitle: title("portfolio", "portfolio"),
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
        sectionTitle: title("about", "about"),
        headline: cleanText(realHeading(model, "about")) ||
          (c.aboutBody ? label("ourStory", lang) : cleanText(analysis.brandName)),
        description: cleanText(c.aboutBody || c.description || industryProfile.defaults.description),
        image: c.images.length > 1 ? c.images[1] : undefined,
        stats: c.stats,
      };
    }

    case "faq": {
      // Golden rule (V2 Chantier 3): NEVER fabricate. No real FAQ extracted
      // → the section is omitted, exactly like testimonials and stats.
      if (!c.faqItems?.length) return null;
      return {
        ...dnaProps,
        sectionTitle: title("faq", "faq"),
        items: c.faqItems.slice(0, 6).map((f) => ({
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
        sectionTitle: title("services", "services"),
        services: services.map((s) => ({
          title: cleanText("title" in s ? String(s.title) : String(s)),
          description: cleanText("description" in s ? String(s.description) : undefined),
        })),
      };
    }

    case "cta": {
      return {
        ...dnaProps,
        // The client's REAL headline closes the page — never the industry
        // default when real copy exists (V2 Chantier 3).
        headline: cleanText(realHeading(model, "cta")) ||
          cleanText(c.headline) ||
          cleanText(industryProfile.defaults.headline),
        ctaLabel: primaryCta,
        ctaHref: c.contact?.bookingUrl || "#contact",
        secondaryCtaLabel: dna.ctaDirection.hasSecondary ? label("learnMore", lang) : undefined,
      };
    }

    case "contact": {
      return {
        ...dnaProps,
        sectionTitle: title("contact", "contact"),
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

// defaultFaq was DELETED with V2 Chantier 3: a FAQ section is now omitted
// when the source site has none, exactly like testimonials and stats
// (golden rule: never fabricate). See docs/ARCHITECTURE_DECISIONS.md (D3).

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
  artDirection?: ArtDirection;
}

/**
 * Compose a SiteSchema from a SiteAnalysis, guided by a DesignDNA.
 *
 * This is the V5 generation entry point. Every block variant, every prop,
 * every spacing choice is dictated by the DNA.
 */
export function compose(analysis: SiteAnalysis, opts: ComposeOptions): SiteSchema {
  const { dna, profile, moodboard, artDirection } = opts;
  const industry = analysis.industry;
  const mood = INDUSTRY_PROFILES[industry].theme.mood;

  // 2. Build theme from DNA + analysis
  const theme = buildTheme(analysis, dna, profile);

  // 3. Build blocks: Art Direction drives variant + section order when present
  const model = buildContentModel(analysis);
  const ctx: ContentContext = { analysis, profile, dna, artDirection, imageIdx: 0, model };
  const blocks: Block[] = [];

  if (artDirection) {
    // Art Director mode: Composer only executes the creative brief
    for (const sectionType of artDirection.sectionOrder) {
      const category = renderableCategory(sectionType);
      const variant = artDirection.variantMap[sectionType] ||
        artDirection.variantMap[category] ||
        pickVariantWithDNA(category, industry, analysis.brandName, mood, dna);
      const slot: Slot = { type: sectionType, category };
      const props = buildBlockProps(slot, ctx);
      if (props === null) continue;
      blocks.push({ id: uid(), type: sectionType, variant, props });
    }
  } else {
    // Legacy mode: Composer decides variants (backward compatibility)
    const plan = planSmart(analysis.structure, industry);
    for (const slot of plan.slots) {
      const variant = pickVariantWithDNA(slot.category, industry, analysis.brandName, mood, dna);
      const props = buildBlockProps(slot, ctx);
      if (props === null) continue;
      blocks.push({ id: uid(), type: slot.type, variant, props });
    }
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
      ...(artDirection ? [{
        action: `Art Direction: ${artDirection.signature}`,
        reason: `${artDirection.pageStorytelling} storytelling, ${artDirection.heroPhilosophy} hero, ${artDirection.featureLayout} features`,
      }] : []),
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
