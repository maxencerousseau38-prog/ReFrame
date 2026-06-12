import type { BlockType, Industry } from "./types";

/**
 * Block catalog — the manifest the engine (and, when enabled, the LLM) selects
 * from. Each entry describes one template variant: which section it is, which
 * sectors it suits, how animated it is, and where it came from (license).
 *
 * The React implementations live in `src/components/blocks` and are keyed by
 * `variant`. To add a template: implement the component, register it there, and
 * add a row here.
 */
export interface BlockMeta {
  /** Maps to a component in the blocks registry. */
  variant: string;
  category: BlockType;
  /** Sectors this variant suits, or "all". */
  sectors: Industry[] | "all";
  /** 0 = static, 1 = subtle, 2 = rich, 3 = cinematic. */
  motion: 0 | 1 | 2 | 3;
  /** Provenance + license, so the library stays legally clean. */
  license: string;
  when: string;
}

export const BLOCK_CATALOG: BlockMeta[] = [
  // Heroes
  { variant: "HeroPremium1", category: "hero", sectors: "all", motion: 1, license: "ReFrame original", when: "Centered, message-first hero. Safe default." },
  { variant: "HeroPremium2", category: "hero", sectors: ["restaurant", "realestate", "health", "agency"], motion: 1, license: "ReFrame original", when: "Split hero with a strong asset; warm/visual sectors." },
  { variant: "HeroSpotlight", category: "hero", sectors: ["saas", "agency", "ecommerce", "generic"], motion: 2, license: "ReFrame original (inspired by Aceternity/Magic UI, MIT)", when: "Tech/SaaS hero with an animated accent aura." },
  { variant: "HeroEditorial", category: "hero", sectors: ["restaurant", "realestate", "health", "agency", "ecommerce"], motion: 2, license: "ReFrame original", when: "Editorial luxury hero: serif display, framed client portrait, monumental wordmark. Warm/elegant brands." },

  // Features
  { variant: "FeaturesGrid1", category: "features", sectors: "all", motion: 1, license: "ReFrame original", when: "Four-up feature grid. Safe default." },
  { variant: "FeaturesBento", category: "features", sectors: ["saas", "agency", "ecommerce", "generic"], motion: 2, license: "ReFrame original", when: "Asymmetric bento with hover depth; modern brands." },

  // Services
  { variant: "ServicesList", category: "services", sectors: "all", motion: 1, license: "ReFrame original", when: "Editorial numbered services index; serif titles, hairline rules." },

  // Portfolio / visual work (also serves products & gallery)
  { variant: "PortfolioGrid", category: "portfolio", sectors: "all", motion: 2, license: "ReFrame original", when: "Asymmetric 'Selected work' image grid with a monumental lead tile." },

  // Stats / credibility
  { variant: "StatsCounter", category: "stats", sectors: "all", motion: 2, license: "ReFrame original", when: "Dark band of animated counters; measured credibility." },

  // About
  { variant: "AboutSplit", category: "about", sectors: "all", motion: 1, license: "ReFrame original", when: "Portrait + serif narrative with inline credibility chips." },

  // One strong variant each (extend later)
  { variant: "TestimonialsSlider1", category: "testimonials", sectors: "all", motion: 1, license: "ReFrame original", when: "Three-up testimonial cards." },
  { variant: "FAQAccordion1", category: "faq", sectors: "all", motion: 1, license: "ReFrame original", when: "Accordion FAQ." },
  { variant: "CTASection1", category: "cta", sectors: "all", motion: 1, license: "ReFrame original", when: "High-contrast closing CTA." },
  { variant: "ContactFormPremium1", category: "contact", sectors: "all", motion: 0, license: "ReFrame original", when: "Two-column contact form." },
  { variant: "Footer1", category: "footer", sectors: "all", motion: 0, license: "ReFrame original", when: "Minimal footer." },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

/** Variants available for a section in a given sector (sector-specific first). */
export function variantsFor(category: BlockType, industry: Industry): string[] {
  const exact = BLOCK_CATALOG.filter(
    (b) => b.category === category && b.sectors !== "all" && (b.sectors as Industry[]).includes(industry)
  );
  const universal = BLOCK_CATALOG.filter((b) => b.category === category && b.sectors === "all");
  const pool = [...exact, ...universal];
  return pool.length ? pool.map((b) => b.variant) : universal.map((b) => b.variant);
}

/**
 * Deterministically pick a variant for a section. Sector-appropriate variants
 * are preferred; the seed (e.g. the brand name) spreads choices so different
 * sites don't all look identical. Deterministic = same site, same result.
 */
export function pickVariant(category: BlockType, industry: Industry, seed: string): string {
  const variants = variantsFor(category, industry);
  if (variants.length === 0) return `${category}`;
  return variants[hash(seed + category) % variants.length];
}
