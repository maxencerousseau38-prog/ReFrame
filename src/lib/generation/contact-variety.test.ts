import { describe, it, expect } from "vitest";
import { pickVariantFrom } from "@/lib/generation/catalog";
import { generateSite } from "@/lib/generation/engine";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry } from "@/lib/generation/types";

/**
 * Contact monopoly fix. The engine hardcoded ContactFormPremium1, so EVERY
 * generated site closed with the identical contact architecture. Now the slot
 * varies per brand between two FORM-bearing variants (business invariant: lead
 * capture always preserved) — light two-column vs the dark editorial enquiry
 * desk. Minimal/bold brands keep the light default by design.
 */
const BRANDS = ["Atelier Nord", "Studio Vela", "Maison Lume", "Forma", "Aksel Haus", "Volume", "Nord & Co", "Praxis"];
const FORM_VARIANTS = ["ContactFormPremium1", "ContactAtelier"];

describe("contact — variety within the form-bearing constraint", () => {
  it("warm/elegant sectors split between the two form architectures", () => {
    for (const s of ["restaurant", "hotel", "architect", "realestate", "lawyer"] as Industry[]) {
      const mood = INDUSTRY_PROFILES[s].theme.mood as any;
      const got = Array.from(new Set(BRANDS.map((b) => pickVariantFrom(FORM_VARIANTS, s, b, mood))));
      expect(got.length).toBeGreaterThan(1);
      for (const v of got) expect(FORM_VARIANTS).toContain(v);
    }
  });
  it("minimal/bold sectors keep the light universal form", () => {
    for (const b of BRANDS) {
      expect(pickVariantFrom(FORM_VARIANTS, "saas" as Industry, b, "minimal")).toBe("ContactFormPremium1");
      expect(pickVariantFrom(FORM_VARIANTS, "agency" as Industry, b, "bold")).toBe("ContactFormPremium1");
    }
  });
  it("never returns outside the allow-list (lead capture invariant)", () => {
    for (const s of ["restaurant", "saas", "health", "gym"] as Industry[]) {
      for (const b of BRANDS) {
        expect(FORM_VARIANTS).toContain(pickVariantFrom(FORM_VARIANTS, s, b, INDUSTRY_PROFILES[s].theme.mood as any));
      }
    }
  });
});

function mk(industry: Industry, brandName: string): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  const images = ["A", "B", "C", "D"].map((x) => `https://x/${x}`);
  return {
    url: "https://x.com", brandName, industry, industryLabel: p.label, fetched: true, confidence: "full", detectedSections: [],
    brand: { accentColor: p.theme.accent }, navItems: ["Home"],
    structure: { sections: ["hero", "contact", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
    extractedContent: { headline: "H", description: "D", services: ["a"], heroImageUrl: images[0], images, contact: { email: "x@y.z", phone: "+33 1 00" } },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
  } as unknown as SiteAnalysis;
}

describe("contact — engine wiring", () => {
  it("the generated contact block is always one of the form variants", () => {
    for (const b of ["Atelier Nord", "Praxis"]) {
      const s = generateSite(mk("restaurant" as Industry, b), { mode: "smart" });
      const contact = s.blocks.find((x) => x.type === "contact");
      expect(FORM_VARIANTS).toContain(contact?.variant);
    }
  });
  it("two brands in the same warm sector can get different contact architectures", () => {
    const variants = new Set(BRANDS.map((b) => generateSite(mk("restaurant" as Industry, b), { mode: "smart" }).blocks.find((x) => x.type === "contact")?.variant));
    expect(variants.size).toBeGreaterThan(1);
  });
});
