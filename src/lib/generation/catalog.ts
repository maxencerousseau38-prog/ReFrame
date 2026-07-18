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
  /**
   * Sectors where this variant is the intended house default and should be
   * strongly preferred (e.g. the centered Apple-style product hero for retail).
   * Adds a decisive bonus, above sector/mood fit, without hard-coding routing.
   */
  prefer?: Industry[];
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
  { variant: "HeroSplitPremium", category: "hero", sectors: ["saas", "ecommerce", "agency", "generic", "health", "coach", "finance", "gym"], prefer: ["ecommerce", "generic"], moods: ["minimal", "bold"], motion: 2, license: "ReFrame original (inspired by Linear/Stripe/Vercel)", when: "Split: copy left, a floating product-preview card (browser chrome + image, glow, mouse-follow tilt) right. The modern premium default." },
  { variant: "HeroBento", category: "hero", sectors: ["saas", "agency", "generic", "coach", "finance"], prefer: ["saas"], moods: ["bold", "minimal"], motion: 2, license: "ReFrame original (inspired by Framer bento templates)", when: "Headline + a bento fusing the product preview with real metrics (when genuine) or key services. SaaS/proof-led brands." },
  { variant: "HeroAurora", category: "hero", sectors: ["saas", "agency", "ecommerce", "generic", "health", "coach", "medical"], prefer: ["health"], moods: ["bold", "minimal"], motion: 3, license: "ReFrame original (effects inspired by Linear/Framer ambient detailing)", when: "Cinematic ambient hero: drifting brand aurora, overhead spotlight, faint meteors, blur-fade copy, beam-lit product preview. Atmospheric tech/wellness brands." },
  { variant: "HeroPremium1", category: "hero", sectors: "all", moods: ["minimal", "bold"], motion: 1, license: "ReFrame original", when: "Centered hero with a large centered product shot. Conservative fallback only; not a sector default." },
  { variant: "HeroPremium2", category: "hero", sectors: ["restaurant", "realestate", "health", "agency", "hotel", "lawyer", "medical", "finance", "fashion"], moods: ["warm", "minimal"], motion: 1, license: "ReFrame original", when: "Split hero with a strong asset; warm/visual sectors." },
  { variant: "HeroSpotlight", category: "hero", sectors: ["saas", "agency", "ecommerce", "generic", "coach", "finance"], moods: ["bold", "minimal"], motion: 2, license: "ReFrame original (inspired by Aceternity/Magic UI, MIT)", when: "Tech/SaaS hero with an animated accent aura." },
  { variant: "HeroEditorial", category: "hero", sectors: ["restaurant", "realestate", "health", "agency", "ecommerce", "hotel", "architect", "lawyer", "fashion"], moods: ["elegant", "warm"], motion: 2, license: "ReFrame original", when: "Editorial luxury hero: serif display, framed client portrait, monumental wordmark. Warm/elegant brands." },
  { variant: "HeroImageFull", category: "hero", sectors: ["restaurant", "realestate", "health", "agency", "ecommerce", "hotel", "automotive", "construction", "architect"], prefer: ["restaurant", "hotel"], moods: ["warm", "elegant", "bold"], motion: 2, license: "ReFrame original", when: "Full-bleed immersive image hero with an editorial scrim; image-led sectors (hospitality, property, retail)." },
  { variant: "HeroMonumental", category: "hero", sectors: ["realestate", "agency", "restaurant", "ecommerce", "architect", "construction"], prefer: ["architect"], moods: ["bold"], motion: 2, license: "ReFrame original (inspired by ARCFORM/Archinest Framer templates)", when: "Full-bleed photo + colossal brand wordmark across the bottom; confident, bold, image-led brands." },
  { variant: "HeroAgencia", category: "hero", sectors: ["agency", "saas", "ecommerce", "generic", "coach"], prefer: ["agency"], moods: ["bold"], motion: 3, license: "ReFrame original (inspired by Agencia/Framer agency templates)", when: "Near-black canvas, colossal condensed wordmark, ember accent, two-tone tagline; bold modern studios/agencies." },
  // sectors:[] => only used explicitly (the engine routes here when no usable
  // hero image was extracted), never auto-selected by the scorer.
  { variant: "HeroBeam", category: "hero", sectors: ["saas", "agency", "generic", "health", "ecommerce", "coach", "finance"], prefer: ["saas"], moods: ["bold", "minimal"], motion: 3, license: "ReFrame original (Linear/Vercel/Framer premium)", when: "Centered statement hero: badge pill, a brand-gradient keyword in the headline, dual CTA, a slow conic beam + masked grid, real trust stats. Modern SaaS/tech brands." },
  { variant: "HeroArchform", category: "hero", sectors: ["realestate", "agency", "restaurant", "ecommerce", "generic", "health", "hotel", "architect", "construction", "automotive"], prefer: ["realestate"], moods: ["bold"], motion: 2, license: "ReFrame original (inspired by ARCHFORM/Framer premium)", when: "Full-bleed photo with a colossal UPPERCASE display line bottom-left, brand + sector meta row, pill CTAs and a scroll cue; bold, image-led, architectural brands." },
  { variant: "HeroCanvas", category: "hero", sectors: [], motion: 2, license: "ReFrame original", when: "Image-free premium hero: a brand canvas (gradient mesh, monogram, drifting accent orbs). Used when the source site has no usable image." },

  // Features
  { variant: "FeaturesGrid1", category: "features", sectors: "all", moods: ["minimal", "elegant"], motion: 1, license: "ReFrame original", when: "Hairline-gap feature grid. Safe default." },
  { variant: "FeaturesBento", category: "features", sectors: ["saas", "agency", "ecommerce", "generic", "coach", "finance"], moods: ["bold", "minimal"], motion: 2, license: "ReFrame original", when: "Asymmetric bento with hover depth; modern brands." },
  { variant: "FeaturesAlternating", category: "features", sectors: ["saas", "health", "agency", "realestate", "generic", "medical", "lawyer", "finance", "hotel"], moods: ["minimal", "elegant"], motion: 1, license: "ReFrame original", when: "Alternating feature rows; calm editorial narrative." },
  { variant: "FeaturesSpotlight", category: "features", sectors: ["saas", "agency", "ecommerce", "generic", "coach", "gym"], moods: ["bold", "minimal"], motion: 2, license: "ReFrame original (cursor spotlight, Aceternity-inspired)", when: "Feature cards lit by a cursor-following spotlight; modern tech brands." },
  { variant: "FeaturesColumns", category: "features", sectors: "all", moods: ["minimal", "elegant", "warm"], motion: 1, license: "ReFrame original", when: "Tidy numbered columns with a top accent rule; calm, content-dense friendly." },
  { variant: "FeaturesSticky", category: "features", sectors: ["saas", "agency", "health", "realestate", "generic", "lawyer", "finance", "medical", "coach"], moods: ["minimal", "elegant"], motion: 1, license: "ReFrame original (Linear/Framer editorial)", when: "Sticky narrative heading beside hairline-separated, indexed capability rows; calm editorial, service-led brands." },
  { variant: "FeaturesShowcase", category: "features", sectors: ["restaurant", "realestate", "health", "agency", "ecommerce", "hotel", "architect", "fashion", "automotive", "construction"], moods: ["warm", "elegant", "bold"], motion: 2, license: "ReFrame original (Apple feature-grid)", when: "Uniform image-led feature cards (real photo + title + description); image-rich, visual sectors. Clean icon tiles without imagery." },
  { variant: "FeaturesBigType", category: "features", sectors: "all", moods: ["minimal", "elegant", "bold"], motion: 1, license: "ReFrame original (Arc/Vercel editorial)", when: "Single editorial column of oversized numbered feature rows; calm statement clarity, content-confident brands." },
  { variant: "ProcessTimeline", category: "features", sectors: ["artisan", "agency", "health", "realestate", "saas", "generic", "plumber", "electrician", "construction", "lawyer", "medical", "architect", "coach"], prefer: ["artisan", "plumber", "electrician", "construction"], moods: ["minimal", "elegant", "bold"], motion: 2, license: "ReFrame original (agency process storytelling)", when: "Connected numbered timeline of the client's real services as a 'how we work' journey; service-led trades (plumbers, agencies, clinics)." },
  { variant: "FeaturesProcess", category: "features", sectors: ["architect", "agency", "realestate", "construction", "health", "hotel", "fashion"], prefer: ["architect"], moods: ["bold", "minimal", "elegant"], motion: 2, license: "ReFrame original (mined architecture from an architectural studio's Process section)", when: "Monumental image-led 'how we work' narrative: alternating photo / numbered-step rows, huge numerals, staggered reveal, generous rhythm. The premium image-rich counterpart to ProcessTimeline; for studios/agencies/property with real imagery." },

  // Services
  { variant: "ServicesList", category: "services", sectors: "all", moods: ["elegant", "warm", "minimal"], motion: 1, license: "ReFrame original", when: "Editorial numbered services index; serif titles, hairline rules." },
  { variant: "ServicesCards", category: "services", sectors: ["saas", "agency", "ecommerce", "health", "generic", "gym", "coach", "plumber", "electrician", "construction", "medical"], moods: ["bold", "minimal"], motion: 1, license: "ReFrame original", when: "Service card grid that warms on hover; modern/bold brands." },

  // Portfolio / visual work (also serves products & gallery)
  { variant: "PortfolioGrid", category: "portfolio", sectors: "all", moods: ["elegant", "warm", "bold"], motion: 2, license: "ReFrame original", when: "Asymmetric 'Selected work' image grid with a monumental lead tile." },
  { variant: "GalleryMasonry", category: "portfolio", sectors: "all", moods: ["minimal", "bold", "elegant"], motion: 2, license: "ReFrame original", when: "Columns/masonry image gallery with hover captions." },
  { variant: "GalleryStrip", category: "portfolio", sectors: "all", moods: ["bold", "minimal"], motion: 1, license: "ReFrame original", when: "Horizontal scroll-snap image rail; swipeable, modern." },
  { variant: "GalleryFeature", category: "portfolio", sectors: ["restaurant", "realestate", "health", "agency", "ecommerce", "hotel", "architect", "fashion", "automotive", "construction"], moods: ["warm", "elegant", "bold"], motion: 2, license: "ReFrame original", when: "Full-bleed alternating image bands with captions; editorial, image-led." },
  { variant: "GalleryBento", category: "portfolio", sectors: ["restaurant", "hotel", "realestate", "architect", "agency", "fashion", "ecommerce", "health"], prefer: ["restaurant", "hotel"], moods: ["warm", "elegant", "bold"], motion: 2, license: "ReFrame original (editorial collage grammar)", when: "Asymmetric editorial photo collage: one monumental lead tile + satellite tiles, staggered reveal, hover captions with an index. Renders REAL images only (imageless items dropped). Image-rich hospitality/property/studio brands." },
  // Menu / price-list collection. sectors:[] => only used explicitly (the engine
  // builds the Menu page), never auto-selected by the scorer.
  { variant: "CollectionGrid", category: "portfolio", sectors: [], motion: 1, license: "ReFrame original", when: "Owner-managed menu / price list: name, price, description rows." },
  { variant: "ProductGrid", category: "portfolio", sectors: [], motion: 1, license: "ReFrame original", when: "Real product catalogue (name, price, image): the client's scraped products on a dedicated Shop page. Emitted directly when products are extracted, never auto-selected." },

  // Stats / credibility
  { variant: "StatsCounter", category: "stats", sectors: "all", moods: ["bold", "minimal"], motion: 2, license: "ReFrame original", when: "Dark band of animated counters; measured credibility." },

  // About
  { variant: "AboutSplit", category: "about", sectors: "all", moods: ["elegant", "warm"], motion: 1, license: "ReFrame original", when: "Portrait + serif narrative with inline credibility chips." },
  { variant: "StatementAgencia", category: "about", sectors: ["agency", "saas", "ecommerce", "generic", "gym", "coach", "automotive"], moods: ["bold"], motion: 2, license: "ReFrame original (inspired by Agencia/Framer agency templates)", when: "Centred numbered pill over a monumental two-tone mission statement + wide image plate; bold dark brands." },
  { variant: "StatementEditorial", category: "about", sectors: ["restaurant", "realestate", "health", "agency", "ecommerce", "hotel", "architect", "lawyer", "fashion", "medical", "finance"], moods: ["elegant", "warm", "bold"], motion: 1, license: "ReFrame original (inspired by Havenn/Framer editorial templates)", when: "Monumental editorial statement: an oversized section title with a faint ghosted echo, beside a tall asymmetric framed image. Warm/elegant image-led brands." },
  { variant: "TeamGrid", category: "team", sectors: [], motion: 1, license: "ReFrame original", when: "Premium people roster: portrait cards (photo + name + role + short bio). Emitted directly when real team members are extracted, never auto-selected." },

  // Testimonials — dark slider for bold/tech, light editorial for warm/elegant
  { variant: "TestimonialsSlider1", category: "testimonials", sectors: "all", moods: ["bold", "minimal"], motion: 1, license: "ReFrame original", when: "Cross-fading single-quote slider on a dark band." },
  { variant: "TestimonialsEditorial", category: "testimonials", sectors: "all", moods: ["elegant", "warm"], motion: 1, license: "ReFrame original", when: "Light press-page layout: serif pull-quote + hairline column." },
  { variant: "TestimonialsGrid", category: "testimonials", sectors: "all", moods: ["warm", "elegant", "minimal"], motion: 1, license: "ReFrame original", when: "Three-card review grid with star ratings + initials avatars; broad credibility." },
  { variant: "TestimonialsSpotlight", category: "testimonials", sectors: "all", moods: ["bold", "minimal"], motion: 1, license: "ReFrame original", when: "One monumental pull-quote on a glowing dark panel; the single big proof." },
  { variant: "TestimonialsStacked", category: "testimonials", sectors: "all", moods: ["elegant", "warm", "minimal"], motion: 1, license: "ReFrame original", when: "Editorial stacked pull-quotes, alternating, hairline-separated." },
  { variant: "TestimonialsNocturne", category: "testimonials", sectors: ["restaurant", "hotel"], prefer: ["restaurant", "hotel"], moods: ["warm", "elegant"], motion: 2, license: "ReFrame original", when: "Dark atmospheric 'evening' testimonial band: monumental serif pull-quote on the brand's contrast surface + supporting quotes. A signature evening beat for restaurants and hotels, whose pages were otherwise tonally flat." },

  { variant: "FAQAccordion1", category: "faq", sectors: "all", moods: ["bold", "minimal"], motion: 1, license: "ReFrame original", when: "Editorial accordion FAQ." },
  { variant: "FaqGrid", category: "faq", sectors: "all", moods: ["minimal", "elegant", "warm"], motion: 1, license: "ReFrame original", when: "Two-column FAQ, all answers visible; scannable editorial alternative to the accordion." },

  // CTA — dark glowing panel for bold/tech, light editorial framing for warm/elegant
  { variant: "CTASection1", category: "cta", sectors: "all", moods: ["bold", "minimal"], motion: 1, license: "ReFrame original", when: "High-contrast dark closing CTA with accent glow." },
  { variant: "CTAEditorial", category: "cta", sectors: "all", moods: ["elegant", "warm"], motion: 1, license: "ReFrame original", when: "Light serif CTA framed by hairline rules." },
  { variant: "CTAAsterisk", category: "cta", sectors: ["agency", "saas", "ecommerce", "generic", "gym", "coach", "automotive"], moods: ["bold"], motion: 3, license: "ReFrame original (inspired by Agencia/Framer agency templates)", when: "Colossal condensed sign-off over a hot gradient plate with a rotating asterisk + contact link; bold dark brands." },
  { variant: "CTABanner", category: "cta", sectors: "all", moods: ["minimal", "bold", "warm"], motion: 1, license: "ReFrame original", when: "Compact horizontal CTA band (headline left, button right) on a brand-tinted surface." },
  { variant: "CTAGradient", category: "cta", sectors: ["saas", "agency", "ecommerce", "generic"], moods: ["bold", "minimal"], motion: 1, license: "ReFrame original (Stripe/Vercel-inspired)", when: "Full-bleed accent-gradient closing panel with an ambient glow and a colossal headline." },
  { variant: "ContactFormPremium1", category: "contact", sectors: "all", moods: ["minimal", "bold"], motion: 0, license: "ReFrame original", when: "Two-column contact form." },
  { variant: "ContactDetailsCard", category: "contact", sectors: "all", moods: ["elegant", "warm", "minimal"], motion: 0, license: "ReFrame original", when: "Centered premium card with real email/phone/address + a primary action; no form." },
  { variant: "ContactBanner", category: "contact", sectors: ["agency", "saas", "ecommerce", "generic"], moods: ["bold"], motion: 1, license: "ReFrame original", when: "Full-bleed brand-contrast closing band with email/call/book buttons." },
  { variant: "Footer1", category: "footer", sectors: "all", motion: 0, license: "ReFrame original", when: "Editorial footer." },
  { variant: "FooterColumns", category: "footer", sectors: ["saas", "agency", "ecommerce", "generic"], moods: ["minimal", "bold"], motion: 0, license: "ReFrame original", when: "Multi-column site-map footer: brand + pages + real services + real contact." },
  { variant: "FooterMinimal", category: "footer", sectors: "all", moods: ["bold", "elegant"], motion: 0, license: "ReFrame original", when: "Minimal centered footer with a colossal brand wordmark watermark." },
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
  if (b.prefer?.includes(industry)) score += 5; // decisive house-default preference
  if (b.moods?.includes(mood)) score += 3;
  score += 2 - Math.abs(b.motion - MOTION_APPETITE[mood]); // +2 perfect … negative if far off
  return score;
}

/**
 * Deterministically pick the best variant for a section, scoring each candidate
 * on sector + mood + motion fit, plus a brand-seeded jitter so that two brands
 * with the SAME profile still get different layouts (the doctrine's "never the
 * same layout for every website"). The jitter is capped below the weight of a
 * single mood/sector signal, so a clearly superior variant always wins and only
 * genuinely comparable variants get reshuffled per brand. Fully deterministic:
 * same site, same result; no randomness.
 */
const JITTER_MAX = 1.6; // < the 3-pt mood / 4-pt sector weights, so fit still dominates

export function pickVariant(
  category: BlockType,
  industry: Industry,
  seed: string,
  mood: Mood = "minimal"
): string {
  const pool = poolFor(category, industry);
  if (pool.length === 0) return `${category}`;
  const scored = pool.map((b) => ({
    variant: b.variant,
    score: scoreVariant(b, industry, mood) + ((hash(seed + b.variant) % 1024) / 1024) * JITTER_MAX,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0].variant;
}
