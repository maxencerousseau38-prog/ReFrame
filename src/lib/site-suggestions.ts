import type { SiteSchema } from "@/lib/generation/types";

/**
 * The "AI webmaster" surface: a few concrete, honest next steps for a published
 * site, derived from what it actually has. This is the recurring value that
 * makes the subscription worth keeping — there's always a sensible next move.
 * Never suggests fabricating content (e.g. fake reviews).
 */
export function siteSuggestions(schema: SiteSchema, opts: { hasDomain: boolean }): string[] {
  const types = new Set<string>([
    ...schema.blocks.map((b) => b.type),
    ...(schema.pages ?? []).flatMap((p) => p.blocks.map((b) => b.type)),
  ]);
  const out: string[] = [];

  if (!opts.hasDomain) out.push("Connect your own domain for a professional, branded address.");
  if (!types.has("faq")) out.push("Add an FAQ to answer objections before visitors leave.");
  if (!types.has("testimonials")) out.push("Add 2-3 real client reviews — social proof lifts conversions.");
  if (!types.has("cta")) out.push("Add a closing call-to-action so every visit has a next step.");
  if (!types.has("contact")) out.push("Add a contact section so visitors can reach you in one tap.");
  out.push("Ask the AI editor to refresh your hero headline for a seasonal push.");

  return out.slice(0, 3);
}
