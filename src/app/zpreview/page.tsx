import { SiteRenderer } from "@/components/blocks";
import { generateSite } from "@/lib/generation/engine";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, BlockType, Industry, GenerationMode } from "@/lib/generation/types";

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
const SAMPLE_IMAGES = [
  img("photo-1487058792275-0ad4aaf24ca7"),
  img("photo-1498050108023-c5249f4df085"),
  img("photo-1467232004584-a241de8bcf5d"),
  img("photo-1517694712202-14dd9538aa97"),
  img("photo-1531403009284-440f080d1e12"),
  img("photo-1454165804606-c3d57bc86b40"),
];

function buildAnalysis(industry: Industry, withImages: boolean): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  const images = withImages ? SAMPLE_IMAGES : [];
  return {
    url: `https://demo-${industry}.com`,
    brandName: "Northlight",
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
        { name: "Élise Caron", role: "Founder & Principal", image: SAMPLE_IMAGES[0], bio: "Twenty years shaping spaces across Europe, with a relentless eye for light and proportion." },
        { name: "Marcus Reede", role: "Creative Director", image: SAMPLE_IMAGES[1], bio: "Leads every project from first sketch to final reveal." },
        { name: "Priya Nair", role: "Head of Delivery", image: SAMPLE_IMAGES[2], bio: "Keeps complex builds calm, on time and on budget." },
        { name: "Tomás Vidal", role: "Senior Designer", image: SAMPLE_IMAGES[3], bio: "Detail-obsessed, from joinery to typography." },
      ],
      collection: {
        items: [
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

const INDUSTRIES: Industry[] = ["restaurant", "artisan", "realestate", "saas", "agency", "ecommerce", "health", "generic"];

export default function PreviewPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const industry = (INDUSTRIES.includes(searchParams.industry as Industry) ? searchParams.industry : "agency") as Industry;
  const withImages = searchParams.img !== "0";
  const mode = (["preserve", "smart", "classic"].includes(searchParams.mode || "") ? searchParams.mode : "smart") as GenerationMode;
  const schema = generateSite(buildAnalysis(industry, withImages), { mode });
  if (searchParams.anim === "0") schema.animations = false; // QA: preview with motion off
  if (searchParams.dark === "1") schema.theme = { ...schema.theme, dark: true }; // QA: dark mode
  return <SiteRenderer schema={schema} />;
}
