import { describe, it, expect } from "vitest";
import type { SiteAnalysis } from "./types";
import { runPipeline } from "./pipeline";

function frenchAnalysis(overrides: Partial<SiteAnalysis> = {}): SiteAnalysis {
  return {
    url: "https://atelier-lumiere.fr",
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
        { type: "contact", order: 2, confidence: 0.9, label: "Parlons de votre projet" },
      ],
    },
    extractedContent: {
      headline: "Menuiserie d'art à Grenoble",
      description: "Pièces uniques en bois massif, façonnées à la main.",
      language: "fr",
      ctaLabel: "Discuter de votre projet",
      services: ["Agencement", "Escaliers", "Mobilier"],
      serviceItems: [
        { title: "Agencement", description: "Bibliothèques sur mesure." },
        { title: "Escaliers", description: "Hélicoïdaux et suspendus." },
        { title: "Mobilier", description: "Pièces uniques." },
      ],
      images: ["https://x/1.jpg", "https://x/2.jpg"],
      heroImageUrl: "https://x/hero.jpg",
      contact: { email: "atelier@lumiere.fr", phone: "0476000000" },
    },
    scores: { design: 60, performance: 70, seo: 65, mobile: 75, accessibility: 60 },
    issues: [],
    ...overrides,
  };
}

const blocksOf = (analysis: SiteAnalysis) => runPipeline(analysis).schema.blocks;
const blockOf = (analysis: SiteAnalysis, type: string) =>
  blocksOf(analysis).find((b) => b.type === type);

describe("composer — real content first (V2 Chantier 3)", () => {
  it("uses the site's REAL section headings when extracted", () => {
    const features = blockOf(frenchAnalysis(), "features");
    // The features slot resolves against the real "services" scene heading.
    expect([features?.props.sectionTitle, blockOf(frenchAnalysis(), "services")?.props.sectionTitle])
      .toContain("Nos savoir-faire");
    const contact = blockOf(frenchAnalysis(), "contact");
    expect(contact?.props.sectionTitle).toBe("Parlons de votre projet");
  });

  it("uses the site's REAL CTA copy in hero and closing CTA", () => {
    const hero = blockOf(frenchAnalysis(), "hero");
    expect(hero?.props.ctaLabel).toBe("Discuter de votre projet");
    const cta = blockOf(frenchAnalysis(), "cta");
    expect(cta?.props.ctaLabel).toBe("Discuter de votre projet");
    // The closing CTA reuses the client's real headline, not an industry default.
    expect(cta?.props.headline).toBe("Menuiserie d'art à Grenoble");
  });

  it("localizes generated labels to the detected language", () => {
    const noHeadings = frenchAnalysis({ structure: undefined });
    const testim = frenchAnalysis({
      structure: undefined,
      extractedContent: {
        ...frenchAnalysis().extractedContent,
        testimonials: [{ quote: "Un travail exceptionnel.", name: "M. Blanc" }],
      },
    });
    expect(blockOf(testim, "testimonials")?.props.sectionTitle).toBe("Ce que disent nos clients");
    const hero = blockOf(noHeadings, "hero");
    if (hero?.props.secondaryCtaLabel) {
      expect(hero.props.secondaryCtaLabel).toBe("En savoir plus");
    }
  });

  it("keeps byte-identical English labels when no language is detected (V5 compat)", () => {
    const english = frenchAnalysis({
      structure: undefined,
      extractedContent: {
        ...frenchAnalysis().extractedContent,
        language: undefined,
        ctaLabel: undefined,
        headline: "Handcrafted joinery in Leeds",
      },
    });
    const contact = blockOf(english, "contact");
    expect(contact?.props.sectionTitle).toBe("Get in touch");
  });

  it("NEVER fabricates a FAQ: no extracted items → no FAQ block", () => {
    expect(blockOf(frenchAnalysis(), "faq")).toBeUndefined();
  });

  it("renders the FAQ with the real items when the site has one", () => {
    const withFaq = frenchAnalysis({
      extractedContent: {
        ...frenchAnalysis().extractedContent,
        faqItems: [
          { question: "Quels délais ?", answer: "Six à dix semaines selon la pièce." },
          { question: "Livrez-vous ?", answer: "Oui, dans toute la région." },
        ],
      },
    });
    const faq = blockOf(withFaq, "faq");
    expect(faq).toBeDefined();
    expect(faq?.props.sectionTitle).toBe("Questions fréquentes");
    expect((faq?.props.items as unknown[]).length).toBe(2);
  });
});
