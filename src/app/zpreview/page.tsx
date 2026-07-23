import { SiteRenderer } from "@/components/blocks";
import { generateSite } from "@/lib/generation/engine";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, BlockType, Industry, GenerationMode, ScrapedImage } from "@/lib/generation/types";

/**
 * Internal template gallery. Generates a full, realistic site through the real
 * engine so the premium templates can be audited visually. Parametrised so any
 * sector / image-availability / mode can be checked:
 *   /zpreview?industry=restaurant         (with sample images)
 *   /zpreview?industry=artisan&img=0      (no images — the typical dated SMB)
 *   /zpreview?industry=health&mode=classic
 * Not linked anywhere; safe to keep out of the public surface.
 */
const sections: BlockType[] = [
  "hero", "about", "services", "portfolio", "stats", "testimonials", "faq", "cta", "contact", "footer",
];

const img = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80`;

/**
 * Sector-appropriate imagery (every URL verified 200). A restaurant preview
 * must look like a restaurant, not a code editor: the fixture is how the
 * generated templates are judged, so its imagery has to be premium AND true
 * to the industry. Order matters: [0] is the hero.
 */
const INDUSTRY_IMAGES: Partial<Record<Industry, string[]>> = {
  restaurant: [
    img("photo-1414235077428-338989a2e8c0"),
    img("photo-1517248135467-4c7edcad34c4"),
    img("photo-1504674900247-0877df9cc836"),
    img("photo-1555396273-367ea4eb4db5"),
    img("photo-1544148103-0773bf10d330"),
    img("photo-1546069901-ba9599a7e63c"),
  ],
  agency: [
    img("photo-1497366216548-37526070297c"),
    img("photo-1522071820081-009f0129c71c"),
    img("photo-1524758631624-e2822e304c36"),
    img("photo-1497215728101-856f4ea42174"),
    img("photo-1521737711867-e3b97375f902"),
    img("photo-1497366811353-6870744d04b2"),
  ],
  realestate: [
    img("photo-1600585154340-be6161a56a0c"),
    img("photo-1600607687939-ce8a6c25118c"),
    img("photo-1512917774080-9991f1c4c750"),
    img("photo-1600566753190-17f0baa2a6c3"),
    img("photo-1600210492486-724fe5c67fb0"),
    img("photo-1600566753086-00f18fb6b3ea"),
  ],
  artisan: [
    img("photo-1504148455328-c376907d081c"),
    img("photo-1452860606245-08befc0ff44b"),
    img("photo-1416879595882-3373a0480b5b"),
    img("photo-1529220502050-f15e570c634e"),
    img("photo-1572981779307-38b8cabb2407"),
    img("photo-1486406146926-c627a92ad1ab"),
  ],
  ecommerce: [
    img("photo-1441986300917-64674bd600d8"),
    img("photo-1542291026-7eec264c27ff"),
    img("photo-1505740420928-5e560c06d30e"),
    img("photo-1523381210434-271e8be1f52b"),
    img("photo-1526170375885-4d8ecf77b99f"),
    img("photo-1560343090-f0409e92791a"),
  ],
  health: [
    img("photo-1576091160399-112ba8d25d1d"),
    img("photo-1579684385127-1ef15d508118"),
    img("photo-1538108149393-fbbd81895907"),
    img("photo-1584982751601-97dcc096659c"),
    img("photo-1631217868264-e5b90bb7e133"),
    img("photo-1576765608535-5f04d1e3f289"),
  ],
  saas: [
    img("photo-1498050108023-c5249f4df085"),
    img("photo-1531403009284-440f080d1e12"),
    img("photo-1517694712202-14dd9538aa97"),
    img("photo-1454165804606-c3d57bc86b40"),
    img("photo-1467232004584-a241de8bcf5d"),
    img("photo-1487058792275-0ad4aaf24ca7"),
  ],
};

/** Premium neutral fallback for sectors without a curated set. */
const GENERIC_IMAGES = [
  img("photo-1486406146926-c627a92ad1ab"),
  img("photo-1449824913935-59a10b8d2000"),
  img("photo-1470071459604-3b5ec3a7fe05"),
  img("photo-1506905925346-21bda4d32df4"),
  img("photo-1441974231531-c6227db76b6e"),
  img("photo-1493397212122-2b85dda8106b"),
];

/** Real portraits for the team section (not screenshots of code). */
const TEAM_PORTRAITS = [
  img("photo-1560250097-0b93528c311a"),
  img("photo-1573496359142-b8d87734a5a2"),
  img("photo-1519085360753-af0119f7cbe7"),
  img("photo-1438761681033-6461ffad8d80"),
];

// QA: per-sector "signature" alt words — attached to a mid-array image so the
// semantic distributor must reorder off the first-in-DOM shot to lead the hero.
// Mirrors what real scraping reads from the source's alt text.
const SECTOR_SIGNATURE_ALT: Partial<Record<Industry, string>> = {
  restaurant: "grilled plated signature dish, chef special",
  architect: "modern villa facade, exterior architecture",
  realestate: "modern villa facade, exterior property",
  saas: "the product dashboard analytics screen",
  automotive: "a detailed sports car in the workshop",
  ecommerce: "the product collection lookbook",
};
function buildImagesRich(industry: Industry, images: string[]): ScrapedImage[] {
  const sig = SECTOR_SIGNATURE_ALT[industry];
  return images.map((url, i) => {
    // index 0 = a plain content/detail frame; index 2 = the tagged signature
    // (kind social + strong sector alt) → semantics must pick it for the hero.
    if (i === 2 && sig) return { url, alt: sig, kind: "social", w: 1600, h: 1000 };
    if (i === 0) return { url, alt: "a quiet interior detail", kind: "content", w: 1600, h: 1000 };
    return { url, alt: undefined, kind: "gallery", w: 1400, h: 1000 };
  });
}
function buildAnalysis(industry: Industry, withImages: boolean, brandName = "Northlight", withRich = true): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  const images = withImages ? INDUSTRY_IMAGES[industry] ?? GENERIC_IMAGES : [];
  return {
    url: `https://demo-${industry}.com`,
    brandName,
    industry,
    industryLabel: p.label,
    fetched: true,
    confidence: "full",
    detectedSections: [],
    brand: { accentColor: p.theme.accent },
    navItems: ["Home", "Services", "About", "Contact"],
    structure: { sections: sections.map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
    extractedContent: {
      headline: p.defaults.headline,
      description: p.defaults.description,
      services: p.defaults.services,
      heroImageUrl: images[0],
      images,
      ...(withImages && withRich ? { imagesRich: buildImagesRich(industry, images) } : {}),
      faqItems: [
        { question: "How quickly can you start?", answer: "Most projects begin within a few days of your first message — just reach out." },
        { question: "How is a project priced?", answer: "Every project is quoted transparently up front, with no hidden fees and no surprises." },
        { question: "Do you work with our existing brand?", answer: "Yes. We preserve your identity and elevate the design, hierarchy and conversion around it." },
      ],
      socialLinks: [
        { platform: "Instagram", url: "https://instagram.com/northlight" },
        { platform: "LinkedIn", url: "https://linkedin.com/company/northlight" },
        { platform: "X", url: "https://x.com/northlight" },
      ],
      team: [
        { name: "Élise Caron", role: "Founder & Principal", image: TEAM_PORTRAITS[0], bio: "Twenty years shaping spaces across Europe, with a relentless eye for light and proportion." },
        { name: "Marcus Reede", role: "Creative Director", image: TEAM_PORTRAITS[1], bio: "Leads every project from first sketch to final reveal." },
        { name: "Priya Nair", role: "Head of Delivery", image: TEAM_PORTRAITS[2], bio: "Keeps complex builds calm, on time and on budget." },
        { name: "Tomás Vidal", role: "Senior Designer", image: TEAM_PORTRAITS[3], bio: "Detail-obsessed, from joinery to typography." },
      ],
      // A photographed collection (each item keeps its OWN real photo) → renders
      // as the premium on-page CollectionShowcase. With no images it falls back
      // to a text menu on a dedicated page (both paths exercised by ?img=0).
      collection: {
        items: withImages
          ? [
              { name: "Burrata & heirloom tomato", description: "Stracciatella, basil oil, aged balsamic.", image: images[1] },
              { name: "Tagliatelle al ragù", description: "Slow-cooked beef, parmigiano, hand-cut pasta.", image: images[2] },
              { name: "Branzino al forno", description: "Whole sea bass, lemon, rosemary potatoes.", image: images[3] },
              { name: "Wood-fired focaccia", description: "Rosemary, flaked salt, olive oil.", image: images[4] },
              { name: "Seasonal risotto", description: "Carnaroli, parmigiano, market vegetables.", image: images[5] },
              { name: "Tiramisù", description: "Mascarpone, espresso, cocoa.", image: images[0] },
            ]
          : [
              { name: "Burrata & heirloom tomato", price: "€14", description: "Stracciatella, basil oil, aged balsamic." },
              { name: "Tagliatelle al ragù", price: "€18", description: "Slow-cooked beef, parmigiano, hand-cut pasta." },
              { name: "Branzino al forno", price: "€26", description: "Whole sea bass, lemon, rosemary potatoes." },
              { name: "Tiramisù", price: "€9", description: "Mascarpone, espresso, cocoa." },
            ],
      },
      testimonials: [
        { quote: "They rebuilt our site in days and it finally looks like the business we actually run.", name: "Élise Caron", role: "Owner" },
        { quote: "The most senior, least precious team we've worked with. They made us look world-class.", name: "Marcus Reede", role: "Founder" },
        { quote: "Every detail considered. Enquiries went up the first month.", name: "Priya Nair", role: "Director" },
      ],
      stats: [
        { value: "120+", label: "Projects delivered" },
        { value: "14", label: "Years in practice" },
        { value: "9", label: "Awards" },
        { value: "4", label: "Cities" },
      ],
      contact: {
        phone: "+33 1 23 45 67 89",
        email: "hello@northlight.studio",
        address: "22 Rue Debelleyme, 75003 Paris",
        bookingUrl: "https://cal.com/northlight",
      },
    },
    scores: { design: 62, performance: 58, seo: 54, mobile: 60, accessibility: 56 },
    issues: [],
  };
}

const INDUSTRIES: Industry[] = ["restaurant", "artisan", "realestate", "saas", "agency", "ecommerce", "health", "generic", "architect", "hotel"];

export default function PreviewPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const industry = (INDUSTRIES.includes(searchParams.industry as Industry) ? searchParams.industry : "agency") as Industry;
  const withImages = searchParams.img !== "0";
  const mode = (["preserve", "smart", "classic"].includes(searchParams.mode || "") ? searchParams.mode : "smart") as GenerationMode;
  // QA: override the brand name (the layout seed) to audit per-brand variety
  // (e.g. ?industry=restaurant&brand=Osteria vs &brand=Bistro pick different heroes).
  const brandName = (searchParams.brand || "").trim() || "Northlight";
  // QA: ?rich=0 disables the extracted image metadata → positional fallback,
  // to A/B the semantic placement against DOM order on a real render.
  const withRich = searchParams.rich !== "0";
  const analysis = buildAnalysis(industry, withImages, brandName, withRich);
  // QA: override the brand accent to audit contrast (e.g. ?accent=ffd400 for yellow).
  if (/^[0-9a-fA-F]{6}$/.test(searchParams.accent || "")) {
    analysis.brand = { ...analysis.brand, accentColor: `#${searchParams.accent}` };
  }
  const schema = generateSite(analysis, { mode });
  // QA: force a specific variant for a given block type (e.g. ?bvariant=features:FeaturesSticky).
  const bv = (searchParams.bvariant || "").split(":");
  if (bv.length === 2) {
    for (const b of schema.blocks) if (b.type === bv[0]) b.variant = bv[1];
  }
  if (searchParams.anim === "0") schema.animations = false; // QA: preview with motion off
  if (searchParams.dark === "1") schema.theme = { ...schema.theme, dark: true }; // QA: dark mode
  return <SiteRenderer schema={schema} />;
}
