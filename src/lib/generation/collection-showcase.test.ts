import { describe, it, expect } from "vitest";
import { parse } from "node-html-parser";
import { extractCollection, generateSite } from "@/lib/generation/engine";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry } from "@/lib/generation/types";

/**
 * Coherence: a real "Nos vins" section (wines by name + photo + blurb, NO prices,
 * no product class) used to be dropped by both extractors. It must now survive the
 * rebuild with its ACTUAL wines and photos, and render as an image showcase that is
 * architecturally distinct from the text menu list.
 */
describe("extractCollection — curated price-less collection (nos vins)", () => {
  it("captures a photographed wine list under a collection heading, with images + blurbs", () => {
    const root = parse(`<section>
      <h2>Nos Vins</h2>
      <div class="wine"><img src="/img/pinot.jpg"><h3>Pinot Noir 2019</h3><p>Bourgogne — notes de cerise et de sous-bois.</p></div>
      <div class="wine"><img src="/img/chablis.jpg"><h3>Chablis 2020</h3><p>Minéral, agrumes, finale saline.</p></div>
      <div class="wine"><img src="/img/rhone.jpg"><h3>Côtes du Rhône 2018</h3><p>Épicé, fruits noirs mûrs.</p></div>
      <div class="wine"><img src="/img/sancerre.jpg"><h3>Sancerre 2021</h3><p>Vif, floral, tendu.</p></div>
    </section>`);
    const c = extractCollection(root, "https://cave.example");
    expect(c?.items.length).toBe(4);
    expect(c!.items[0]).toMatchObject({ name: "Pinot Noir 2019" });
    expect(c!.items[0].description).toMatch(/cerise/);
    expect(c!.items[0].image).toBe("https://cave.example/img/pinot.jpg");
    expect(c!.items.every((it) => !!it.image)).toBe(true); // every wine keeps its own photo
  });

  it("stays conservative: a bare nav list never invents a collection", () => {
    const nav = parse(`<section><h2>Navigation</h2><ul><li>Home</li><li>About</li><li>Contact</li></ul></section>`);
    expect(extractCollection(nav)).toBeUndefined();
    // Even under a collection heading, bare names with no photo/blurb/price are skipped.
    const bare = parse(`<section><h2>Nos Vins</h2><ul><li>Rouge</li><li>Blanc</li><li>Rosé</li></ul></section>`);
    expect(extractCollection(bare)).toBeUndefined();
  });

  it("still reads a classic price menu (unchanged)", () => {
    const root = parse(`<table>
      <tr><td>Burrata</td><td>€14</td></tr>
      <tr><td>Tagliatelle al ragù</td><td>€18</td></tr>
      <tr><td>Tiramisù</td><td>€9</td></tr>
    </table>`);
    const c = extractCollection(root);
    expect(c?.items.length).toBe(3);
    expect(c!.items[0]).toMatchObject({ name: "Burrata", price: "€14" });
  });
});

function mk(collection: { name: string; description?: string; image?: string }[]): SiteAnalysis {
  const p = INDUSTRY_PROFILES["restaurant"];
  const pool = ["P1", "P2", "P3", "P4"].map((x) => `https://pool/${x}`);
  return {
    url: "https://x.com", brandName: "Cave Nord", industry: "restaurant" as Industry, industryLabel: p.label, fetched: true, confidence: "full", detectedSections: [],
    brand: { accentColor: p.theme.accent }, navItems: ["Home"],
    structure: { sections: ["hero", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
    extractedContent: {
      headline: "A table you'll remember", description: "Seasonal cuisine.", services: ["Dinner"],
      heroImageUrl: pool[0], images: pool,
      collection: { items: collection },
    },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
  } as unknown as SiteAnalysis;
}

describe("CollectionShowcase — real photos survive onto the home page", () => {
  const wines = [
    { name: "Pinot Noir 2019", description: "Cherry, forest floor.", image: "https://wines/pinot.jpg" },
    { name: "Chablis 2020", description: "Mineral, citrus.", image: "https://wines/chablis.jpg" },
    { name: "Côtes du Rhône 2018", description: "Spiced, dark fruit.", image: "https://wines/rhone.jpg" },
  ];

  it("renders a photographed collection as a CollectionShowcase block ON the home page", () => {
    const s = generateSite(mk(wines), { mode: "smart" });
    const block = s.blocks.find((b) => b.variant === "CollectionShowcase");
    expect(block).toBeTruthy();
    const items = (block!.props as any).items as { name: string; image?: string }[];
    expect(items.map((i) => i.name)).toEqual(wines.map((w) => w.name));
  });

  it("keeps each wine's OWN photo — qualityPass never swaps them for pool images", () => {
    const s = generateSite(mk(wines), { mode: "smart" });
    const items = (s.blocks.find((b) => b.variant === "CollectionShowcase")!.props as any).items as { image?: string }[];
    expect(items.map((i) => i.image)).toEqual(wines.map((w) => w.image)); // exact, unswapped
    // And the imaged collection is NOT duplicated onto a separate Menu page.
    const menuPage = (s.pages ?? []).find((p) => (p.blocks || []).some((b) => b.type === "gallery"));
    expect(menuPage).toBeFalsy();
  });

  it("a text price-menu still becomes the dedicated page (CollectionGrid), not the home showcase", () => {
    const s = generateSite(mk([
      { name: "Burrata", description: "Creamy" }, { name: "Cacio e Pepe", description: "Pecorino" }, { name: "Tiramisu", description: "Classic" },
    ].map((x) => ({ ...x }))), { mode: "smart" });
    // No images → not a home showcase.
    expect(s.blocks.find((b) => b.variant === "CollectionShowcase")).toBeFalsy();
    const hasMenuPage = (s.pages ?? []).some((p) => (p.blocks || []).some((b) => b.variant === "CollectionGrid"));
    expect(hasMenuPage).toBe(true);
  });
});
