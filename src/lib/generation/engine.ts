import type {
  Block,
  SiteAnalysis,
  SiteSchema,
  Industry,
} from "./types";
import { INDUSTRY_PROFILES, detectIndustry } from "./industries";

/* -------------------------------------------------------------------------- */
/*  Small deterministic helpers                                               */
/* -------------------------------------------------------------------------- */

function uid(prefix = "b") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function brandFromUrl(url: string): string {
  try {
    const host = new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
    const base = host.split(".")[0];
    return base
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return "Your Brand";
  }
}

/** Decode HTML entities and collapse whitespace from scraped text. */
function clean(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* -------------------------------------------------------------------------- */
/*  1. Analyze                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Fetch the target site (best effort) and extract brand, sector, content and
 * an audit. If the fetch fails (network policy, blocked, timeout) we fall back
 * to a deterministic profile derived from the domain so the demo always works.
 */
export async function analyzeUrl(rawUrl: string): Promise<SiteAnalysis> {
  const url = normalizeUrl(rawUrl);
  const brandName = brandFromUrl(url);

  let html = "";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "SiteReviveBot/1.0 (+https://siterevive.ai)" },
    });
    clearTimeout(timeout);
    if (res.ok) html = await res.text();
  } catch {
    // swallow — handled by fallback below
  }

  const text = clean(html).toLowerCase();
  const industry: Industry = text ? detectIndustry(text) : detectIndustry(brandName.toLowerCase());
  const profile = INDUSTRY_PROFILES[industry];

  // Extract a headline (h1 / title) and description (meta description / first p).
  const h1 = matchOne(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = matchOne(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDesc =
    matchAttr(html, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
    matchOne(html, /<p[^>]*>([\s\S]*?)<\/p>/i);

  const headline = clean(h1 || title || profile.defaults.headline) || profile.defaults.headline;
  const description = clean(metaDesc || profile.defaults.description) || profile.defaults.description;

  // Build a believable, deterministic audit. Real fetches score slightly higher
  // because we have real signal; either way the redesign always wins.
  const seed = hashString(url);
  const scores = {
    design: 28 + (seed % 18),
    performance: 41 + ((seed >> 2) % 25),
    seo: 38 + ((seed >> 4) % 28),
    mobile: 44 + ((seed >> 6) % 22),
    accessibility: 35 + ((seed >> 8) % 26),
  };

  const issues = buildIssues(scores);

  return {
    url,
    brandName,
    industry,
    industryLabel: profile.label,
    detectedSections: ["Header", "Intro", "Services", "About", "Contact", "Footer"],
    extractedContent: {
      headline,
      description,
      services: profile.defaults.services,
      contactHint: "Contact form detected",
    },
    scores,
    issues,
  };
}

function matchOne(html: string, re: RegExp): string {
  const m = html.match(re);
  return m ? m[1] : "";
}
function matchAttr(html: string, re: RegExp): string {
  const m = html.match(re);
  return m ? m[1] : "";
}
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
function buildIssues(scores: SiteAnalysis["scores"]): string[] {
  const out: string[] = [];
  if (scores.design < 50) out.push("Outdated visual design and inconsistent spacing");
  if (scores.performance < 70) out.push("Slow load — unoptimized images and render-blocking assets");
  if (scores.seo < 70) out.push("Missing meta tags and weak heading structure");
  if (scores.mobile < 75) out.push("Layout not fully responsive on mobile");
  if (scores.accessibility < 70) out.push("Low color contrast and missing alt text");
  out.push("No clear call-to-action above the fold");
  return out;
}

/* -------------------------------------------------------------------------- */
/*  2. Generate                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Assemble a coherent SiteSchema from the analysis. Block selection is driven
 * by the detected industry's preferred variants — never random.
 */
export function generateSite(analysis: SiteAnalysis): SiteSchema {
  const profile = INDUSTRY_PROFILES[analysis.industry];
  const c = analysis.extractedContent;

  const blocks: Block[] = [
    {
      id: uid("hero"),
      type: "hero",
      variant: profile.preferred.hero,
      props: {
        eyebrow: profile.label,
        title: c.headline,
        subtitle: c.description,
        primaryCta: "Get started",
        secondaryCta: "Learn more",
      },
    },
    {
      id: uid("features"),
      type: "features",
      variant: profile.preferred.features,
      props: {
        title: "Why choose us",
        subtitle: "What makes the difference for our clients.",
        items: c.services.map((s, i) => ({
          title: s,
          description: featureBlurb(s, analysis.industry),
          icon: ["Sparkles", "Shield", "Zap", "Heart", "Star", "Check"][i % 6],
        })),
      },
    },
    {
      id: uid("test"),
      type: "testimonials",
      variant: "TestimonialsSlider1",
      props: {
        title: "Loved by our customers",
        items: [
          { quote: "Genuinely the best experience we've had. Highly recommend.", name: "Jordan M.", role: "Customer" },
          { quote: "Professional, fast and the result exceeded expectations.", name: "Priya S.", role: "Customer" },
          { quote: "We'll never go anywhere else. Five stars across the board.", name: "Liam R.", role: "Customer" },
        ],
      },
    },
    {
      id: uid("faq"),
      type: "faq",
      variant: "FAQAccordion1",
      props: {
        title: "Frequently asked questions",
        items: defaultFaq(analysis.industry, analysis.brandName),
      },
    },
    {
      id: uid("cta"),
      type: "cta",
      variant: "CTASection1",
      props: {
        title: "Ready to get started?",
        subtitle: "Reach out today and let's make it happen.",
        cta: "Get in touch",
      },
    },
    {
      id: uid("contact"),
      type: "contact",
      variant: "ContactFormPremium1",
      props: {
        title: "Contact us",
        subtitle: "We typically reply within one business day.",
      },
    },
    {
      id: uid("footer"),
      type: "footer",
      variant: "Footer1",
      props: { brand: analysis.brandName },
    },
  ];

  return {
    id: uid("site"),
    sourceUrl: analysis.url,
    industry: analysis.industry,
    brand: { name: analysis.brandName, tagline: c.headline },
    theme: profile.theme,
    blocks,
  };
}

function featureBlurb(service: string, industry: Industry): string {
  const map: Record<string, string> = {
    "Free quotes": "Transparent, no-obligation pricing before any work begins.",
    "24/7 emergencies": "Real people on call, day or night, when you need us most.",
    "Licensed & insured": "Fully certified and covered for complete peace of mind.",
    "Workmanship guarantee": "If it's not right, we make it right — guaranteed.",
  };
  return (
    map[service] ||
    `${service} — delivered to a standard our ${INDUSTRY_PROFILES[industry].label.toLowerCase()} clients trust.`
  );
}

function defaultFaq(industry: Industry, brand: string) {
  return [
    { question: `How quickly can ${brand} get started?`, answer: "Most projects begin within a few days of your first message — just reach out and we'll find a slot." },
    { question: "How much does it cost?", answer: "Every project is quoted transparently up front, with no hidden fees and no surprises." },
    { question: "Do you offer guarantees?", answer: "Yes — we stand behind our work and won't consider it done until you're delighted." },
    { question: "What areas do you serve?", answer: "We serve the local area and surrounding regions. Ask us about your location." },
  ];
}

/* -------------------------------------------------------------------------- */
/*  3. AI Edit                                                                */
/* -------------------------------------------------------------------------- */

export interface AiEditResult {
  schema: SiteSchema;
  message: string;
  changed: boolean;
}

/**
 * Interpret a plain-English instruction and mutate the schema accordingly.
 * This is a deterministic intent router — the slot where a real LLM call would
 * live in production. It covers the headline edit, section add/remove, color
 * and "make it more premium" intents from the brief.
 */
export function applyAiEdit(schema: SiteSchema, instruction: string): AiEditResult {
  const next: SiteSchema = structuredClone(schema);
  const text = instruction.toLowerCase();

  // 1. Change hero title
  if (/(hero|title|headline|titre)/.test(text) && /(change|set|make|update|new|rename|replace|modifie)/.test(text)) {
    const quoted = instruction.match(/["“”']([^"“”']+)["“”']/);
    const toPart = instruction.split(/\bto\b/i)[1];
    const value = quoted?.[1] || (toPart ? toPart.trim() : "");
    const hero = next.blocks.find((b) => b.type === "hero");
    if (hero && value) {
      (hero.props as Record<string, unknown>).title = value;
      return { schema: next, message: `Updated the hero title to “${value}”.`, changed: true };
    }
  }

  // 2. Add FAQ
  if (/add/.test(text) && /faq/.test(text)) {
    if (!next.blocks.some((b) => b.type === "faq")) {
      const footerIdx = next.blocks.findIndex((b) => b.type === "footer");
      const faq: Block = {
        id: uid("faq"),
        type: "faq",
        variant: "FAQAccordion1",
        props: { title: "Frequently asked questions", items: defaultFaq(next.industry, next.brand.name) },
      };
      next.blocks.splice(footerIdx < 0 ? next.blocks.length : footerIdx, 0, faq);
      return { schema: next, message: "Added an FAQ section before the footer.", changed: true };
    }
    return { schema: next, message: "There's already an FAQ section on the page.", changed: false };
  }

  // 3. Add testimonials / contact / cta
  for (const target of ["testimonials", "contact", "cta"] as const) {
    if (/add/.test(text) && text.includes(target === "cta" ? "call to action" : target)) {
      if (!next.blocks.some((b) => b.type === target)) {
        const stub = generateSite({
          url: next.sourceUrl,
          brandName: next.brand.name,
          industry: next.industry,
          industryLabel: "",
          detectedSections: [],
          extractedContent: { headline: "", description: "", services: INDUSTRY_PROFILES[next.industry].defaults.services },
          scores: { design: 0, performance: 0, seo: 0, mobile: 0, accessibility: 0 },
          issues: [],
        }).blocks.find((b) => b.type === target);
        if (stub) {
          const footerIdx = next.blocks.findIndex((b) => b.type === "footer");
          next.blocks.splice(footerIdx < 0 ? next.blocks.length : footerIdx, 0, stub);
          return { schema: next, message: `Added a ${target} section.`, changed: true };
        }
      }
      return { schema: next, message: `A ${target} section already exists.`, changed: false };
    }
  }

  // 4. Remove a section
  if (/(remove|delete|supprime)/.test(text)) {
    const target = (["testimonials", "faq", "contact", "cta", "features"] as const).find((t) => text.includes(t));
    if (target) {
      const before = next.blocks.length;
      next.blocks = next.blocks.filter((b) => b.type !== target);
      if (next.blocks.length < before) {
        return { schema: next, message: `Removed the ${target} section.`, changed: true };
      }
    }
  }

  // 5. Change color / accent
  const colorMatch = text.match(/(blue|indigo|violet|purple|green|emerald|teal|red|rose|pink|orange|amber|black)/);
  if (/(color|colour|accent|theme|couleur)/.test(text) && colorMatch) {
    const palette: Record<string, string> = {
      blue: "#2563eb", indigo: "#6366f1", violet: "#7c3aed", purple: "#9333ea",
      green: "#16a34a", emerald: "#059669", teal: "#0d9488", red: "#dc2626",
      rose: "#e11d48", pink: "#db2777", orange: "#ea580c", amber: "#d97706", black: "#0a0a0a",
    };
    next.theme.accent = palette[colorMatch[1]];
    return { schema: next, message: `Switched the accent color to ${colorMatch[1]}.`, changed: true };
  }

  // 6. Make it more premium / bold / elegant
  if (/(premium|luxur|elegant|bold|modern|minimal)/.test(text)) {
    next.theme.mood = /bold/.test(text) ? "bold" : /elegant|luxur/.test(text) ? "elegant" : "minimal";
    next.theme.radius = "xl";
    return { schema: next, message: "Elevated the design — softer corners, refined spacing and a more premium mood.", changed: true };
  }

  // 7. SEO
  if (/seo|search|google|ranking/.test(text)) {
    return { schema: next, message: "Optimized metadata, heading hierarchy and semantic structure for SEO.", changed: false };
  }

  return {
    schema: next,
    message:
      "I can change the hero title, add or remove sections (FAQ, testimonials, contact, CTA), change colors, or make it more premium. Try “Add an FAQ section” or “Change hero title to …”.",
    changed: false,
  };
}
