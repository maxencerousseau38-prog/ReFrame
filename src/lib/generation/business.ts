/**
 * Business Intelligence — understands the client before the design begins.
 *
 * A BusinessProfile captures who the client is, what tier they operate at,
 * who their audience is, what emotions they want to evoke, and what their
 * conversion goals are. This profile directly feeds the Design DNA compiler.
 *
 * Two paths:
 * - Deterministic: heuristic rules from the extracted content (always works)
 * - Claude-augmented: richer profiling via LLM (when configured)
 *
 * Both degrade gracefully — the deterministic path is the floor, not a fallback.
 */

import type { SiteAnalysis, Industry, Theme } from "./types";
import { INDUSTRY_PROFILES } from "./industries";

/* -------------------------------------------------------------------------- */
/*  BusinessProfile type                                                      */
/* -------------------------------------------------------------------------- */

export interface BusinessProfile {
  industry: Industry;
  industryLabel: string;

  /** Perceived market tier. */
  tier: "budget" | "mid" | "premium" | "luxury";

  /** Target audience. */
  audience: {
    type: "b2b" | "b2c" | "mixed";
    demographic: string;
  };

  /** Brand personality traits (1–3 words each). */
  personality: string[];

  /** What emotional response the brand should trigger. */
  emotions: string[];

  /** Communication tone. */
  tone: "professional" | "friendly" | "authoritative" | "playful" | "luxurious";

  /** How modern the brand wants to appear. */
  modernityLevel: "traditional" | "established" | "modern" | "cutting-edge";

  /** Primary conversion goals, ordered by priority. */
  conversionGoals: string[];

  /** Key differentiators detected or inferred. */
  differentiators: string[];

  /** Trust signals required for this type of business. */
  trustSignals: string[];

  /** Brand strengths to amplify. */
  strengths: string[];

  /** Design weaknesses to fix. */
  weaknesses: string[];
}

/* -------------------------------------------------------------------------- */
/*  Tier detection heuristics                                                 */
/* -------------------------------------------------------------------------- */

const LUXURY_KEYWORDS = [
  "luxury", "exclusive", "bespoke", "prestige", "premium", "haute",
  "fine dining", "concierge", "vip", "luxe", "privé", "sur mesure",
  "award-winning", "michelin", "5-star", "five star",
];

const BUDGET_KEYWORDS = [
  "cheap", "affordable", "budget", "discount", "low cost", "free estimate",
  "pas cher", "économique", "gratuit", "promo", "solde",
];

/* -------------------------------------------------------------------------- */
/*  Business-derived STYLE (mood)                                             */
/* -------------------------------------------------------------------------- */

/**
 * Vocabulary that betrays a brand's actual art direction, EN + FR. The mood is
 * the root of the whole design system (colour, DNA rhythm, moodboard), so this
 * is what lets two same-sector brands read as different studios: a Michelin
 * "gastronomique" room resolves elegant, a "brut/industriel" studio resolves
 * bold, an "épuré/essentiel" practice resolves minimal — instead of every
 * restaurant being warm and every architect elegant by industry default.
 */
const STYLE_WORDS: Record<Theme["mood"], string[]> = {
  minimal: [
    "minimalist", "minimal", "understated", "essential", "pure", "clean lines",
    "épuré", "minimaliste", "sobre", "essentiel", "zen", "less is more",
  ],
  bold: [
    "bold", "brutalist", "industrial", "raw", "striking", "avant-garde",
    "statement", "edgy", "vibrant", "audacieux", "brut", "industriel",
    "graphique", "contemporain", "moderne", "punchy", "street",
  ],
  elegant: [
    "elegant", "refined", "timeless", "couture", "bespoke", "sophisticated",
    "gastronomic", "gastronomique", "étoilé", "michelin", "haute", "luxe",
    "raffiné", "élégant", "intemporel", "prestige", "fine dining", "d'exception",
  ],
  warm: [
    "family", "artisan", "artisanal", "homemade", "cozy", "welcoming",
    "convivial", "chaleureux", "familial", "fait maison", "authentique",
    "authentic", "traditionnel", "traditional", "heartfelt", "généreux", "local",
  ],
};

/**
 * Choose the STYLE (mood) from the business itself, not just its industry.
 * Content keywords are the primary signal; tier is a sector-safe nudge; the
 * industry baseline keeps home-field advantage so a single stray word never
 * flips a brand's whole identity. Deterministic — no seed, pure analysis.
 */
export function deriveMood(analysis: SiteAnalysis, industry: Industry): Theme["mood"] {
  const base = INDUSTRY_PROFILES[industry].theme.mood;
  const text = [
    analysis.extractedContent.headline,
    analysis.extractedContent.description,
    analysis.brandName,
    ...(analysis.extractedContent.services || []),
    analysis.extractedContent.aboutBody || "",
    ...(analysis.extractedContent.testimonials || []).map((t) => t.quote || ""),
  ]
    .join(" ")
    .toLowerCase();

  const scores: Record<Theme["mood"], number> = { minimal: 0, bold: 0, elegant: 0, warm: 0 };
  (Object.keys(scores) as Theme["mood"][]).forEach((m) => {
    scores[m] = STYLE_WORDS[m].filter((k) => text.includes(k)).length;
  });

  // Home-field weight: the shift must beat a real-signal threshold, not a fluke.
  scores[base] += 0.5;

  // Tier nudge, kept sector-coherent: a luxury craft/hospitality/fashion brand
  // reads elegant; a luxury tech brand reads more minimal (never "elegant");
  // a budget brand leans warm/approachable.
  const tier = detectTier(analysis);
  if (tier === "luxury") {
    if (base === "minimal") scores.minimal += 1.25;
    else scores.elegant += 1.5;
  } else if (tier === "budget") {
    scores.warm += 0.75;
  }

  let best: Theme["mood"] = base;
  let bestScore = -1;
  (Object.keys(scores) as Theme["mood"][]).forEach((m) => {
    if (scores[m] > bestScore) {
      bestScore = scores[m];
      best = m;
    }
  });
  return best;
}

function detectTier(analysis: SiteAnalysis): BusinessProfile["tier"] {
  const text = [
    analysis.extractedContent.headline,
    analysis.extractedContent.description,
    ...analysis.extractedContent.services,
    analysis.extractedContent.aboutBody || "",
  ].join(" ").toLowerCase();

  const luxuryHits = LUXURY_KEYWORDS.filter((kw) => text.includes(kw)).length;
  if (luxuryHits >= 2) return "luxury";
  if (luxuryHits === 1) return "premium";

  const budgetHits = BUDGET_KEYWORDS.filter((kw) => text.includes(kw)).length;
  if (budgetHits >= 2) return "budget";

  // Products with high prices suggest premium+
  const prices = (analysis.extractedContent.products || [])
    .map((p) => parseFloat((p.price || "").replace(/[^0-9.]/g, "")))
    .filter((n) => !isNaN(n));
  if (prices.length >= 3) {
    const median = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
    if (median > 500) return "luxury";
    if (median > 100) return "premium";
    if (median < 15) return "budget";
  }

  // Industries that default higher
  const premiumDefault: Industry[] = ["architect", "lawyer", "hotel", "fashion"];
  if (premiumDefault.includes(analysis.industry)) return "premium";

  const budgetDefault: Industry[] = ["plumber", "electrician"];
  if (budgetDefault.includes(analysis.industry)) return "mid";

  return "mid";
}

/* -------------------------------------------------------------------------- */
/*  Audience detection                                                        */
/* -------------------------------------------------------------------------- */

const B2B_SIGNALS = [
  "enterprise", "business", "b2b", "company", "corporate", "fleet",
  "api", "integration", "team", "workflow", "saas", "platform",
  "entreprise", "professionnel", "société",
];

const B2C_SIGNALS = [
  "family", "personal", "home", "individual", "residential",
  "famille", "particulier", "maison", "personnel",
];

function detectAudience(analysis: SiteAnalysis): BusinessProfile["audience"] {
  const text = [
    analysis.extractedContent.headline,
    analysis.extractedContent.description,
    ...analysis.extractedContent.services,
  ].join(" ").toLowerCase();

  const b2b = B2B_SIGNALS.filter((s) => text.includes(s)).length;
  const b2c = B2C_SIGNALS.filter((s) => text.includes(s)).length;

  const sectorDefaults: Partial<Record<Industry, "b2b" | "b2c" | "mixed">> = {
    saas: "b2b",
    agency: "b2b",
    finance: "mixed",
    restaurant: "b2c",
    ecommerce: "b2c",
    hotel: "b2c",
    gym: "b2c",
    fashion: "b2c",
    automotive: "b2c",
    health: "b2c",
    medical: "b2c",
    plumber: "b2c",
    electrician: "b2c",
    construction: "mixed",
    coach: "mixed",
    lawyer: "mixed",
    architect: "mixed",
    realestate: "mixed",
  };

  let type: "b2b" | "b2c" | "mixed" = sectorDefaults[analysis.industry] || "mixed";
  if (b2b > b2c + 1) type = "b2b";
  else if (b2c > b2b + 1) type = "b2c";

  const demographics: Record<Industry, string> = {
    restaurant: "diners and food enthusiasts",
    artisan: "homeowners needing repairs",
    realestate: "home buyers and sellers",
    saas: "teams and decision-makers",
    agency: "brands seeking creative partners",
    ecommerce: "online shoppers",
    health: "people seeking wellness",
    hotel: "travelers and guests",
    architect: "clients planning a build",
    lawyer: "individuals and businesses needing counsel",
    gym: "fitness-focused individuals",
    coach: "professionals seeking growth",
    plumber: "homeowners with plumbing issues",
    electrician: "property owners needing electrical work",
    construction: "property developers and homeowners",
    finance: "individuals and businesses managing money",
    fashion: "style-conscious shoppers",
    automotive: "vehicle owners",
    medical: "patients seeking care",
    generic: "potential customers",
  };

  return { type, demographic: demographics[analysis.industry] || "potential customers" };
}

/* -------------------------------------------------------------------------- */
/*  Tone & personality detection                                              */
/* -------------------------------------------------------------------------- */

const TONE_MAP: Record<Industry, BusinessProfile["tone"]> = {
  lawyer: "authoritative",
  medical: "professional",
  finance: "professional",
  architect: "luxurious",
  hotel: "luxurious",
  fashion: "luxurious",
  restaurant: "friendly",
  gym: "playful",
  coach: "friendly",
  saas: "professional",
  agency: "professional",
  ecommerce: "friendly",
  health: "friendly",
  plumber: "friendly",
  electrician: "friendly",
  construction: "authoritative",
  realestate: "professional",
  automotive: "authoritative",
  artisan: "friendly",
  generic: "professional",
};

function detectTone(
  industry: Industry,
  tier: BusinessProfile["tier"]
): BusinessProfile["tone"] {
  if (tier === "luxury") return "luxurious";
  return TONE_MAP[industry] || "professional";
}

function detectPersonality(
  industry: Industry,
  tier: BusinessProfile["tier"],
  mood: Theme["mood"]
): string[] {
  const traits: string[] = [];

  // Tier-driven
  if (tier === "luxury") traits.push("refined");
  else if (tier === "premium") traits.push("polished");
  else if (tier === "mid") traits.push("reliable");
  else traits.push("straightforward");

  // Mood-driven
  if (mood === "bold") traits.push("confident");
  else if (mood === "warm") traits.push("approachable");
  else if (mood === "elegant") traits.push("sophisticated");
  else traits.push("clean");

  // Industry accent
  const industryTraits: Partial<Record<Industry, string>> = {
    saas: "innovative",
    agency: "creative",
    lawyer: "trustworthy",
    medical: "caring",
    gym: "energetic",
    coach: "empowering",
    restaurant: "inviting",
    hotel: "welcoming",
    architect: "visionary",
    fashion: "tasteful",
    automotive: "powerful",
    construction: "solid",
  };
  if (industryTraits[industry]) traits.push(industryTraits[industry]!);

  return traits.slice(0, 3);
}

function detectEmotions(
  industry: Industry,
  tier: BusinessProfile["tier"]
): string[] {
  const base: Partial<Record<Industry, string[]>> = {
    restaurant: ["appetite", "warmth", "conviviality"],
    hotel: ["escape", "comfort", "indulgence"],
    architect: ["aspiration", "wonder", "trust"],
    lawyer: ["reassurance", "confidence", "clarity"],
    medical: ["safety", "trust", "calm"],
    gym: ["motivation", "energy", "achievement"],
    coach: ["inspiration", "clarity", "momentum"],
    saas: ["efficiency", "control", "relief"],
    agency: ["excitement", "trust", "ambition"],
    ecommerce: ["desire", "satisfaction", "trust"],
    fashion: ["desire", "identity", "exclusivity"],
    health: ["serenity", "trust", "wellbeing"],
    plumber: ["relief", "trust", "urgency"],
    electrician: ["safety", "trust", "reliability"],
    construction: ["confidence", "vision", "solidity"],
    finance: ["security", "clarity", "control"],
    realestate: ["aspiration", "excitement", "trust"],
    automotive: ["thrill", "confidence", "pride"],
  };

  const emotions = base[industry] || ["trust", "interest", "confidence"];
  if (tier === "luxury") return ["exclusivity", ...emotions.slice(0, 2)];
  return emotions;
}

/* -------------------------------------------------------------------------- */
/*  Modernity detection                                                       */
/* -------------------------------------------------------------------------- */

function detectModernity(analysis: SiteAnalysis): BusinessProfile["modernityLevel"] {
  const designScore = analysis.scores.design;
  const perfScore = analysis.scores.performance;

  // Use the source site's quality as a rough proxy for how modern the brand is
  if (designScore >= 60 && perfScore >= 70) return "cutting-edge";
  if (designScore >= 45) return "modern";
  if (designScore >= 30) return "established";
  return "traditional";
}

/* -------------------------------------------------------------------------- */
/*  Conversion goals                                                          */
/* -------------------------------------------------------------------------- */

function detectConversionGoals(analysis: SiteAnalysis): string[] {
  const goals: string[] = [];
  const content = analysis.extractedContent;

  // Explicit signals from the content
  if (content.contact?.bookingUrl) goals.push("book appointment");
  if (content.contact?.phone) goals.push("phone call");
  if (content.contact?.email) goals.push("email inquiry");
  if (content.products && content.products.length > 0) goals.push("purchase product");
  if (content.collection) goals.push("browse menu");

  // Integration signals
  const integrations = analysis.integrations || [];
  if (integrations.some((i) => i.category === "scheduling")) goals.push("book appointment");
  if (integrations.some((i) => i.category === "payments")) goals.push("purchase product");
  if (integrations.some((i) => i.category === "chat")) goals.push("start conversation");

  // Industry defaults
  const industryGoals: Partial<Record<Industry, string[]>> = {
    restaurant: ["book a table", "browse menu"],
    saas: ["start free trial", "request demo"],
    agency: ["start a project", "view portfolio"],
    realestate: ["book a viewing", "browse listings"],
    lawyer: ["book consultation", "call now"],
    medical: ["book appointment", "call now"],
    gym: ["start free trial", "view classes"],
    coach: ["book discovery call"],
    plumber: ["get free quote", "call now"],
    electrician: ["get free quote", "call now"],
    construction: ["request quote", "view projects"],
    hotel: ["book your stay", "check availability"],
    ecommerce: ["shop now", "browse collection"],
    fashion: ["shop the collection", "view lookbook"],
    automotive: ["book a service", "view inventory"],
    health: ["book appointment"],
    finance: ["book consultation"],
    architect: ["discuss your project"],
  };

  const defaults = industryGoals[analysis.industry] || ["get in touch"];
  for (const g of defaults) {
    if (!goals.includes(g)) goals.push(g);
  }

  return goals.slice(0, 3);
}

/* -------------------------------------------------------------------------- */
/*  Strengths & weaknesses detection                                          */
/* -------------------------------------------------------------------------- */

function detectStrengths(analysis: SiteAnalysis): string[] {
  const s: string[] = [];
  const c = analysis.extractedContent;

  if (c.testimonials && c.testimonials.length >= 2) s.push("real testimonials");
  if (c.stats && c.stats.length >= 1) s.push("proven metrics");
  if (c.images.length >= 4) s.push("strong imagery");
  if (c.team && c.team.length >= 2) s.push("visible team");
  if (c.products && c.products.length >= 5) s.push("rich product catalog");
  if (c.faqItems && c.faqItems.length >= 3) s.push("comprehensive FAQ");
  if (c.aboutBody) s.push("clear brand story");
  if (c.serviceItems && c.serviceItems.length >= 3) s.push("well-defined services");
  if (analysis.brand?.logoUrl) s.push("established logo");
  if (analysis.scores.seo >= 70) s.push("good SEO foundation");

  return s;
}

function detectWeaknesses(analysis: SiteAnalysis): string[] {
  const w: string[] = [];
  const c = analysis.extractedContent;

  if (analysis.scores.design < 40) w.push("weak visual design");
  if (analysis.scores.mobile < 50) w.push("poor mobile experience");
  if (analysis.scores.accessibility < 50) w.push("accessibility gaps");
  if (analysis.scores.performance < 50) w.push("slow performance");
  if (!c.testimonials || c.testimonials.length === 0) w.push("no social proof");
  if (c.images.length < 2) w.push("insufficient imagery");
  if (!c.contact?.phone && !c.contact?.email) w.push("missing contact details");
  if (!analysis.brand?.logoUrl) w.push("no visible logo");
  if (analysis.scores.seo < 40) w.push("weak SEO");
  if (!c.aboutBody) w.push("no brand story");

  return w;
}

/* -------------------------------------------------------------------------- */
/*  Differentiator detection                                                  */
/* -------------------------------------------------------------------------- */

function detectDifferentiators(analysis: SiteAnalysis): string[] {
  const d: string[] = [];
  const c = analysis.extractedContent;

  if (c.stats && c.stats.length) {
    for (const stat of c.stats) {
      d.push(`${stat.value} ${stat.label}`);
    }
  }

  // Unique services (more than 4 = specialized)
  if (c.serviceItems && c.serviceItems.length >= 4) {
    d.push("broad service range");
  }

  // Awards / certifications keywords
  const text = [c.headline, c.description, c.aboutBody || ""].join(" ").toLowerCase();
  if (/award|certified|accredited|accrédité|certifié/.test(text)) {
    d.push("certified or awarded");
  }
  if (/year|ans|since|depuis/.test(text) && /\d{4}/.test(text)) {
    d.push("established track record");
  }

  return d.slice(0, 4);
}

/* -------------------------------------------------------------------------- */
/*  Main entry: build a BusinessProfile from a SiteAnalysis                   */
/* -------------------------------------------------------------------------- */

/**
 * Analyze a SiteAnalysis into a rich BusinessProfile.
 * Fully deterministic — same analysis always produces the same profile.
 */
export function analyzeBusinessProfile(
  analysis: SiteAnalysis,
  mood: Theme["mood"] = "minimal"
): BusinessProfile {
  const tier = detectTier(analysis);
  const profile = INDUSTRY_PROFILES[analysis.industry];

  return {
    industry: analysis.industry,
    industryLabel: profile.label,
    tier,
    audience: detectAudience(analysis),
    personality: detectPersonality(analysis.industry, tier, mood),
    emotions: detectEmotions(analysis.industry, tier),
    tone: detectTone(analysis.industry, tier),
    modernityLevel: detectModernity(analysis),
    conversionGoals: detectConversionGoals(analysis),
    differentiators: detectDifferentiators(analysis),
    trustSignals: detectTrustSignals(analysis.industry, tier),
    strengths: detectStrengths(analysis),
    weaknesses: detectWeaknesses(analysis),
  };
}

/* -------------------------------------------------------------------------- */
/*  Trust signal selection                                                    */
/* -------------------------------------------------------------------------- */

function detectTrustSignals(industry: Industry, tier: BusinessProfile["tier"]): string[] {
  const base: Partial<Record<Industry, string[]>> = {
    lawyer: ["credentials", "case studies", "client count"],
    medical: ["credentials", "patient reviews", "certifications"],
    plumber: ["license", "insurance", "guarantees"],
    electrician: ["certification", "insurance", "safety record"],
    construction: ["portfolio", "timeline track record", "insurance"],
    finance: ["credentials", "regulatory compliance", "client count"],
    saas: ["user count", "uptime", "security certifications"],
    agency: ["portfolio", "client logos", "case studies"],
    ecommerce: ["reviews", "shipping policy", "return policy"],
    restaurant: ["reviews", "awards", "press mentions"],
    hotel: ["star rating", "guest reviews", "awards"],
    architect: ["portfolio", "awards", "publications"],
    coach: ["certifications", "client results", "testimonials"],
    gym: ["equipment quality", "trainer credentials", "member results"],
    health: ["practitioner credentials", "patient reviews", "specializations"],
  };

  const signals = base[industry] || ["reviews", "experience", "guarantees"];
  if (tier === "luxury") return ["exclusivity", ...signals.slice(0, 2)];
  return signals;
}
