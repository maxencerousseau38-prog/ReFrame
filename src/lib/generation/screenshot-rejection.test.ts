import { describe, it, expect } from "vitest";
import { parse } from "node-html-parser";
import { extractImagesRich, generateSite } from "@/lib/generation/engine";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry, ScrapedImage } from "@/lib/generation/types";

/**
 * Premium image rejection. A page/menu/document CAPTURE (a website screenshot, a
 * scanned "carte", a browser mockup) must never lead the hero / about / immersive
 * CTA — that is exactly what broke the premium illusion on Mamie Fada. Preference
 * order for premium slots: a real (imperfect) photo → a gallery slot → NO image →
 * (never) a treated capture.
 */
describe("extractImagesRich — flags page/document captures", () => {
  it("detects screenshots from url / alt / DOM context, keeps real photos clean", () => {
    const root = parse(`
      <img src="/homepage-screenshot.png" alt="our website">
      <div class="browser-mockup"><img src="/app-preview.jpg" alt="the app"></div>
      <img src="/la-carte.png" alt="Notre carte">
      <img src="/flyer-2024.png" alt="promo flyer">
      <img src="/grilled-salmon.jpg" alt="grilled salmon, plated">
      <img src="/menu-hero-photo.jpg" alt="a dish from our seasonal menu">
    `);
    const flag = Object.fromEntries(extractImagesRich(root, "https://x.com").map((i) => [i.url.split("/").pop(), !!i.screenshot]));
    expect(flag["homepage-screenshot.png"]).toBe(true); // literal screenshot
    expect(flag["app-preview.jpg"]).toBe(true);          // browser-mockup context
    expect(flag["la-carte.png"]).toBe(true);             // carte + png = document capture
    expect(flag["flyer-2024.png"]).toBe(true);           // flyer + png
    expect(flag["grilled-salmon.jpg"]).toBe(false);      // a real photo
    expect(flag["menu-hero-photo.jpg"]).toBe(false);     // "menu" but a jpg photo → kept
  });
});

function mk(industry: Industry, rich: ScrapedImage[]): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  return {
    url: "https://x.com", brandName: "N", industry, industryLabel: p.label, fetched: true, confidence: "full", detectedSections: [],
    brand: { accentColor: p.theme.accent }, navItems: ["Home"],
    structure: { sections: ["hero", "about", "portfolio", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
    extractedContent: {
      headline: "H", description: "A studio description about who we are.", aboutBody: "We are a team. Real story sentence one. And sentence two here.",
      services: ["A", "B", "C"],
      // Mirror extraction: the hero opens on the first real PHOTOGRAPH (or none).
      heroImageUrl: rich.find((i) => !i.screenshot)?.url,
      images: rich.map((i) => i.url), imagesRich: rich,
    },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
  } as unknown as SiteAnalysis;
}
const blocks = (a: SiteAnalysis) => generateSite(a, { mode: "smart" }).blocks;
const imgOf = (a: SiteAnalysis, type: string) => (blocks(a).find((b) => b.type === type)?.props as any)?.image;
const heroVariant = (a: SiteAnalysis) => blocks(a).find((b) => b.type === "hero")?.variant;

describe("premium slots never use a capture", () => {
  it("restaurant: a real dish leads the hero, the menu capture is barred from it", () => {
    const a = mk("restaurant", [
      { url: "https://x/carte.png", alt: "notre carte", kind: "content", screenshot: true, w: 1200, h: 1600 },
      { url: "https://x/dish.jpg", alt: "grilled plated dish", kind: "content", w: 1600, h: 1000 },
      { url: "https://x/room.jpg", alt: "the dining room", kind: "content", w: 1500, h: 1000 },
    ]);
    expect(imgOf(a, "hero")).toBe("https://x/dish.jpg");
    // No premium slot (hero/about) carries the capture.
    for (const t of ["hero", "about"]) expect(imgOf(a, t)).not.toBe("https://x/carte.png");
  });

  it("only captures available → the hero goes IMAGE-FREE (HeroCanvas), never a capture", () => {
    const a = mk("restaurant", [
      { url: "https://x/site.png", alt: "screenshot of the website", kind: "content", screenshot: true },
      { url: "https://x/carte.png", alt: "la carte", kind: "content", screenshot: true },
    ]);
    expect(heroVariant(a)).toBe("HeroCanvas");
    // and no premium slot picked a screenshot
    for (const t of ["hero", "about"]) {
      const v = imgOf(a, t);
      expect(v === undefined || (v !== "https://x/site.png" && v !== "https://x/carte.png")).toBe(true);
    }
  });

  it("a capture may still appear in a gallery (secondary), after the real photos", () => {
    const a = mk("restaurant", [
      { url: "https://x/carte.png", alt: "la carte", kind: "content", screenshot: true },
      { url: "https://x/d1.jpg", alt: "dish one", kind: "gallery", w: 1400, h: 1000 },
      { url: "https://x/d2.jpg", alt: "dish two", kind: "gallery", w: 1400, h: 1000 },
      { url: "https://x/d3.jpg", alt: "dish three", kind: "gallery", w: 1400, h: 1000 },
    ]);
    const galleryImgs: string[] = [];
    for (const b of blocks(a)) {
      const items = (b.props as any)?.items;
      if (Array.isArray(items)) for (const it of items) if (typeof it?.image === "string") galleryImgs.push(it.image);
    }
    // real dishes fill first; the capture is allowed only as a trailing fallback
    if (galleryImgs.includes("https://x/carte.png")) {
      expect(galleryImgs.indexOf("https://x/carte.png")).toBe(galleryImgs.length - 1);
    }
    expect(true).toBe(true);
  });

  it("saas: a product screenshot is NOT rejected — it can lead the hero (it IS the product)", () => {
    // A UI shot labelled as the product (not literally "screenshot") is a real hero.
    const a = mk("saas", [
      { url: "https://x/dashboard.jpg", alt: "the product dashboard analytics", kind: "content", w: 1600, h: 1000 },
      { url: "https://x/office.jpg", alt: "our office", kind: "portrait", w: 900, h: 1000 },
    ]);
    expect(imgOf(a, "hero")).toBe("https://x/dashboard.jpg");
  });
});
