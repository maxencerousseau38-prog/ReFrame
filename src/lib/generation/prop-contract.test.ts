import { describe, it, expect } from "vitest";
import { runPipeline } from "@/lib/generation/pipeline";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry } from "@/lib/generation/types";

/**
 * Composer → renderer prop contract.
 *
 * Every list-driven section renderer (Features*, Services*, Portfolio*,
 * Gallery*, Testimonials*, StatsCounter) reads `props.items`. The composer used
 * to emit `features` / `services` / `images` / `testimonials` / `stats`
 * instead, so on the LIVE path every one of those sections rendered empty — a
 * lone title over a void, or (for self-omitting renderers) vanished entirely.
 * No test covered the boundary, so it shipped. This guards it: a rich business
 * must produce non-empty `items` for each content section it emits.
 */

function richAnalysis(industry: Industry): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  const imgs = ["a", "b", "c", "d", "e", "f"].map((k) => `https://x.com/${k}.jpg`);
  return {
    url: `https://demo-${industry}.com`,
    brandName: "Contract Co",
    industry,
    industryLabel: p.label,
    fetched: true,
    confidence: "full",
    detectedSections: [],
    brand: { accentColor: p.theme.accent },
    navItems: ["Home"],
    structure: {
      sections: ["hero", "about", "services", "portfolio", "testimonials", "contact", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })),
      nav: [],
    },
    extractedContent: {
      headline: "Real headline",
      description: "A real description of the business and what it does for clients.",
      aboutBody: "A real about story. We have shipped work for years. Considered end to end.",
      services: p.defaults.services,
      heroImageUrl: imgs[0],
      images: imgs,
      imagesRich: imgs.map((url, i) => ({ url, alt: "photo", kind: i === 0 ? "content" : "gallery", w: 1500, h: 1000 })),
      testimonials: [
        { quote: "They made us look world-class.", name: "A. Client", role: "CEO" },
        { quote: "Sharp, fast, premium.", name: "B. Client", role: "Founder" },
        { quote: "Every detail considered.", name: "C. Client", role: "Director" },
      ],
      stats: [
        { value: "120+", label: "Projects" },
        { value: "14", label: "Years" },
        { value: "9", label: "Awards" },
      ],
    },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 },
    issues: [],
  } as unknown as SiteAnalysis;
}

// Sections whose renderers consume `props.items` (must never be empty when
// real content exists) and the legacy prop names that must NOT be used.
const ITEMS_SECTIONS = new Set(["features", "services", "portfolio", "gallery", "products", "testimonials", "stats"]);
const FORBIDDEN_LIST_PROPS = ["features", "images", "testimonials"];

describe("composer → renderer prop contract", () => {
  for (const industry of ["restaurant", "architect", "saas", "agency", "hotel"] as Industry[]) {
    it(`${industry}: every content section emits a non-empty items[] (never a legacy prop name)`, () => {
      const { schema } = runPipeline(richAnalysis(industry));
      for (const b of schema.blocks) {
        if (!ITEMS_SECTIONS.has(b.type)) continue;
        const props = (b.props ?? {}) as Record<string, unknown>;
        // The section must carry a populated items array...
        expect(Array.isArray(props.items), `${industry}/${b.type}/${b.variant} has no items[]`).toBe(true);
        expect((props.items as unknown[]).length, `${industry}/${b.type}/${b.variant} items[] is empty`).toBeGreaterThan(0);
        // ...and must NOT smuggle the content under a legacy prop the renderer ignores.
        for (const bad of FORBIDDEN_LIST_PROPS) {
          expect(props[bad], `${industry}/${b.type} still emits legacy prop "${bad}"`).toBeUndefined();
        }
      }
    });
  }

  it("restaurant: features, portfolio, testimonials and stats all actually render content", () => {
    const { schema } = runPipeline(richAnalysis("restaurant"));
    const byType = (t: string) => schema.blocks.find((b) => b.type === t)?.props as Record<string, unknown> | undefined;
    for (const t of ["features", "portfolio", "testimonials"]) {
      const p = byType(t);
      if (p) expect((p.items as unknown[])?.length ?? 0).toBeGreaterThan(0);
    }
  });
});
