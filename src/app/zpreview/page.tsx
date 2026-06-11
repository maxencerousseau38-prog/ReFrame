import { SiteRenderer } from "@/components/blocks";
import type { SiteSchema } from "@/lib/generation/types";

const schema: SiteSchema = {
  id: "preview",
  sourceUrl: "https://example-hotel.com",
  industry: "restaurant",
  brand: { name: "Bellevoire", tagline: "A table you'll remember" },
  theme: { primary: "#211b17", accent: "#b08544", radius: "lg", font: "serif", mood: "warm" },
  blocks: [
    {
      id: "h",
      type: "hero",
      variant: "HeroEditorial",
      props: {
        eyebrow: "Restaurant & Hospitality",
        title: "An evening that lingers long after the last course",
        subtitle:
          "Seasonal cuisine, warm service and a room made for evenings that run long. Reserve your table by the window.",
        primaryCta: "Reserve a table",
        secondaryCta: "View the menu",
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
        brand: "Bellevoire",
        caption: "Seasonal menu",
      },
    },
  ],
};

export default function PreviewPage() {
  return <SiteRenderer schema={schema} />;
}
