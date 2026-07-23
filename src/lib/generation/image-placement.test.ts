import { describe, it, expect } from "vitest";
import { parse } from "node-html-parser";
import { extractImagesRich, generateSite } from "@/lib/generation/engine";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry, ScrapedImage } from "@/lib/generation/types";

/**
 * Intelligent image ↔ section placement. Not a filename rule: each image carries
 * the DOM signal (alt, dimensions, source role), and the distributor puts the
 * shot where it has the most business + emotional impact for the sector — the
 * plated dish leads the hero, the who/where frame anchors the About.
 */

describe("extractImagesRich — captures the DOM signal", () => {
  it("reads alt, dimensions and infers the source role (kind)", () => {
    const root = parse(`
      <head><meta property="og:image" content="https://x.com/social-card.jpg"></head>
      <div class="hero-banner"><img src="/hero-main.jpg" alt="Wide cover" width="1600" height="900"></div>
      <figure><img src="/gallery-1.jpg" alt="A dish" width="1200" height="800"></figure>
      <div class="team-member"><img src="/person-jane.jpg" alt="Jane" width="400" height="520"></div>
      <div class="body"><img src="/inline-shot.jpg" alt="Some content" width="1000" height="700"></div>
    `);
    const imgs = extractImagesRich(root, "https://x.com");
    const byUrl = Object.fromEntries(imgs.map((i) => [i.url.split("/").pop(), i]));
    expect(byUrl["social-card.jpg"]?.kind).toBe("social");
    expect(byUrl["hero-main.jpg"]?.kind).toBe("hero");
    expect(byUrl["gallery-1.jpg"]?.kind).toBe("gallery");
    expect(byUrl["person-jane.jpg"]?.kind).toBe("portrait"); // team class + tall
    expect(byUrl["inline-shot.jpg"]?.kind).toBe("content");
    // alt + dimensions preserved for scoring
    expect(byUrl["gallery-1.jpg"]).toMatchObject({ alt: "A dish", w: 1200, h: 800 });
  });
  it("skips tiny icons/pixels", () => {
    const root = parse(`<img src="/icon.png" width="24" height="24"><img src="/real-photo.jpg" alt="ok" width="800" height="600">`);
    const urls = extractImagesRich(root, "https://x.com").map((i) => i.url);
    expect(urls.some((u) => u.includes("icon"))).toBe(false);
    expect(urls.some((u) => u.includes("real-photo"))).toBe(true);
  });
});

function mk(industry: Industry, rich: ScrapedImage[]): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  return {
    url: "https://x.com", brandName: "N", industry, industryLabel: p.label, fetched: true, confidence: "full", detectedSections: [],
    brand: { accentColor: p.theme.accent }, navItems: ["Home"],
    structure: { sections: ["hero", "about", "portfolio", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
    extractedContent: {
      headline: "H", description: "A short studio description about who we are and how we work.",
      aboutBody: "We are a team that cares. Two sentences of real story here for the About body.",
      services: ["A", "B", "C"],
      heroImageUrl: rich[0].url, images: rich.map((i) => i.url), imagesRich: rich,
    },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
  } as unknown as SiteAnalysis;
}
const heroImg = (a: SiteAnalysis) => (generateSite(a, { mode: "smart" }).blocks.find((b) => b.type === "hero")?.props as any)?.image;
const aboutImg = (a: SiteAnalysis) => (generateSite(a, { mode: "smart" }).blocks.find((b) => b.type === "about")?.props as any)?.image;

describe("semantic placement — the signature shot leads the hero (4 sectors)", () => {
  it("restaurant: the plated dish leads, the room/team anchors the About", () => {
    const a = mk("restaurant", [
      { url: "https://x/room", alt: "our warm dining room interior", kind: "content", w: 1600, h: 1000 },
      { url: "https://x/dish", alt: "grilled salmon, a plated dish", kind: "content", w: 1600, h: 1000 },
      { url: "https://x/team", alt: "the chef and the team portrait", kind: "portrait", w: 800, h: 1000 },
      { url: "https://x/table", alt: "a set table", kind: "gallery", w: 1200, h: 800 },
    ]);
    expect(heroImg(a)).toBe("https://x/dish");
    expect(aboutImg(a)).toBe("https://x/team");
    expect(heroImg(a)).not.toBe(aboutImg(a));
  });
  it("architect: the building facade leads", () => {
    const a = mk("architect", [
      { url: "https://x/interior", alt: "minimal interior living space", kind: "content", w: 1400, h: 1000 },
      { url: "https://x/villa", alt: "a modern villa facade, exterior", kind: "hero", w: 1600, h: 1000 },
      { url: "https://x/studio", alt: "our studio team at work", kind: "portrait", w: 800, h: 1000 },
    ]);
    expect(heroImg(a)).toBe("https://x/villa");
  });
  it("saas: the product/dashboard screen leads over an office snap", () => {
    const a = mk("saas", [
      { url: "https://x/office", alt: "our team in the office", kind: "portrait", w: 900, h: 1000 },
      { url: "https://x/dash", alt: "the product dashboard analytics screen", kind: "content", w: 1600, h: 1000 },
    ]);
    expect(heroImg(a)).toBe("https://x/dash");
  });
  it("garage (automotive): the vehicle leads over the workshop portrait", () => {
    const a = mk("automotive", [
      { url: "https://x/shop", alt: "our workshop and mechanics team", kind: "portrait", w: 900, h: 1000 },
      { url: "https://x/car", alt: "a classic sports car, detailing", kind: "hero", w: 1600, h: 1000 },
    ]);
    expect(heroImg(a)).toBe("https://x/car");
  });
});

describe("no fabrication + clean fallback", () => {
  it("never repeats a photo across sections", () => {
    const a = mk("restaurant", [
      { url: "https://x/a", alt: "grilled dish", kind: "content", w: 1600, h: 1000 },
      { url: "https://x/b", alt: "the team portrait", kind: "portrait", w: 800, h: 1000 },
      { url: "https://x/c", alt: "a table", kind: "gallery", w: 1200, h: 800 },
    ]);
    const blocks = generateSite(a, { mode: "smart" }).blocks;
    const all: string[] = [];
    for (const b of blocks) {
      const bp = b.props as any;
      if (typeof bp?.image === "string") all.push(bp.image);
      if (Array.isArray(bp?.items)) for (const it of bp.items) if (typeof it?.image === "string") all.push(it.image);
    }
    expect(new Set(all).size).toBe(all.length); // each photo appears at most once
  });
  it("with no metadata it degrades to positional order (hero = first image)", () => {
    const p = INDUSTRY_PROFILES["restaurant"];
    const a = {
      url: "https://x.com", brandName: "N", industry: "restaurant" as Industry, industryLabel: p.label, fetched: true, confidence: "full", detectedSections: [],
      brand: { accentColor: p.theme.accent }, navItems: ["Home"],
      structure: { sections: ["hero", "portfolio", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
      extractedContent: { headline: "H", description: "D", services: ["a"], heroImageUrl: "https://x/1", images: ["https://x/1", "https://x/2", "https://x/3"] },
      scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
    } as unknown as SiteAnalysis;
    expect(heroImg(a)).toBe("https://x/1");
  });
});
