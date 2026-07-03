import { describe, it, expect } from "vitest";
import type { SiteAnalysis } from "@/lib/generation/types";
import { buildContentModel, realHeading } from "./content-model";

function makeAnalysis(overrides: Partial<SiteAnalysis> = {}): SiteAnalysis {
  return {
    url: "https://atelier.example",
    brandName: "Atelier Lumière",
    industry: "artisan",
    industryLabel: "Artisan",
    fetched: true,
    confidence: "full",
    detectedSections: [],
    navItems: ["Atelier", "Réalisations", "Contact"],
    structure: {
      nav: ["Atelier", "Réalisations", "Contact"],
      sections: [
        { type: "hero", order: 0, confidence: 0.9 },
        { type: "services", order: 1, confidence: 0.8, label: "Nos savoir-faire" },
        { type: "testimonials", order: 2, confidence: 0.7, label: "Ils nous font confiance" },
        { type: "faq", order: 3, confidence: 0.6 },
        { type: "contact", order: 4, confidence: 0.9, label: "Parlons de votre projet" },
        { type: "footer", order: 5, confidence: 0.9 },
      ],
    },
    extractedContent: {
      headline: "Menuiserie d'art à Grenoble",
      description: "Pièces uniques en bois massif.",
      language: "fr",
      ctaLabel: "Discuter de votre projet",
      services: ["Agencement", "Escaliers"],
      serviceItems: [
        { title: "Agencement", description: "Bibliothèques et dressings sur mesure." },
        { title: "Escaliers", description: "Hélicoïdaux et suspendus." },
      ],
      images: ["https://x/1.jpg", "https://x/2.jpg"],
      heroImageUrl: "https://x/hero.jpg",
      testimonials: [{ quote: "Un travail exceptionnel.", name: "M. Blanc" }],
      contact: { email: "atelier@lumiere.example", phone: "0476000000" },
    },
    scores: { design: 60, performance: 70, seo: 65, mobile: 75, accessibility: 60 },
    issues: [],
    ...overrides,
  };
}

describe("buildContentModel", () => {
  it("attaches real content to its scene, in source order, with real headings", () => {
    const model = buildContentModel(makeAnalysis());

    expect(model.language).toBe("fr");
    expect(model.brandName).toBe("Atelier Lumière");
    expect(model.scenes.map((s) => s.category)).toEqual([
      "hero", "services", "testimonials", "faq", "contact", "footer",
    ]);

    const hero = model.scenes[0];
    expect(hero.heading).toBe("Menuiserie d'art à Grenoble");
    expect(hero.ctas).toEqual([{ label: "Discuter de votre projet", href: undefined }]);
    expect(hero.media).toEqual(["https://x/hero.jpg"]);

    const services = model.scenes[1];
    expect(services.heading).toBe("Nos savoir-faire"); // the site's REAL heading
    expect(services.items).toHaveLength(2);

    const testimonials = model.scenes[2];
    expect(testimonials.heading).toBe("Ils nous font confiance");
    expect(testimonials.quotes).toHaveLength(1);

    const contact = model.scenes[4];
    expect(contact.items).toEqual([
      { title: "email", description: "atelier@lumiere.example" },
      { title: "phone", description: "0476000000" },
    ]);
  });

  it("never invents: a FAQ scene without extracted items carries none", () => {
    const model = buildContentModel(makeAnalysis());
    const faq = model.scenes.find((s) => s.category === "faq")!;
    expect(faq.faq).toBeUndefined();
    expect(faq.items).toBeUndefined();
  });

  it("realHeading returns the source heading per category, else undefined", () => {
    const model = buildContentModel(makeAnalysis());
    expect(realHeading(model, "services")).toBe("Nos savoir-faire");
    expect(realHeading(model, "contact")).toBe("Parlons de votre projet");
    expect(realHeading(model, "faq")).toBeUndefined();
  });

  it("handles an analysis without structure (no scenes, no crash)", () => {
    const model = buildContentModel(makeAnalysis({ structure: undefined }));
    expect(model.scenes).toEqual([]);
    expect(model.primaryCta?.label).toBe("Discuter de votre projet");
  });
});
