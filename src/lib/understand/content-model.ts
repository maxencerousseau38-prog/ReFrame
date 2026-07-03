/**
 * V2 UNDERSTAND — ContentModel: the source site's real content, per scene.
 *
 * Charter rules made structural:
 *   - every piece of content stays attached to ITS scene (real heading, real
 *     order) instead of floating in a flat bag;
 *   - nothing is invented: a scene the source didn't provide data for simply
 *     has no items — omission is the renderer's job, fabrication is nobody's;
 *   - the model is assembled from extraction only (SiteAnalysis); presets
 *     never enter here.
 *
 * Consumers: the composer (real headings/CTAs — Chantier 3d) and the
 * SceneDNA/SceneDescription work of Chantiers 6–7.
 */

import type { SiteAnalysis } from "@/lib/generation/types";
import { renderableCategory } from "@/lib/generation/structure";

export interface SceneCta {
  label: string;
  href?: string;
}

export interface SceneContent {
  /** Semantic type as detected on the source ("hero", "features", …). */
  type: string;
  /** Renderable category (extended taxonomy collapsed). */
  category: string;
  /** Position in the source page. */
  order: number;
  /** The REAL heading the source site used for this section. */
  heading?: string;
  body?: string;
  items?: { title: string; description?: string }[];
  quotes?: { quote: string; name?: string; role?: string }[];
  stats?: { value: string; label: string }[];
  faq?: { question: string; answer: string }[];
  ctas?: SceneCta[];
  media?: string[];
  /** Detection confidence of the section (from extraction). */
  confidence: number;
}

export interface ContentModel {
  /** ISO 639-1, when detected. Generated labels must follow it. */
  language?: string;
  brandName: string;
  /** The site's real primary call-to-action, when extracted. */
  primaryCta?: SceneCta;
  scenes: SceneContent[];
}

/* -------------------------------------------------------------------------- */
/*  Builder                                                                   */
/* -------------------------------------------------------------------------- */

export function buildContentModel(analysis: SiteAnalysis): ContentModel {
  const c = analysis.extractedContent;
  const sections = analysis.structure?.sections ?? [];

  const primaryCta: SceneCta | undefined = c.ctaLabel
    ? { label: c.ctaLabel, href: c.contact?.bookingUrl }
    : undefined;

  const scenes: SceneContent[] = sections.map((s) => {
    const category = renderableCategory(s.type);
    const scene: SceneContent = {
      type: s.type,
      category,
      order: s.order,
      heading: s.label || undefined,
      confidence: s.confidence,
    };

    switch (category) {
      case "hero":
        scene.heading = scene.heading || c.headline || undefined;
        scene.body = c.description || undefined;
        if (primaryCta) scene.ctas = [primaryCta];
        if (c.heroImageUrl) scene.media = [c.heroImageUrl];
        break;
      case "features":
      case "services":
        if (c.serviceItems?.length) scene.items = c.serviceItems;
        else if (c.services.length) scene.items = c.services.map((t) => ({ title: t }));
        break;
      case "testimonials":
        if (c.testimonials?.length) scene.quotes = c.testimonials;
        break;
      case "stats":
        if (c.stats?.length) scene.stats = c.stats;
        break;
      case "faq":
        if (c.faqItems?.length) scene.faq = c.faqItems;
        break;
      case "about":
        scene.body = c.aboutBody || undefined;
        break;
      case "portfolio":
      case "gallery":
        if (c.images.length) scene.media = c.images;
        break;
      case "team":
        if (c.team?.length) {
          scene.items = c.team.map((m) => ({ title: m.name, description: m.role }));
          scene.media = c.team.map((m) => m.image).filter((i): i is string => Boolean(i));
        }
        break;
      case "contact":
        scene.items = [
          c.contact?.email && { title: "email", description: c.contact.email },
          c.contact?.phone && { title: "phone", description: c.contact.phone },
          c.contact?.address && { title: "address", description: c.contact.address },
        ].filter((i): i is { title: string; description: string } => Boolean(i));
        if (scene.items.length === 0) delete scene.items;
        break;
      case "footer":
        if (analysis.navItems.length) {
          scene.items = analysis.navItems.map((n) => ({ title: n }));
        }
        break;
    }

    return scene;
  });

  return {
    language: c.language,
    brandName: analysis.brandName,
    primaryCta,
    scenes,
  };
}

/** Real heading of the first scene of a category, when the source had one. */
export function realHeading(model: ContentModel, category: string): string | undefined {
  return model.scenes.find((s) => s.category === category && s.heading)?.heading;
}
