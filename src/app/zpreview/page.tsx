import { SiteRenderer } from "@/components/blocks";
import { generateSite } from "@/lib/generation/engine";
import type { SiteAnalysis, BlockType } from "@/lib/generation/types";

/**
 * Internal template gallery. Generates a full, realistic site through the real
 * engine (so every block gets correct props) for visually auditing the premium
 * templates. Not linked anywhere; safe to keep out of the public surface.
 */
const sections: BlockType[] = [
  "hero",
  "about",
  "services",
  "portfolio",
  "stats",
  "testimonials",
  "faq",
  "cta",
  "contact",
  "footer",
];

const img = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80`;

const analysis: SiteAnalysis = {
  url: "https://northlight.studio",
  brandName: "Northlight",
  industry: "agency",
  industryLabel: "Creative Agency",
  fetched: true,
  detectedSections: [],
  brand: { accentColor: "#6d5efc" },
  navItems: ["Work", "Studio", "Services", "Contact"],
  structure: {
    sections: sections.map((type, i) => ({ type, order: i + 1, confidence: 0.9 })),
    nav: [],
  },
  extractedContent: {
    headline: "Design that earns attention",
    description:
      "We craft brands, websites and products for companies that refuse to look like everyone else.",
    services: [
      "Brand Identity",
      "Web Design",
      "Product Design",
      "Art Direction",
      "Motion Design",
      "Strategy",
    ],
    heroImageUrl: img("photo-1487058792275-0ad4aaf24ca7"),
    images: [
      img("photo-1487058792275-0ad4aaf24ca7"),
      img("photo-1498050108023-c5249f4df085"),
      img("photo-1467232004584-a241de8bcf5d"),
      img("photo-1517694712202-14dd9538aa97"),
      img("photo-1531403009284-440f080d1e12"),
      img("photo-1454165804606-c3d57bc86b40"),
    ],
    testimonials: [
      {
        quote:
          "Northlight rebuilt our identity and site in weeks. We finally look like the company we actually are — and inbound tripled.",
        name: "Élise Caron",
        role: "CEO · Atlas Mobility",
      },
      {
        quote:
          "The most senior, least precious team we've worked with. They shipped, iterated, and made us look world-class.",
        name: "Marcus Reede",
        role: "Founder · Verdant",
      },
      {
        quote:
          "Every detail considered. The new product UI lifted activation by 22% in the first month.",
        name: "Priya Nair",
        role: "VP Product · Loop",
      },
    ],
    stats: [
      { value: "120+", label: "Projects delivered" },
      { value: "14", label: "Years in practice" },
      { value: "9", label: "Design awards" },
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

const schema = generateSite(analysis, { mode: "smart" });

export default function PreviewPage() {
  return <SiteRenderer schema={schema} />;
}
