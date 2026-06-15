import type { BlockType, Industry, Theme } from "./types";

type Mood = Theme["mood"];

/**
 * Block catalog — the manifest the engine (and, when enabled, the LLM) selects
 * from. Each entry describes one template variant: which section it is, which
 * sectors and moods it suits, how animated it is, and where it came from.
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
  /** Brand moods this variant flatters. Omit for mood-neutral variants. */
  moods?: Mood[];
  /** 0 = static, 1 = subtle, 2 = rich, 3 = cinematic. */
  motion: 0 | 1 | 2 | 3;
  /** Provenance + license, so the library stays legally clean. */
  license: string;
  when: string;
}

export const BLOCK_CATALOG: BlockMeta[] = [
  // Heroes
  { variant: "HeroPremium1", category: "hero", sectors: "all", moods: ["minimal", "bold"], motion: 1, license: "ReFrame original", when: "Centered, message-first hero. Safe default." },
  { variant: "HeroPremium2", category: "hero", sectors: ["restaurant", "realestate", "health", "agency"], moods: ["warm", "minimal"], motion: 1, license: "ReFrame original", when: "Split hero with a strong asset; warm/visual sectors." },
  { variant: "HeroSpotlight", category: "hero", sectors: ["saas", "agency", "ecommerce", "generic"], moods: ["bold", "minimal"], motion: 2, license: "ReFrame original (inspired by Aceternity/Magic UI, MIT)", when: "Tech/SaaS hero with an animated accent aura." },
  { variant: "HeroEditorial", category: "hero", sectors: ["restaurant", "realestate", "health", "agency", "ecommerce"], moods: ["elegant", "warm"], motion: 2, license: "ReFrame original", when: "Editorial luxury hero: serif display, framed client portrait, monumental wordmark. Warm/elegant brands." },
  { variant: "HeroImageFull", category: "hero", sectors: ["restaurant", "realestate", "health", "agency", "ecommerce"], moods: ["warm", "elegant", "bold"], motion: 2, license: "ReFrame original", when: "Full-bleed image hero with an editorial scrim; image-led sectors (hospitality, property, retail)." },
  { variant: "HeroMonumental", category: "hero", sectors: ["realestate", "agency", "restaurant", "ecommerce"], moods: ["bold"], motion: 2, license: "ReFrame original (inspired by ARCFORM/Archinest Framer templates)", when: "Full-bleed photo + colossal brand wordmark across the bottom; confident, bold, image-led brands." },

  // Features
  { variant: "FeaturesGrid1", category: "features", sectors: "all", moods: ["minimal", "elegant"], motion: 1, license: "ReFrame original", when: "Hairline-gap feature grid. Safe default." },
  { variant: "FeaturesBento", category: "features", sectors: ["saas", "agency", "ecommerce", "generic"], moods: ["bold", "minimal"], motion: 2, license: "ReFrame original", when: "Asymmetric bento with hover depth; modern brands." },
  { variant: "FeaturesAlternating", category: "features", sectors: ["saas", "health", "agency", "realestate", "generic"], moods: ["minimal", "elegant"], motion: 1, license: "ReFrame original", when: "Alternating feature rows; calm editorial narrative." },

  // Services
  { variant: "ServicesList", category: "services", sectors: "all", moods: ["elegant", "warm", "minimal"], motion: 1, license: "ReFrame original", when: "Editorial numbered services index; serif titles, hairline rules." },
  { variant: "ServicesCards", category: "services", sectors: ["saas", "agency", "ecommerce", "health", "generic"], moods: ["bold", "minimal"], motion: 1, license: "ReFrame original", when: "Service card grid that warms on hover; modern/bold brands." },

  // Portfolio / visual work (also serves products & gallery)
  { variant: "PortfolioGrid", category: "portfolio", sectors: "all", moods: ["elegant", "warm", "bold"], motion: 2, license: "ReFrame original", when: "Asymmetric 'Selected work' image grid with a monumental lead tile." },
  // Menu / price-list collection. sectors:[] => only used explicitly (the engine
  // builds the Menu page), never auto-selected by the scorer.
  { variant: "CollectionGrid", category: "portfolio", sectors: [], motion: 1, license: "ReFrame original", when: "Owner-managed menu / price list: name, price, description rows." },

  // Stats / credibility
  { variant: "StatsCounter", category: "stats", sectors: "all", moods: ["bold", "minimal"], motion: 2, license: "ReFrame original", when: "Dark band of animated counters; measured credibility." },

  // About
  { variant: "AboutSplit", category: "about", sectors: "all", moods: ["elegant", "warm"], motion: 1, license: "ReFrame original", when: "Portrait + serif narrative with inline credibility chips." },

  // Testimonials — dark slider for bold/tech, light editorial for warm/elegant
  { variant: "TestimonialsSlider1", category: "testimonials", sectors: "all", moods: ["bold", "minimal"], motion: 1, license: "ReFrame original", when: "Cross-fading single-quote slider on a dark band." },
  { variant: "TestimonialsEditorial", category: "testimonials", sectors: "all", moods: ["elegant", "warm"], motion: 1, license: "ReFrame original", when: "Light press-page layout: serif pull-quote + hairline column." },
  { variant: "TestimonialsGrid", category: "testimonials", sectors: "all", moods: ["warm", "elegant", "minimal"], motion: 1, license: "ReFrame original", when: "Three-card review grid with star ratings + initials avatars; broad credibility." },

  { variant: "FAQAccordion1", category: "faq", sectors: "all", motion: 1, license: "ReFrame original", when: "Editorial accordion FAQ." },

  // CTA — dark glowing panel for bold/tech, light editorial framing for warm/elegant
  { variant: "CTASection1", category: "cta", sectors: "all", moods: ["bold", "minimal"], motion: 1, license: "ReFrame original", when: "High-contrast dark closing CTA with accent glow." },
  { variant: "CTAEditorial", category: "cta", sectors: "all", moods: ["elegant", "warm"], motion: 1, license: "ReFrame original", when: "Light serif CTA framed by hairline rules." },
  { variant: "ContactFormPremium1", category: "contact", sectors: "all", motion: 0, license: "ReFrame original", when: "Two-column contact form." },
  { variant: "Footer1", category: "footer", sectors: "all", motion: 0, license: "ReFrame original", when: "Editorial footer." },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

/** Candidate variants for a section: sector-specific matches plus universals. */
function poolFor(category: BlockType, industry: Industry): BlockMeta[] {
  const fits = BLOCK_CATALOG.filter(
    (b) =>
      b.category === category &&
      (b.sectors === "all" || (b.sectors as Industry[]).includes(industry))
  );
  // If a category only has sector-specific variants and none match, fall back to
  // every variant of that category so we never return an empty pool.
  return fits.length ? fits : BLOCK_CATALOG.filter((b) => b.category === category);
}

/** Variants available for a section in a given sector (sector-specific first). */
export function variantsFor(category: BlockType, industry: Industry): string[] {
  const pool = poolFor(category, industry);
  // sector-specific before universal, for callers that want the raw list
  return [...pool]
    .sort((a, b) => Number(b.sectors !== "all") - Number(a.sectors !== "all"))
    .map((b) => b.variant);
}

/** How much animation a mood wants (0 calm … 3 cinematic). */
const MOTION_APPETITE: Record<Mood, number> = { minimal: 1, elegant: 2, warm: 2, bold: 3 };

/**
 * Score how well a variant fits a brand. Higher is better. Three signals:
 *  - sector fit: the variant explicitly lists this industry (vs. universal),
 *  - mood fit: the variant flatters the brand's mood,
 *  - motion fit: its animation level matches the mood's appetite.
 */
function scoreVariant(b: BlockMeta, industry: Industry, mood: Mood): number {
  let score = 0;
  if (b.sectors !== "all" && (b.sectors as Industry[]).includes(industry)) score += 4;
  if (b.moods?.includes(mood)) score += 3;
  score += 2 - Math.abs(b.motion - MOTION_APPETITE[mood]); // +2 perfect … negative if far off
  return score;
}

/**
 * Deterministically pick the best variant for a section, scoring each candidate
 * on sector + mood + motion fit. Ties are broken by a seed (e.g. the brand name)
 * so distinct brands with the same profile don't all land on the same template.
 * Deterministic = same site, same result; no randomness.
 */
export function pickVariant(
  category: BlockType,
  industry: Industry,
  seed: string,
  mood: Mood = "minimal"
): string {
  const pool = poolFor(category, industry);
  if (pool.length === 0) return `${category}`;
  const scored = pool.map((b) => ({ variant: b.variant, score: scoreVariant(b, industry, mood) }));
  const best = Math.max(...scored.map((s) => s.score));
  const top = scored.filter((s) => s.score === best).map((s) => s.variant);
  return top[hash(seed + category) % top.length];
}
