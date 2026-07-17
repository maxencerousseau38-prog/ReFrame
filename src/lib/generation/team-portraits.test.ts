import { describe, it, expect } from "vitest";
import { generateSite } from "@/lib/generation/engine";
import type { SiteAnalysis } from "@/lib/generation/types";
const analysis = {
  url: "https://demo-restaurant.com", brandName: "Northlight", industry: "restaurant",
  industryLabel: "Restaurant", fetched: true, confidence: "full", detectedSections: [],
  brand: { accentColor: "#b45309" }, navItems: ["Home"],
  structure: { sections: ["hero","about","team","footer"].map((type, i) => ({ type, order: i+1, confidence: 0.9 })), nav: [] },
  extractedContent: {
    headline: "H", description: "D", services: ["a","b","c"],
    heroImageUrl: "https://x/POOL0", images: ["https://x/POOL0","https://x/POOL1","https://x/POOL2","https://x/POOL3"],
    team: [
      { name: "Élise Caron", role: "F", image: "https://x/PORTRAIT0", bio: "b" },
      { name: "Marcus Reede", role: "C", image: "https://x/PORTRAIT1", bio: "b" },
    ],
  },
  scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
} as unknown as SiteAnalysis;
describe("team portraits survive qualityPass", () => {
  it("keeps member images", () => {
    const schema = generateSite(analysis, { mode: "smart" });
    const team = schema.blocks.find((b) => b.type === "team");
    const imgs = ((team?.props as any)?.items ?? []).map((m: any) => m.image);
    console.log("TEAM IMAGES:", JSON.stringify(imgs));
    expect(imgs).toEqual(["https://x/PORTRAIT0", "https://x/PORTRAIT1"]);
  });
});
