import type { Industry, Theme } from "./types";

interface IndustryProfile {
  id: Industry;
  label: string;
  keywords: string[];
  /** Default theme tuned to the sector. */
  theme: Theme;
  /** Sector-appropriate default copy used when extraction is thin. */
  defaults: {
    headline: string;
    description: string;
    services: string[];
  };
  /** Preferred block variants for this sector. */
  preferred: {
    hero: string;
    features: string;
  };
  /** Primary call-to-action label, tuned to the sector. */
  cta: { primary: string };
}

export const INDUSTRY_PROFILES: Record<Industry, IndustryProfile> = {
  restaurant: {
    id: "restaurant",
    label: "Restaurant & Hospitality",
    keywords: ["menu", "restaurant", "cuisine", "reservation", "chef", "food", "dish", "table", "bistro", "cafe"],
    theme: { primary: "#1a1a1a", accent: "#c2703d", radius: "lg", font: "serif", mood: "warm" },
    defaults: {
      headline: "A table you'll remember",
      description: "Seasonal cuisine, warm service and a room made for evenings that run long.",
      services: ["Seasonal menu", "Private dining", "Wine pairing", "Online reservations"],
    },
    preferred: { hero: "HeroPremium2", features: "FeaturesGrid1" },
    cta: { primary: "Book a table" },
  },
  artisan: {
    id: "artisan",
    label: "Trades & Local Services",
    keywords: ["plumber", "electrician", "builder", "roofing", "plumbing", "repair", "installation", "emergency", "quote", "contractor"],
    theme: { primary: "#0f172a", accent: "#2563eb", radius: "md", font: "inter", mood: "bold" },
    defaults: {
      headline: "Done right, the first time",
      description: "Licensed local experts with transparent pricing, on-time arrival and guaranteed work.",
      services: ["Free quotes", "24/7 emergencies", "Licensed & insured", "Workmanship guarantee"],
    },
    preferred: { hero: "HeroPremium1", features: "FeaturesGrid1" },
    cta: { primary: "Get a free quote" },
  },
  realestate: {
    id: "realestate",
    label: "Real Estate",
    keywords: ["property", "real estate", "listing", "home", "apartment", "buy", "sell", "rent", "realtor", "mortgage"],
    theme: { primary: "#1c1917", accent: "#0d9488", radius: "lg", font: "inter", mood: "elegant" },
    defaults: {
      headline: "Find the place you've been picturing",
      description: "Curated listings, local expertise and a team that makes buying or selling effortless.",
      services: ["Curated listings", "Market valuation", "Buyer matching", "End-to-end support"],
    },
    preferred: { hero: "HeroPremium2", features: "FeaturesGrid1" },
    cta: { primary: "Book a viewing" },
  },
  saas: {
    id: "saas",
    label: "Software & SaaS",
    keywords: ["software", "platform", "app", "saas", "dashboard", "api", "integration", "workflow", "automation", "cloud"],
    // Electric blue, not the AI-default indigo/purple ("the Lila Rule").
    theme: { primary: "#0a0a0a", accent: "#0284c7", radius: "lg", font: "inter", mood: "minimal" },
    defaults: {
      headline: "The platform your team will actually use",
      description: "Powerful, fast and beautifully simple, built to remove busywork from your day.",
      services: ["Automation", "Integrations", "Analytics", "Team collaboration"],
    },
    preferred: { hero: "HeroPremium1", features: "FeaturesGrid1" },
    cta: { primary: "Start free" },
  },
  agency: {
    id: "agency",
    label: "Agency & Studio",
    keywords: ["agency", "studio", "design", "branding", "marketing", "creative", "portfolio", "clients", "campaign"],
    theme: { primary: "#171717", accent: "#db2777", radius: "lg", font: "inter", mood: "bold" },
    defaults: {
      headline: "Brands people remember",
      description: "A creative studio crafting identity, websites and campaigns that move the needle.",
      services: ["Brand identity", "Web design", "Campaigns", "Content"],
    },
    preferred: { hero: "HeroPremium2", features: "FeaturesGrid1" },
    cta: { primary: "Start a project" },
  },
  ecommerce: {
    id: "ecommerce",
    label: "E-commerce & Retail",
    keywords: ["shop", "store", "product", "cart", "buy now", "collection", "shipping", "checkout", "sale", "ecommerce"],
    theme: { primary: "#18181b", accent: "#16a34a", radius: "md", font: "inter", mood: "minimal" },
    defaults: {
      headline: "Pieces made to be lived in",
      description: "Considered products, fast shipping and a shopping experience as good as what's in the box.",
      services: ["Free shipping", "Easy returns", "Secure checkout", "New drops weekly"],
    },
    preferred: { hero: "HeroPremium1", features: "FeaturesGrid1" },
    cta: { primary: "Shop now" },
  },
  health: {
    id: "health",
    label: "Health & Wellness",
    keywords: ["clinic", "doctor", "dentist", "health", "wellness", "therapy", "appointment", "patient", "care", "medical", "spa"],
    theme: { primary: "#0c4a6e", accent: "#0891b2", radius: "lg", font: "inter", mood: "elegant" },
    defaults: {
      headline: "Care that puts you first",
      description: "Compassionate, expert care with easy booking and a calm, modern practice.",
      services: ["Easy booking", "Expert practitioners", "Personalized care", "Insurance accepted"],
    },
    preferred: { hero: "HeroPremium2", features: "FeaturesGrid1" },
    cta: { primary: "Book an appointment" },
  },
  generic: {
    id: "generic",
    label: "Business",
    keywords: [],
    // Emerald: a neutral-friendly, high-contrast accent (not AI-default purple).
    theme: { primary: "#0a0a0a", accent: "#059669", radius: "lg", font: "inter", mood: "minimal" },
    defaults: {
      headline: "Something better, built for you",
      description: "A modern home for your business. Clear, fast and made to convert.",
      services: ["Quality first", "Trusted by clients", "Fast turnaround", "Personal service"],
    },
    preferred: { hero: "HeroPremium1", features: "FeaturesGrid1" },
    cta: { primary: "Get in touch" },
  },
};

/**
 * Score the raw text of a site against each industry's keywords and return the
 * best match. Deterministic — no randomness, so the same site always maps to
 * the same sector.
 */
export function detectIndustry(text: string): Industry {
  const haystack = text.toLowerCase();
  let best: Industry = "generic";
  let bestScore = 0;

  for (const profile of Object.values(INDUSTRY_PROFILES)) {
    if (profile.id === "generic") continue;
    let score = 0;
    for (const kw of profile.keywords) {
      if (haystack.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = profile.id;
    }
  }

  return best;
}
