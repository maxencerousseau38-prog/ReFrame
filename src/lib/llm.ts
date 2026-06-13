import Anthropic from "@anthropic-ai/sdk";
import type { SiteAnalysis, SiteSchema } from "./generation/types";
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

/**
 * Apply a natural-language edit with Claude, returning an updated SiteSchema.
 * Falls back to the deterministic intent router on any failure.
 */
export async function aiEdit(schema: SiteSchema, instruction: string): Promise<AiEditResult> {
  if (!isLLMEnabled()) return applyAiEdit(schema, instruction);

  const prompt = `You edit multi-page website definitions expressed as JSON "SiteSchema" objects.

Schema shape:
- "blocks": the HOME page's sections (array of {id, type, variant, props}).
- "pages": OPTIONAL array of extra pages, each {path, label, blocks}. Common
  paths: "services", "about", "contact". Edit these to change those pages.
- "theme": { primary, accent (hex), radius, font, mood }.

Rules:
- Apply the instruction by returning the FULL updated schema (home blocks, every
  page in "pages", and theme), preserving the overall shape and all ids.
- You may edit any page: change prop text, replace image URLs (props.image,
  props.images, props.heroImageUrl), add/remove/reorder blocks or pages, or
  change theme.accent.
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
  return applyAiEdit(schema, instruction);
}
