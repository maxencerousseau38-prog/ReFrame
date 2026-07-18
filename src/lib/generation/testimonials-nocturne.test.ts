import { describe, it, expect } from "vitest";
import { generateSite } from "@/lib/generation/engine";
import type { SiteAnalysis } from "@/lib/generation/types";
function mk(industry: string): SiteAnalysis {
  return {
    url: `https://demo-${industry}.com`, brandName: "Northlight", industry,
    industryLabel: industry, fetched: true, confidence: "full", detectedSections: [],
    brand: { accentColor: "#c2703d" }, navItems: ["Home"],
    structure: { sections: ["hero","testimonials","footer"].map((type,i)=>({type,order:i+1,confidence:0.9})), nav: [] },
    extractedContent: {
      headline: "H", description: "D", services: ["a"],
      images: ["https://x/1","https://x/2"],
      testimonials: [
        { quote: "They rebuilt our site in days and it finally looks like the business we run.", name: "Élise", role: "Owner" },
        { quote: "The most senior team we've worked with.", name: "Marcus", role: "Founder" },
        { quote: "Enquiries went up the first month.", name: "Priya", role: "Director" },
      ],
    },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
  } as unknown as SiteAnalysis;
}
describe("TestimonialsNocturne selection", () => {
  it("restaurant (warm) selects the dark evening band", () => {
    const v = generateSite(mk("restaurant"), { mode: "smart" }).blocks.find(b => b.type === "testimonials")?.variant;
    console.log("restaurant testimonials variant:", v);
    expect(v).toBe("TestimonialsNocturne");
  });
  it("hotel (warm) selects it too", () => {
    const v = generateSite(mk("hotel"), { mode: "smart" }).blocks.find(b => b.type === "testimonials")?.variant;
    console.log("hotel testimonials variant:", v);
    expect(v).toBe("TestimonialsNocturne");
  });
});
