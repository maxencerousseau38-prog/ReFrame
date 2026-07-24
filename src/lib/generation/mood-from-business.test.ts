import { describe, it, expect } from "vitest";
import { deriveMood } from "@/lib/generation/business";
import { runPipeline } from "@/lib/generation/pipeline";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry } from "@/lib/generation/types";

/**
 * Business-derived STYLE (mood). The mood is the root of the whole design system
 * (colour, DNA rhythm, moodboard, emotion), so locking it to the industry made
 * every restaurant "warm" and every architect "elegant" — two same-sector brands
 * could never read as different studios. deriveMood chooses the style from the
 * business itself (content keywords + tier), and that value must be the SINGLE
 * source of truth all the way to schema.theme.mood — no downstream re-derivation
 * from the industry default.
 */

function mk(
  industry: Industry,
  brand: string,
  copy: { headline?: string; desc?: string; about?: string; services?: string[] } = {}
): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  return {
    url: `https://${brand.toLowerCase().replace(/\s/g, "")}.com`,
    brandName: brand,
    industry,
    industryLabel: p.label,
    fetched: true,
    confidence: "full",
    detectedSections: [],
    brand: { accentColor: p.theme.accent },
    navItems: ["Home"],
    structure: {
      sections: ["hero", "about", "services", "contact", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })),
      nav: [],
    },
    extractedContent: {
      headline: copy.headline ?? "Welcome",
      description: copy.desc ?? "We do good work for our clients.",
      aboutBody: copy.about ?? "A team that ships real work.",
      services: copy.services ?? ["One", "Two", "Three"],
      images: ["a", "b", "c"].map((k) => `https://x.com/${k}.jpg`),
      imagesRich: [
        { url: "https://x.com/a.jpg", alt: "hero", kind: "content", w: 1600, h: 1000 },
        { url: "https://x.com/b.jpg", alt: "two", kind: "gallery", w: 1400, h: 1000 },
        { url: "https://x.com/c.jpg", alt: "three", kind: "gallery", w: 1400, h: 1000 },
      ],
    },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 },
    issues: [],
  } as unknown as SiteAnalysis;
}

describe("deriveMood — style from the business, not the industry", () => {
  it("a gastronomic / Michelin restaurant reads elegant (not the warm default)", () => {
    const m = deriveMood(
      mk("restaurant", "Le Gavroche", {
        headline: "Cuisine gastronomique étoilée",
        desc: "Une expérience raffinée, haute gastronomie, menu d'exception.",
        about: "Restaurant Michelin, élégance intemporelle.",
      }),
      "restaurant"
    );
    expect(m).toBe("elegant");
    expect(m).not.toBe(INDUSTRY_PROFILES.restaurant.theme.mood);
  });

  it("a family / convivial restaurant stays warm", () => {
    const m = deriveMood(
      mk("restaurant", "Chez Mamie", {
        headline: "Cuisine familiale fait maison",
        desc: "Une adresse conviviale et chaleureuse, recettes traditionnelles.",
        about: "Une famille, une cuisine artisanale et authentique.",
      }),
      "restaurant"
    );
    expect(m).toBe("warm");
  });

  it("an industrial / bold restaurant reads bold", () => {
    const m = deriveMood(
      mk("restaurant", "Brut", {
        headline: "Neo-bistrot industriel",
        desc: "Une cuisine brute, audacieuse, contemporaine et graphique.",
        about: "Un lieu brut, moderne, une carte punchy.",
      }),
      "restaurant"
    );
    expect(m).toBe("bold");
  });

  it("a minimalist architect reads minimal (not the elegant default)", () => {
    const m = deriveMood(
      mk("architect", "Atelier Épure", {
        headline: "Architecture minimaliste",
        desc: "Des espaces épurés, essentiels, une approche sobre et zen.",
      }),
      "architect"
    );
    expect(m).toBe("minimal");
  });

  it("neutral content preserves the industry default (no gratuitous drift)", () => {
    for (const industry of ["restaurant", "architect", "saas", "lawyer"] as Industry[]) {
      expect(deriveMood(mk(industry, "Neutral Co"), industry)).toBe(
        INDUSTRY_PROFILES[industry].theme.mood
      );
    }
  });

  it("the derived mood reaches schema.theme.mood — no industry re-derivation downstream", () => {
    const a = mk("restaurant", "Le Gavroche", {
      headline: "Cuisine gastronomique étoilée",
      desc: "Une expérience raffinée, haute gastronomie, menu d'exception.",
      about: "Restaurant Michelin, élégance intemporelle.",
    });
    const r = runPipeline(a);
    expect(r.schema.theme.mood).toBe("elegant");
    expect(r.artDirection.emotionalDirection).not.toBe("warm-inviting");
  });
});
