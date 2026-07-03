import type { HTMLElement } from "node-html-parser";
import type { PassContext, PassResult, ExtractionResult } from "./types";
import { detectLanguage } from "./language";
import {
  extractProse,
  extractTestimonials,
  extractFaq,
  extractContact,
  extractStats,
  extractSocialLinks,
  extractCollection,
  extractTeam,
  extractProducts,
  detectIntegrations,
} from "@/lib/generation/engine";
import { detectIndustry, INDUSTRY_PROFILES } from "@/lib/generation/industries";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// JSON-LD parsing (mirrors the private jsonLd() in engine.ts)
// ---------------------------------------------------------------------------

interface JsonLd {
  name?: string;
  description?: string;
  type?: string;
  telephone?: string;
  email?: string;
  address?: string;
  ratingValue?: string;
  reviewCount?: string;
  reviews?: { quote: string; name?: string; role?: string }[];
  faq?: { question: string; answer: string }[];
}

function flattenAddress(a: unknown): string | undefined {
  if (typeof a === "string") return clean(a) || undefined;
  if (!a || typeof a !== "object") return undefined;
  const o = a as Record<string, unknown>;
  const parts = [
    o.streetAddress,
    o.postalCode,
    o.addressLocality,
    o.addressRegion,
    o.addressCountry,
  ]
    .filter((p): p is string => typeof p === "string" && p.trim().length > 0);
  return parts.length ? clean(parts.join(", ")) : undefined;
}

function parseJsonLd(root: HTMLElement): JsonLd {
  const out: JsonLd = {};
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    let data: unknown;
    try {
      data = JSON.parse(s.text);
    } catch {
      continue;
    }
    const root_ = data as Record<string, unknown>;
    const graph = Array.isArray(root_?.["@graph"])
      ? (root_["@graph"] as unknown[])
      : null;
    const nodes = Array.isArray(data) ? data : graph ?? [data];
    for (const node of nodes) {
      if (!node || typeof node !== "object") continue;
      const n = node as Record<string, unknown>;
      const t = Array.isArray(n["@type"]) ? n["@type"][0] : n["@type"];
      if (!out.type && typeof t === "string") out.type = t;
      if (!out.name && typeof n.name === "string") out.name = clean(n.name);
      if (!out.description && typeof n.description === "string")
        out.description = clean(n.description);
      if (!out.telephone && typeof n.telephone === "string")
        out.telephone = clean(n.telephone);
      if (!out.email && typeof n.email === "string")
        out.email = clean(n.email).replace(/^mailto:/i, "");
      if (!out.address) {
        const addr = flattenAddress(n.address);
        if (addr) out.address = addr;
      }
      const rating = n.aggregateRating as Record<string, unknown> | undefined;
      if (rating && typeof rating === "object") {
        const rv = rating.ratingValue;
        const rc = rating.reviewCount ?? rating.ratingCount;
        if (
          !out.ratingValue &&
          (typeof rv === "string" || typeof rv === "number")
        )
          out.ratingValue = String(rv);
        if (
          !out.reviewCount &&
          (typeof rc === "string" || typeof rc === "number")
        )
          out.reviewCount = String(rc);
      }
      // FAQPage structured data
      if (t === "FAQPage" && Array.isArray(n.mainEntity)) {
        for (const q of n.mainEntity) {
          if (!q || typeof q !== "object") continue;
          const qq = q as Record<string, unknown>;
          const ans = qq.acceptedAnswer as Record<string, unknown> | undefined;
          const question = typeof qq.name === "string" ? clean(qq.name) : "";
          const answerRaw =
            ans && typeof ans.text === "string" ? ans.text : "";
          const answer = clean(answerRaw.replace(/<[^>]+>/g, " "));
          if (question && answer) (out.faq ??= []).push({ question, answer });
          if ((out.faq?.length ?? 0) >= 6) break;
        }
      }
      // Real customer reviews from structured data
      const rawReviews = Array.isArray(n.review)
        ? n.review
        : n.review
          ? [n.review]
          : [];
      for (const r of rawReviews) {
        if (!r || typeof r !== "object") continue;
        const rev = r as Record<string, unknown>;
        const body = rev.reviewBody ?? rev.description;
        const quote = typeof body === "string" ? clean(body) : "";
        if (quote.length < 24) continue;
        const author = rev.author as
          | Record<string, unknown>
          | string
          | undefined;
        const name =
          typeof author === "string"
            ? clean(author)
            : author &&
                typeof author === "object" &&
                typeof author.name === "string"
              ? clean(author.name)
              : undefined;
        (out.reviews ??= []).push({
          quote: quote.slice(0, 280),
          name: name || undefined,
        });
        if (out.reviews.length >= 6) break;
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Generic heading helpers
// ---------------------------------------------------------------------------

const GENERIC_HEADLINES = /^(home|welcome|untitled|page|index)$/i;

// ---------------------------------------------------------------------------
// Primary CTA label — the site's REAL call-to-action copy (V2 Chantier 3).
// Mechanical rule: the first non-generic link/button near the h1, outside nav.
// ---------------------------------------------------------------------------

const GENERIC_CTA =
  /^(home|menu|login|log ?in|sign ?in|accueil|connexion|cookies?|accept(er)?|ok|close|fermer|search|rechercher|skip.*)$/i;

function extractPrimaryCtaLabel(root: HTMLElement): string | undefined {
  const h1 = root.querySelector("h1");
  if (!h1) return undefined;

  // Widen the scope one ancestor at a time (h1 wrapper → hero section → …)
  // and take the first plausible action found outside the navigation.
  let scope: HTMLElement | null = h1.parentNode as HTMLElement | null;
  for (let depth = 0; scope && depth < 4; depth++) {
    for (const el of scope.querySelectorAll("a[href], button")) {
      if (el.closest("nav")) continue;
      const text = clean(el.text);
      if (text.length >= 2 && text.length <= 32 && !GENERIC_CTA.test(text)) {
        return text;
      }
    }
    scope = scope.parentNode as HTMLElement | null;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Pass 2 — Real content extraction
// ---------------------------------------------------------------------------

export async function runContentPass(ctx: PassContext): Promise<PassResult> {
  const { root, html, url, bodyText } = ctx;
  const ld = parseJsonLd(root);

  // -----------------------------------------------------------------------
  // 1. Headline
  // -----------------------------------------------------------------------

  let headline: string | undefined;

  // Try h1 text first (skip generic ones)
  const h1 = root.querySelector("h1");
  if (h1) {
    const h1Text = clean(h1.text);
    if (h1Text.length >= 2 && !GENERIC_HEADLINES.test(h1Text)) {
      headline = h1Text;
    }
  }

  // Fallbacks: og:title → JSON-LD name → page title
  if (!headline) {
    const ogTitle = root
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content");
    if (ogTitle) headline = clean(ogTitle);
  }
  if (!headline && ld.name) {
    headline = ld.name;
  }
  if (!headline) {
    const titleEl = root.querySelector("title");
    if (titleEl) headline = clean(titleEl.text);
  }

  headline = headline || "Welcome";

  // -----------------------------------------------------------------------
  // 2. Description
  // -----------------------------------------------------------------------

  let description: string | undefined;

  // Meta description
  const metaDesc = root
    .querySelector('meta[name="description"]')
    ?.getAttribute("content");
  if (metaDesc) description = clean(metaDesc);

  // og:description
  if (!description) {
    const ogDesc = root
      .querySelector('meta[property="og:description"]')
      ?.getAttribute("content");
    if (ogDesc) description = clean(ogDesc);
  }

  // JSON-LD description
  if (!description && ld.description) {
    description = ld.description;
  }

  // First substantial paragraph
  if (!description) {
    for (const p of root.querySelectorAll("p")) {
      const text = clean(p.text);
      if (text.length >= 40) {
        description = text.slice(0, 300);
        break;
      }
    }
  }

  description = description || "";

  // -----------------------------------------------------------------------
  // 3. Brand name
  // -----------------------------------------------------------------------

  let brandName: string | undefined;

  // og:site_name
  const ogSiteName = root
    .querySelector('meta[property="og:site_name"]')
    ?.getAttribute("content");
  if (ogSiteName) brandName = clean(ogSiteName);

  // application-name meta
  if (!brandName) {
    const appName = root
      .querySelector('meta[name="application-name"]')
      ?.getAttribute("content");
    if (appName) brandName = clean(appName);
  }

  // JSON-LD name
  if (!brandName && ld.name) {
    brandName = ld.name;
  }

  // Title brand part (after split on | / - / ·)
  if (!brandName) {
    const titleEl = root.querySelector("title");
    if (titleEl) {
      const parts = clean(titleEl.text).split(/\s*[|·–—-]\s*/);
      // Brand is typically the last segment (e.g. "Services - BrandName")
      if (parts.length > 1) {
        const last = parts[parts.length - 1].trim();
        if (last.length >= 2 && last.length <= 60) brandName = last;
      }
    }
  }

  // Domain fallback
  if (!brandName) {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, "");
      const domainPart = hostname.split(".")[0];
      brandName =
        domainPart.charAt(0).toUpperCase() + domainPart.slice(1);
    } catch {
      brandName = "Business";
    }
  }

  // -----------------------------------------------------------------------
  // 4. Services — REAL PAGE CONTENT ONLY (never from nav items)
  // -----------------------------------------------------------------------

  let services: { title: string; description?: string }[] | undefined;

  // Try extractProse first — it finds h3 service cards with descriptions
  const prose = extractProse(root);
  if (prose.serviceItems && prose.serviceItems.length >= 2) {
    services = prose.serviceItems;
  }

  // If extractProse didn't find enough, look for content sections with
  // service-like headings and real paragraph content beneath them
  if (!services) {
    const serviceItems: { title: string; description?: string }[] = [];
    const serviceSeen = new Set<string>();

    for (const h of root.querySelectorAll("h2, h3")) {
      const heading = clean(h.text);
      // Look inside sections that have service-related parent headings
      const parent = h.closest("section") || h.parentNode;
      if (!parent) continue;

      // Check if this is a sub-heading (h3) inside a services section
      const parentHeadings = (parent as HTMLElement).querySelectorAll("h2");
      const inServiceSection = Array.from(parentHeadings).some((ph) =>
        /services|what we do|our services|nos services/i.test(clean(ph.text))
      );

      if (
        h.tagName?.toLowerCase() === "h3" &&
        inServiceSection &&
        heading.length >= 3 &&
        heading.length <= 60
      ) {
        // Get the next paragraph sibling as description
        let desc: string | undefined;
        let sibling = h.nextElementSibling;
        while (sibling) {
          if (
            sibling.tagName?.toLowerCase() === "p" &&
            clean(sibling.text).length >= 10
          ) {
            desc = clean(sibling.text).slice(0, 300);
            break;
          }
          if (/^h[1-3]$/i.test(sibling.tagName || "")) break;
          sibling = sibling.nextElementSibling;
        }

        const key = heading.toLowerCase();
        if (!serviceSeen.has(key)) {
          serviceSeen.add(key);
          serviceItems.push({ title: heading, description: desc });
        }
      }
    }

    if (serviceItems.length >= 2) {
      services = serviceItems;
    }
  }

  // NEVER fall back to navigation labels as services.
  // NEVER fall back to industry defaults — that's the engine's job.
  // If no real services found, leave undefined.

  // -----------------------------------------------------------------------
  // 5. Projects / portfolio
  // -----------------------------------------------------------------------

  let projects:
    | {
        title: string;
        description?: string;
        image?: string;
        category?: string;
      }[]
    | undefined;

  // Look for portfolio/project sections
  for (const h of root.querySelectorAll("h1, h2")) {
    const headText = clean(h.text);
    if (!/portfolio|projects|work|case stud|réalisations/i.test(headText))
      continue;

    const section =
      (h.closest("section") as HTMLElement | null) ??
      (h.parentNode as HTMLElement | null);
    if (!section) continue;

    const cards: {
      title: string;
      description?: string;
      image?: string;
      category?: string;
    }[] = [];
    const projectSeen = new Set<string>();

    // Look for repeated card patterns (div/article with image + heading)
    const cardEls = section.querySelectorAll(
      "article, [class*='card'], [class*='project'], [class*='portfolio'], [class*='item']"
    );
    for (const card of cardEls) {
      const titleEl =
        card.querySelector("h3") ||
        card.querySelector("h4") ||
        card.querySelector("h2");
      if (!titleEl) continue;
      const title = clean(titleEl.text);
      if (!title || title.length < 2) continue;

      const key = title.toLowerCase();
      if (projectSeen.has(key)) continue;
      projectSeen.add(key);

      const img = card.querySelector("img");
      const image = img?.getAttribute("src") || undefined;

      // Optional description
      const descEl = card.querySelector("p");
      const desc = descEl ? clean(descEl.text) : undefined;

      // Optional category (small text, span, or tag-like element)
      const catEl = card.querySelector("span, small, [class*='cat']");
      const category =
        catEl && clean(catEl.text).length <= 30
          ? clean(catEl.text)
          : undefined;

      cards.push({
        title,
        description: desc && desc.length >= 5 ? desc.slice(0, 300) : undefined,
        image,
        category,
      });
    }

    if (cards.length >= 1) {
      projects = cards;
      break; // use first matching section
    }
  }

  // -----------------------------------------------------------------------
  // 6. Call engine extraction functions
  // -----------------------------------------------------------------------

  const testimonials = extractTestimonials(root, ld);
  const faqItems = extractFaq(root, ld);
  const contact = extractContact(root, bodyText, ld);
  const stats = extractStats(ld);
  const socialLinks = extractSocialLinks(root);
  const collection = extractCollection(root);
  const team = extractTeam(root, url);
  const products = extractProducts(root, url);
  const integrations = detectIntegrations(html);

  // About body from prose extraction
  const aboutBody = prose.aboutBody;

  // -----------------------------------------------------------------------
  // 8. Deduplication
  // -----------------------------------------------------------------------

  // Services: deduplicate by title
  if (services) {
    const seen = new Set<string>();
    services = services.filter((s) => {
      const key = s.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (services.length === 0) services = undefined;
  }

  // Projects: deduplicate by title
  if (projects) {
    const seen = new Set<string>();
    projects = projects.filter((p) => {
      const key = p.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (projects.length === 0) projects = undefined;
  }

  // Testimonials: deduplicate by first 48 chars of quote
  let dedupedTestimonials = testimonials;
  if (dedupedTestimonials) {
    const seen = new Set<string>();
    dedupedTestimonials = dedupedTestimonials.filter((t) => {
      const key = t.quote.slice(0, 48).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (dedupedTestimonials.length === 0) dedupedTestimonials = undefined;
  }

  // FAQ: deduplicate by first 48 chars of question
  let dedupedFaq = faqItems;
  if (dedupedFaq) {
    const seen = new Set<string>();
    dedupedFaq = dedupedFaq.filter((f) => {
      const key = f.question.slice(0, 48).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (dedupedFaq.length === 0) dedupedFaq = undefined;
  }

  // -----------------------------------------------------------------------
  // 9. Build and return PassResult
  // -----------------------------------------------------------------------

  const content: Partial<ExtractionResult["content"]> = {
    headline,
    description,
  };

  // V2 Chantier 3 — real language + real CTA copy (absent when not found,
  // never guessed; downstream fallbacks stay visible in the provenance).
  const language = detectLanguage(root, bodyText);
  if (language) content.language = language.lang;
  const primaryCtaLabel = extractPrimaryCtaLabel(root);
  if (primaryCtaLabel) content.primaryCtaLabel = primaryCtaLabel;

  if (aboutBody) content.aboutBody = aboutBody;
  if (services) content.services = services;
  if (projects) content.projects = projects;
  if (dedupedTestimonials) content.testimonials = dedupedTestimonials;
  if (dedupedFaq) content.faqItems = dedupedFaq;
  if (stats) content.stats = stats;
  if (team) content.team = team;
  if (collection) content.collection = collection;
  if (products && products.length > 0) content.products = products;

  const searchText = `${brandName} ${headline} ${description} ${bodyText}`.toLowerCase();
  const industry = detectIndustry(searchText);
  const profile = INDUSTRY_PROFILES[industry] ?? INDUSTRY_PROFILES.generic;

  const business: Partial<ExtractionResult["business"]> = {
    name: brandName!,
    industry,
    industryLabel: profile.label,
  };
  if (contact) business.contact = contact;
  if (socialLinks) business.socialLinks = socialLinks;

  const updates: Partial<ExtractionResult> = {
    content: content as ExtractionResult["content"],
    business: business as ExtractionResult["business"],
  };

  if (integrations.length > 0) {
    updates.integrations = integrations;
  }

  return { updates };
}
