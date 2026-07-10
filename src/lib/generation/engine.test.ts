import { describe, it, expect } from "vitest";
import { generateSite, qualityPass } from "./engine";
import type { Block, BlockType, SiteAnalysis, SiteStructure } from "./types";

const qpBlock = (type: BlockType, props: Record<string, unknown> = {}): Block =>
  ({ id: type + Math.random(), type, variant: "X", props } as Block);

describe("qualityPass (agency quality pass)", () => {
  it("enforces a single hero first and the footer last", () => {
    const { blocks } = qualityPass(
      [qpBlock("footer"), qpBlock("features"), qpBlock("hero"), qpBlock("hero"), qpBlock("contact")],
      []
    );
    expect(blocks.map((b) => b.type)).toEqual(["hero", "features", "contact", "footer"]);
  });

  it("drops back-to-back duplicate sections", () => {
    const { blocks } = qualityPass([qpBlock("hero"), qpBlock("features"), qpBlock("features"), qpBlock("footer")], []);
    expect(blocks.map((b) => b.type)).toEqual(["hero", "features", "footer"]);
  });

  it("distributes real photos so the hero image is not reused by the next section", () => {
    const pool = ["a.jpg", "b.jpg", "c.jpg"];
    const { blocks } = qualityPass(
      [qpBlock("hero", { image: "a.jpg" }), qpBlock("features", { items: [{ image: "a.jpg" }, { image: "a.jpg" }] })],
      pool
    );
    const heroImg = (blocks[0].props as { image: string }).image;
    const firstTile = (blocks[1].props as { items: { image: string }[] }).items[0].image;
    expect(firstTile).not.toBe(heroImg);
  });

  it("never invents images for an image-free section", () => {
    const { blocks } = qualityPass([qpBlock("hero", {}), qpBlock("cta", {})], ["a.jpg", "b.jpg"]);
    expect((blocks[0].props as Record<string, unknown>).image).toBeUndefined();
  });
});

function analysis(overrides: Partial<SiteAnalysis> = {}): SiteAnalysis {
  return {
    url: "https://acme.com",
    brandName: "Acme",
    industry: "agency",
    industryLabel: "Agency",
    fetched: true,
    detectedSections: [],
    navItems: ["A", "B", "C"],
    extractedContent: { headline: "H", description: "D", services: ["A", "B", "C"], images: [] },
    scores: { design: 50, performance: 50, seo: 50, mobile: 50, accessibility: 50 },
    issues: [],
    ...overrides,
  };
}

function structure(types: BlockType[]): SiteStructure {
  return { sections: types.map((t, i) => ({ type: t, order: i + 1, confidence: 0.9 })), nav: [] };
}

// Block identity is randomized; compare only the meaningful selection + content.
function shape(s: ReturnType<typeof generateSite>) {
  return {
    mode: s.mode,
    blocks: s.blocks.map((b) => ({ type: b.type, variant: b.variant, props: b.props })),
  };
}

describe("generateSite", () => {
  it("defaults to smart (premium re-composition) and preserves structure on demand", () => {
    const a = analysis({
      structure: structure(["hero", "services", "portfolio", "footer"]),
      extractedContent: { headline: "H", description: "D", services: ["A", "B", "C"], images: ["https://x/1.jpg", "https://x/2.jpg"] },
    });
    // New default: a premium editorial re-composition (identity preserved).
    expect(generateSite(a).mode).toBe("smart");
    // Explicit preserve still keeps the client's exact detected structure.
    const p = generateSite(a, { mode: "preserve" });
    expect(p.mode).toBe("preserve");
    expect(p.blocks.map((b) => b.type)).toEqual(["hero", "services", "portfolio", "footer"]);
  });

  it("is deterministic (same input, same selection and content)", () => {
    const a = analysis({ structure: structure(["hero", "about", "footer"]) });
    expect(shape(generateSite(a))).toEqual(shape(generateSite(a)));
  });

  it("routes extended section types to their dedicated variants", () => {
    const a = analysis({
      structure: structure(["hero", "about", "services", "portfolio", "footer"]),
      extractedContent: { headline: "H", description: "D", services: ["A", "B", "C"], images: ["https://x/1.jpg", "https://x/2.jpg"] },
    });
    const byType = Object.fromEntries(
      generateSite(a, { mode: "preserve" }).blocks.map((b) => [b.type, b.variant])
    );
    expect(["AboutSplit", "StatementAgencia"]).toContain(byType.about);
    expect(["ServicesList", "ServicesCards"]).toContain(byType.services);
    // any of the visual-grid gallery variants is valid for a portfolio slot
    expect(["PortfolioGrid", "GalleryMasonry", "GalleryStrip", "GalleryFeature"]).toContain(byType.portfolio);
  });

  it("never fabricates testimonials or stats: omits them without real data", () => {
    const a = analysis({ structure: structure(["hero", "testimonials", "stats", "footer"]) });
    const types = generateSite(a, { mode: "preserve" }).blocks.map((b) => b.type);
    expect(types).not.toContain("testimonials");
    expect(types).not.toContain("stats");
  });

  it("renders testimonials and stats when real data is provided", () => {
    const a = analysis({
      structure: structure(["hero", "testimonials", "stats", "footer"]),
      extractedContent: {
        headline: "H", description: "D", services: ["A", "B", "C"], images: [],
        testimonials: [{ quote: "Great work", name: "Real Client", role: "Owner" }],
        stats: [{ value: "12", label: "Years" }],
      },
    });
    const types = generateSite(a, { mode: "preserve" }).blocks.map((b) => b.type);
    expect(types).toContain("testimonials");
    expect(types).toContain("stats");
  });

  it("classic uses the canonical layout (no fabricated testimonials)", () => {
    const s = generateSite(analysis({ structure: structure(["hero", "about", "footer"]) }), {
      mode: "classic",
    });
    // P0/F21: no real faqItems in the fixture → the canonical faq slot is
    // omitted instead of being filled with fabricated questions.
    expect(s.blocks.map((b) => b.type)).toEqual([
      "hero", "features", "cta", "contact", "footer",
    ]);
    expect(s.recommendations).toBeUndefined();
  });

  it("smart attaches conversion recommendations", () => {
    const s = generateSite(analysis({ structure: structure(["hero", "about", "footer"]) }), {
      mode: "smart",
    });
    expect(s.recommendations?.length ?? 0).toBeGreaterThan(0);
  });

  it("strips em-dashes from all shipped copy (the #1 AI tell)", () => {
    const a = analysis({
      industry: "saas",
      structure: structure(["hero", "about", "footer"]),
      extractedContent: {
        headline: "Fast, simple — and yours",
        description: "Built for teams — no busywork.",
        services: ["Onboarding — done for you", "Support"],
        images: [],
      },
    });
    const s = generateSite(a, { mode: "smart" });
    const json = JSON.stringify(s);
    expect(json).not.toContain("—"); // em-dash
    expect(json).not.toContain("–"); // en-dash
    expect(s.brand.tagline).toBe("Fast, simple, and yours");
  });

  it("does not fall back to AI-default purple for saas/generic accents", () => {
    expect(generateSite(analysis({ industry: "saas" })).theme.accent).not.toBe("#6366f1");
    expect(generateSite(analysis({ industry: "generic" })).theme.accent).not.toBe("#6366f1");
  });

  it("omits the portfolio when there are no real images (no filler)", () => {
    const withImgs = analysis({
      structure: structure(["hero", "portfolio", "footer"]),
      extractedContent: { headline: "H", description: "D", services: ["A", "B", "C"], images: ["https://x/i.jpg", "https://x/j.jpg"] },
    });
    const without = analysis({
      structure: structure(["hero", "portfolio", "footer"]),
      extractedContent: { headline: "H", description: "D", services: ["A", "B", "C"], images: [] },
    });
    expect(generateSite(withImgs).blocks.map((b) => b.type)).toContain("portfolio");
    expect(generateSite(without).blocks.map((b) => b.type)).not.toContain("portfolio");
  });

  it("follows an explicit (AI) layout, anchoring hero/footer and ensuring contact", () => {
    const s = generateSite(analysis({}), { layout: ["hero", "features", "faq", "cta"] });
    const types = s.blocks.map((b) => b.type);
    expect(types[0]).toBe("hero");
    expect(types[types.length - 1]).toBe("footer");
    expect(types).toContain("contact"); // guaranteed even if AI omits it
    // P0/F21: the faq slot is requested but there are no real faqItems → the
    // section is OMITTED, never filled with fabricated questions.
    expect(types).not.toContain("faq");
    const withFaq = generateSite(
      analysis({ extractedContent: { headline: "H", description: "D", services: ["A", "B", "C"], images: [], faqItems: [{ question: "Q?", answer: "A." }] } }),
      { layout: ["hero", "features", "faq", "cta"] },
    );
    expect(withFaq.blocks.map((b) => b.type)).toContain("faq");
  });

  it("applies an AI theme (font/mood/radius) but lets the real brand colour win", () => {
    const s = generateSite(
      analysis({ industry: "saas", brand: { accentColor: "#ff5500" } }),
      { theme: { font: "serif", mood: "warm", radius: "xl", accent: "#123456" } }
    );
    expect(s.theme.font).toBe("serif");
    expect(s.theme.mood).toBe("warm");
    expect(s.theme.radius).toBe("xl");
    expect(s.theme.accent).toBe("#ff5500"); // extracted brand colour overrides AI's
  });

  it("gives the hero an industry CTA label wired to a real next step", () => {
    const s = generateSite(analysis({ industry: "restaurant" }), { mode: "classic" });
    const hero = s.blocks.find((b) => b.type === "hero")!;
    // Restaurant's métier action, scrolling to the on-page contact section.
    expect(hero.props.primaryCta).toBe("Book a table");
    expect(hero.props.primaryHref).toBe("#contact");
    // No phone known -> soft secondary, also actionable.
    expect(hero.props.secondaryHref).toBe("#contact");
  });

  it("prefers booking link and offers Call when contact details exist", () => {
    const a = analysis({
      industry: "artisan",
      extractedContent: {
        headline: "H", description: "D", services: ["A", "B", "C"], images: [],
        contact: { phone: "01 23 45 67 89", bookingUrl: "https://book.example.com" },
      },
    });
    const s = generateSite(a, { mode: "classic" });
    const hero = s.blocks.find((b) => b.type === "hero")!;
    expect(hero.props.primaryCta).toBe("Get a free quote");
    expect(hero.props.primaryHref).toBe("https://book.example.com");
    expect(hero.props.secondaryCta).toBe("Call us");
    expect(hero.props.secondaryHref).toBe("tel:0123456789");
    // The closing CTA section is wired to the same booking action.
    const cta = s.blocks.find((b) => b.type === "cta")!;
    expect(cta.props.cta).toBe("Get a free quote");
    expect(cta.props.ctaHref).toBe("https://book.example.com");
  });

  it("produces standard sub-pages (Services / About / Contact)", () => {
    const s = generateSite(analysis());
    const labels = (s.pages ?? []).map((p) => p.label);
    expect(labels).toEqual(expect.arrayContaining(["Services", "About", "Contact"]));
    for (const p of s.pages ?? []) {
      expect(p.blocks.some((b) => b.type !== "footer")).toBe(true);
    }
  });

  it("builds an owner-managed collection page (Menu) from real items", () => {
    const a = analysis({
      industry: "restaurant",
      industryLabel: "Restaurant",
      extractedContent: {
        headline: "H",
        description: "D",
        services: ["A", "B"],
        images: [],
        collection: { items: [{ name: "Plat du jour", price: "12€" }] },
      },
    });
    const menu = (generateSite(a).pages ?? []).find((p) => p.path === "menu");
    expect(menu?.label).toBe("Menu");
    expect(menu?.blocks[0].variant).toBe("CollectionGrid");
  });

  it("uses the source accent color when one was detected", () => {
    const s = generateSite(analysis({ brand: { accentColor: "#ff0066" } }));
    expect(s.theme.accent).toBe("#ff0066");
  });
});
