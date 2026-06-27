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
    keywords: ["roofing", "repair", "installation", "quote", "contractor", "handyman", "renovation", "artisan", "travaux"],
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
    keywords: ["health", "wellness", "therapy", "well-being", "spa", "yoga", "massage", "holistic", "naturopath", "osteopath"],
    theme: { primary: "#0c4a6e", accent: "#0891b2", radius: "lg", font: "inter", mood: "elegant" },
    defaults: {
      headline: "Care that puts you first",
      description: "Compassionate, expert care with easy booking and a calm, modern practice.",
      services: ["Easy booking", "Expert practitioners", "Personalized care", "Insurance accepted"],
    },
    preferred: { hero: "HeroPremium2", features: "FeaturesGrid1" },
    cta: { primary: "Book an appointment" },
  },
  hotel: {
    id: "hotel",
    label: "Hotel & Hospitality",
    keywords: ["hotel", "rooms", "suites", "check-in", "booking", "resort", "accommodation", "hostel", "lodge", "guesthouse"],
    theme: { primary: "#1c1917", accent: "#b45309", radius: "lg", font: "serif", mood: "elegant" },
    defaults: {
      headline: "A stay you will remember",
      description: "Refined rooms, impeccable service and a location that makes every trip effortless.",
      services: ["Premium rooms & suites", "Concierge service", "Spa & wellness", "Fine dining"],
    },
    preferred: { hero: "HeroImageFull", features: "FeaturesGrid1" },
    cta: { primary: "Book your stay" },
  },
  architect: {
    id: "architect",
    label: "Architecture & Design",
    keywords: ["architect", "architecture", "interior design", "blueprints", "floor plan", "building design", "urban", "landscape", "renovation", "spatial"],
    theme: { primary: "#18181b", accent: "#78716c", radius: "lg", font: "serif", mood: "elegant" },
    defaults: {
      headline: "Spaces that shape how you live",
      description: "Award-winning architecture and interior design, from concept to completion.",
      services: ["Residential design", "Commercial architecture", "Interior design", "Project management"],
    },
    preferred: { hero: "HeroMonumental", features: "FeaturesGrid1" },
    cta: { primary: "Discuss your project" },
  },
  lawyer: {
    id: "lawyer",
    label: "Legal & Law",
    keywords: ["lawyer", "attorney", "law firm", "legal", "avocat", "cabinet", "litigation", "counsel", "barrister", "solicitor"],
    theme: { primary: "#1e293b", accent: "#1d4ed8", radius: "md", font: "serif", mood: "elegant" },
    defaults: {
      headline: "Clear counsel, real results",
      description: "Experienced legal representation with a personal approach and a track record that speaks for itself.",
      services: ["Business law", "Real estate law", "Family law", "Litigation"],
    },
    preferred: { hero: "HeroPremium2", features: "FeaturesGrid1" },
    cta: { primary: "Book a consultation" },
  },
  gym: {
    id: "gym",
    label: "Fitness & Sports",
    keywords: ["gym", "fitness", "workout", "crossfit", "muscle", "training", "salle de sport", "musculation", "cardio", "weightlifting"],
    theme: { primary: "#0a0a0a", accent: "#dc2626", radius: "md", font: "inter", mood: "bold" },
    defaults: {
      headline: "Your strongest chapter starts here",
      description: "State-of-the-art equipment, expert coaches and a community that pushes you further.",
      services: ["Personal training", "Group classes", "Cardio & weights", "Nutrition coaching"],
    },
    preferred: { hero: "HeroPremium1", features: "FeaturesGrid1" },
    cta: { primary: "Start your free trial" },
  },
  coach: {
    id: "coach",
    label: "Coaching & Consulting",
    keywords: ["coach", "coaching", "mentoring", "mindset", "life coach", "business coach", "consulting", "mentor", "personal development", "leadership"],
    theme: { primary: "#1a1a2e", accent: "#7c3aed", radius: "lg", font: "inter", mood: "minimal" },
    defaults: {
      headline: "Unlock your next level",
      description: "Proven coaching frameworks that turn ambition into measurable progress.",
      services: ["1-on-1 coaching", "Group programs", "Strategy sessions", "Accountability support"],
    },
    preferred: { hero: "HeroPremium1", features: "FeaturesGrid1" },
    cta: { primary: "Book a discovery call" },
  },
  plumber: {
    id: "plumber",
    label: "Plumbing",
    keywords: ["plumber", "plumbing", "leak", "pipe", "drain", "water heater", "fuite", "tuyau", "plombier", "chauffe-eau"],
    theme: { primary: "#0f172a", accent: "#2563eb", radius: "md", font: "inter", mood: "bold" },
    defaults: {
      headline: "Fast, reliable plumbing you can trust",
      description: "Licensed plumbers with transparent pricing, on-time arrival and guaranteed work.",
      services: ["Emergency repairs", "Leak detection", "Water heater installation", "Drain cleaning"],
    },
    preferred: { hero: "HeroPremium1", features: "FeaturesGrid1" },
    cta: { primary: "Call now" },
  },
  electrician: {
    id: "electrician",
    label: "Electrical Services",
    keywords: ["electrician", "electrical", "wiring", "circuit", "panel", "outlet", "électricien", "électricité", "câblage", "tableau"],
    theme: { primary: "#0f172a", accent: "#eab308", radius: "md", font: "inter", mood: "bold" },
    defaults: {
      headline: "Safe, certified electrical work",
      description: "Licensed electricians for residential and commercial projects, with code compliance guaranteed.",
      services: ["Rewiring & upgrades", "Panel installation", "Lighting design", "Safety inspections"],
    },
    preferred: { hero: "HeroPremium1", features: "FeaturesGrid1" },
    cta: { primary: "Get a free quote" },
  },
  construction: {
    id: "construction",
    label: "Construction & Building",
    keywords: ["construction", "builder", "building", "contractor", "rénovation", "extension", "maçonnerie", "bâtiment", "chantier", "BTP"],
    theme: { primary: "#1c1917", accent: "#d97706", radius: "md", font: "inter", mood: "bold" },
    defaults: {
      headline: "Built to last, delivered on time",
      description: "Full-service construction from foundations to finishing, with transparent timelines and budgets.",
      services: ["New builds", "Renovations", "Extensions", "Project management"],
    },
    preferred: { hero: "HeroMonumental", features: "FeaturesGrid1" },
    cta: { primary: "Request a quote" },
  },
  finance: {
    id: "finance",
    label: "Finance & Consulting",
    keywords: ["finance", "accounting", "tax", "investment", "wealth", "financial advisor", "comptable", "fiscalité", "gestion", "patrimoine"],
    theme: { primary: "#1e293b", accent: "#0d9488", radius: "md", font: "inter", mood: "elegant" },
    defaults: {
      headline: "Your finances, expertly managed",
      description: "Clear financial advice, transparent fees and a strategy built around your goals.",
      services: ["Tax planning", "Wealth management", "Business accounting", "Financial consulting"],
    },
    preferred: { hero: "HeroPremium2", features: "FeaturesGrid1" },
    cta: { primary: "Book a consultation" },
  },
  fashion: {
    id: "fashion",
    label: "Fashion & Beauty",
    keywords: ["fashion", "clothing", "beauty", "salon", "hair", "makeup", "cosmetics", "coiffure", "esthétique", "mode"],
    theme: { primary: "#18181b", accent: "#be185d", radius: "lg", font: "serif", mood: "elegant" },
    defaults: {
      headline: "Style that speaks for you",
      description: "Curated fashion and beauty, crafted with attention to detail and a sense of occasion.",
      services: ["Collections", "Personal styling", "Custom orders", "Beauty treatments"],
    },
    preferred: { hero: "HeroEditorial", features: "FeaturesGrid1" },
    cta: { primary: "Shop the collection" },
  },
  automotive: {
    id: "automotive",
    label: "Automotive",
    keywords: ["car", "auto", "vehicle", "garage", "mechanic", "dealer", "voiture", "automobile", "concessionnaire", "mécanique"],
    theme: { primary: "#0a0a0a", accent: "#dc2626", radius: "md", font: "inter", mood: "bold" },
    defaults: {
      headline: "Performance you can feel",
      description: "Expert automotive services with transparent pricing and genuine care for your vehicle.",
      services: ["Servicing & repairs", "Diagnostics", "MOT & inspections", "Parts & accessories"],
    },
    preferred: { hero: "HeroImageFull", features: "FeaturesGrid1" },
    cta: { primary: "Book a service" },
  },
  medical: {
    id: "medical",
    label: "Medical & Clinical",
    keywords: ["clinic", "doctor", "dentist", "medical", "patient", "appointment", "cabinet", "médecin", "chirurgien", "consultation"],
    theme: { primary: "#f0fdfa", accent: "#0891b2", radius: "lg", font: "inter", mood: "minimal" },
    defaults: {
      headline: "Expert care, close to home",
      description: "A modern practice with experienced professionals, easy booking and compassionate, patient-first care.",
      services: ["General consultations", "Specialist referrals", "Preventive care", "Telehealth"],
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
