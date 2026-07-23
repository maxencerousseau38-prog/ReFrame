import { describe, it, expect } from "vitest";
import { generateSite } from "@/lib/generation/engine";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry } from "@/lib/generation/types";

/**
 * CD #4: a restaurant page should read as a STORY in its own words — concept →
 * the room → the experience → in the kitchen → reserve — not the generic "About /
 * Gallery / Why choose us". Framing only (F21): the real extracted content is
 * unchanged; sectors without a narrative voice keep the neutral labels.
 */
function mk(industry: Industry): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  const imgs = ["A", "B", "C", "D", "E"].map((x) => `https://x/${x}.jpg`);
  return {
    url: "https://x.com", brandName: "Fumo", industry, industryLabel: p.label, fetched: true, confidence: "full", detectedSections: [],
    brand: { accentColor: p.theme.accent }, navItems: ["Home"],
    structure: { sections: ["hero", "gallery", "about", "features", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
    extractedContent: {
      headline: "H", description: "D", aboutBody: "Real story. Two sentences.",
      services: ["Seasonal menu", "Private dining", "Wine pairing"], heroImageUrl: imgs[0], images: imgs,
      team: [{ name: "Élise Caron", role: "Chef", image: "https://x/chef.jpg" }, { name: "Marco", role: "Sous-chef", image: "https://x/m.jpg" }],
    },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
  } as unknown as SiteAnalysis;
}
const framing = (a: SiteAnalysis, type: string) => {
  const b = generateSite(a, { mode: "smart" }).blocks.find((x) => x.type === type);
  return { eyebrow: (b?.props as any)?.eyebrow, title: (b?.props as any)?.title };
};

describe("restaurant storytelling framing", () => {
  it("voices the sections as a restaurant narrative", () => {
    const a = mk("restaurant");
    expect(framing(a, "about")).toMatchObject({ eyebrow: "The concept" });
    expect(framing(a, "gallery").eyebrow).toBe("The room");
    expect(framing(a, "features")).toMatchObject({ eyebrow: "The experience", title: "What to expect" });
    expect(framing(a, "team").eyebrow).toBe("In the kitchen");
  });
  it("never fabricates content — only the framing changes (real services stay)", () => {
    const a = mk("restaurant");
    const feat = generateSite(a, { mode: "smart" }).blocks.find((b) => b.type === "features");
    const titles = ((feat?.props as any).items as any[]).map((i) => i.title);
    expect(titles).toEqual(["Seasonal menu", "Private dining", "Wine pairing"]); // real, untouched
  });
  it("leaves non-narrative sectors on the neutral labels (saas features = Approach, not restaurant voice)", () => {
    // Product family has no About; its features keep the neutral "Approach".
    const a = mk("saas");
    expect(framing(a, "features").eyebrow).toBe("Approach");
    expect(framing(a, "features").eyebrow).not.toBe("The experience");
  });
});
