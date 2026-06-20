import Anthropic from "@anthropic-ai/sdk";
import type { SiteAnalysis, SiteSchema, BlockType, Theme } from "./generation/types";
import { applyAiEdit, type AiEditResult } from "./generation/engine";
import { parseSiteSchema } from "./generation/validate";

/**
 * Claude integration for ReFrame. Both functions degrade gracefully: when no
 * ANTHROPIC_API_KEY is set (or a call fails) they fall back to the deterministic
 * engine, so the product works with or without an LLM configured.
 */

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

export function isLLMEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

function textOf(res: Anthropic.Message): string {
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

/** Pull the first balanced JSON object/array out of a model response. */
function extractJSON<T>(text: string): T {
  const start = text.search(/[[{]/);
  if (start < 0) throw new Error("no JSON found");
  const open = text[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === open) depth++;
    else if (text[i] === close) {
      depth--;
      if (depth === 0) return JSON.parse(text.slice(start, i + 1)) as T;
    }
  }
  throw new Error("unbalanced JSON");
}

/**
 * Rewrite the crawled content into sharper, on-brand copy for the rebuild.
 * Returns a partial that the caller merges into the analysis before generating.
 */
export async function rewriteContent(
  analysis: SiteAnalysis
): Promise<Partial<SiteAnalysis["extractedContent"]>> {
  if (!isLLMEnabled()) return {};

  const prompt = `You are a senior copywriter rebuilding a website for a ${analysis.industryLabel} business called "${analysis.brandName}".

Here is the content extracted from their current site:
- Headline: ${analysis.extractedContent.headline}
- Description: ${analysis.extractedContent.description}
- Services/nav: ${analysis.extractedContent.services.join(", ")}

Rewrite this into modern, confident, conversion-focused copy. Keep the business's real meaning and offering; do not invent facts or fake statistics. Do not use em dashes.

Respond with ONLY a JSON object of this exact shape:
{"headline": string (max 8 words), "description": string (max 24 words), "services": string[] (4 to 6 short labels)}`;

  try {
    const res = await getClient().messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    const json = extractJSON<{ headline?: string; description?: string; services?: string[] }>(textOf(res));
    const out: Partial<SiteAnalysis["extractedContent"]> = {};
    if (typeof json.headline === "string") out.headline = json.headline.trim();
    if (typeof json.description === "string") out.description = json.description.trim();
    if (Array.isArray(json.services) && json.services.length >= 3) {
      out.services = json.services.slice(0, 6).map((s) => String(s).trim());
    }
    return out;
  } catch {
    return {};
  }
}

const ALLOWED_SECTIONS: BlockType[] = [
  "hero", "about", "services", "features", "portfolio", "gallery", "stats",
  "testimonials", "pricing", "faq", "cta", "contact", "footer",
];
const ALLOWED_FONTS: Theme["font"][] = ["inter", "geist", "serif"];
const ALLOWED_MOODS: Theme["mood"][] = ["minimal", "bold", "warm", "elegant"];
const ALLOWED_RADIUS: Theme["radius"][] = ["sm", "md", "lg", "xl"];

export interface SiteDesign {
  layout?: BlockType[];
  theme?: Partial<Theme>;
}

/**
 * Let Claude act as the art director: from the real content it composes the
 * section order (layout) and a tasteful theme (font / mood / radius / accent),
 * which the deterministic engine then fills with vetted premium blocks. Output
 * is strictly validated against our allowed sets; anything off is dropped, and
 * an empty result means the engine keeps its deterministic plan + theme.
 */
export async function designSite(analysis: SiteAnalysis): Promise<SiteDesign> {
  if (!isLLMEnabled()) return {};

  const c = analysis.extractedContent;
  const prompt = `You are an elite web art director composing a premium site for a ${analysis.industryLabel} business called "${analysis.brandName}".

Real content available:
- Headline: ${c.headline}
- Description: ${c.description}
- Services/offer: ${c.services.join(", ")}
- Has real images: ${c.images.length > 0 ? "yes" : "no"}
- Has real testimonials: ${c.testimonials?.length ? "yes" : "no"}
- Has real stats/metrics: ${c.stats?.length ? "yes" : "no"}

Decide the most compelling, conversion-focused PAGE COMPOSITION and visual mood for THIS business.

Rules:
- Order sections from this allowed set only: ${ALLOWED_SECTIONS.join(", ")}.
- Start with "hero" and end with "footer". Always include "contact".
- Only include "testimonials" if real testimonials exist; only include "stats"/"portfolio"/"gallery" if real images/metrics exist (no filler).
- Choose font, mood, radius and an accent hex that fit the sector and brand.

Respond with ONLY a JSON object of this exact shape:
{"layout": string[] (6 to 9 section types from the allowed set), "theme": {"font": "inter"|"geist"|"serif", "mood": "minimal"|"bold"|"warm"|"elegant", "radius": "sm"|"md"|"lg"|"xl", "accent": "#rrggbb"}}`;

  try {
    const res = await getClient().messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });
    const json = extractJSON<{ layout?: unknown; theme?: Record<string, unknown> }>(textOf(res));
    const out: SiteDesign = {};

    if (Array.isArray(json.layout)) {
      const layout = json.layout
        .map((s) => String(s).toLowerCase().trim())
        .filter((s): s is BlockType => (ALLOWED_SECTIONS as string[]).includes(s));
      // Need a real composition with a hero; otherwise let the engine plan it.
      if (layout.length >= 4 && layout.includes("hero")) out.layout = layout;
    }

    const t = json.theme || {};
    const theme: Partial<Theme> = {};
    if (typeof t.font === "string" && (ALLOWED_FONTS as string[]).includes(t.font)) theme.font = t.font as Theme["font"];
    if (typeof t.mood === "string" && (ALLOWED_MOODS as string[]).includes(t.mood)) theme.mood = t.mood as Theme["mood"];
    if (typeof t.radius === "string" && (ALLOWED_RADIUS as string[]).includes(t.radius)) theme.radius = t.radius as Theme["radius"];
    if (typeof t.accent === "string" && /^#[0-9a-f]{6}$/i.test(t.accent)) theme.accent = t.accent;
    if (Object.keys(theme).length) out.theme = theme;

    return out;
  } catch {
    return {};
  }
}

/**
 * Apply a natural-language edit. Tries the fast deterministic router FIRST so
 * common edits (title, colour, add/remove section, premium, animations) apply
 * instantly and for free; only open-ended requests the router can't handle fall
 * through to Claude. Always degrades safely.
 */
export async function aiEdit(schema: SiteSchema, instruction: string): Promise<AiEditResult> {
  // 1) Instant path: deterministic intents, no network round-trip.
  const quick = applyAiEdit(schema, instruction);
  if (quick.changed) return quick;

  // 2) Open-ended path: hand to Claude when configured, else the router's help.
  if (!isLLMEnabled()) return quick;

  const prompt = `You edit multi-page website definitions expressed as JSON "SiteSchema" objects.

Schema shape:
- "blocks": the HOME page's sections (array of {id, type, variant, props}).
- "pages": OPTIONAL array of extra pages, each {path, label, blocks}. Common
  paths: "services", "about", "contact". Edit these to change those pages.
- "theme": { primary, accent (hex), radius, font, mood }.
- "animations": OPTIONAL boolean. Set false to make the site static (no motion),
  true to re-enable it. Toggle this when the user asks to remove/add animations.

Rules:
- Apply the instruction by returning the FULL updated schema (home blocks, every
  page in "pages", and theme), preserving the overall shape and all ids.
- You may edit any page: change prop text, replace image URLs (props.image,
  props.images, props.heroImageUrl), add/remove/reorder blocks or pages, or
  change theme.accent, or toggle "animations".
- If the user names a page ("the about page", "services"), edit that page's
  blocks; otherwise edit the home blocks.
- Allowed block types: hero, features, services, portfolio, stats, about,
  testimonials, faq, cta, contact, footer.
- Do not invent fake testimonials or statistics. Do not use em dashes.

Current schema:
${JSON.stringify(schema)}

Instruction: ${instruction}

Respond with ONLY a JSON object: {"message": string (one short sentence describing what you changed), "schema": <the full updated SiteSchema>}`;

  try {
    const res = await getClient().messages.create({
      model: MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });
    const json = extractJSON<{ message?: string; schema?: unknown }>(textOf(res));
    // Validate + repair the model's schema before trusting it. A malformed or
    // unrenderable result yields null, and we fall back to the deterministic
    // router below instead of shipping a broken page.
    const parsed = json.message ? parseSiteSchema(json.schema, schema.brand.name) : null;
    if (parsed && json.message) {
      // preserve the original id/source so the rest of the app stays consistent
      parsed.id = schema.id;
      parsed.sourceUrl = schema.sourceUrl;
      return { schema: parsed, message: json.message, changed: true };
    }
  } catch {
    // fall through
  }
  return quick; // deterministic result (help message) when the LLM can't help
}
