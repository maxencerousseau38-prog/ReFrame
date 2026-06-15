import type { SiteSchema, Block } from "@/lib/generation/types";

/**
 * SEO derivation for published sites.
 *
 * Search engines (and Google's local pack especially) reward pages that declare
 * who the business is in machine-readable form. We derive that from the schema
 * we already have - brand, the first real image, and any contact details the
 * owner provided - and emit schema.org JSON-LD plus an OG image. Pure and
 * deterministic so it is trivially testable and identical on every route.
 */

export interface SiteContact {
  phone?: string;
  email?: string;
  address?: string;
}

/** All blocks across the home page and any sub-pages. */
function allBlocks(schema: SiteSchema): Block[] {
  return [...schema.blocks, ...(schema.pages ?? []).flatMap((p) => p.blocks)];
}

/** The owner-provided contact details, if a contact block carries them. */
export function siteContact(schema: SiteSchema): SiteContact | undefined {
  for (const b of allBlocks(schema)) {
    const c = (b.props as { contact?: SiteContact }).contact;
    if (c && (c.phone || c.email || c.address)) {
      return {
        ...(c.phone ? { phone: c.phone } : {}),
        ...(c.email ? { email: c.email } : {}),
        ...(c.address ? { address: c.address } : {}),
      };
    }
  }
  return undefined;
}

/** The first real content image in the site, for the social/OG card. */
export function siteImage(schema: SiteSchema): string | undefined {
  for (const b of allBlocks(schema)) {
    const p = b.props as { image?: unknown; heroImageUrl?: unknown; images?: unknown };
    const fromList = Array.isArray(p.images) ? p.images.find((x) => typeof x === "string") : undefined;
    const candidate = [p.image, p.heroImageUrl, fromList].find((x) => typeof x === "string") as
      | string
      | undefined;
    if (candidate && /^https?:\/\//i.test(candidate)) return candidate;
  }
  return undefined;
}

/**
 * Build schema.org JSON-LD for a published site. Emits `LocalBusiness` when the
 * owner gave physical contact details (phone/address) - the signal Google uses
 * for local results - and `Organization` otherwise. `url` is included only when
 * the public URL is known (it isn't on the in-app preview).
 */
export function buildJsonLd(schema: SiteSchema, url?: string): Record<string, unknown> {
  const contact = siteContact(schema);
  const image = siteImage(schema);
  const isLocal = !!(contact?.phone || contact?.address);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": isLocal ? "LocalBusiness" : "Organization",
    name: schema.brand.name,
  };
  if (schema.brand.tagline) jsonLd.description = schema.brand.tagline;
  if (url) jsonLd.url = url;
  if (image) jsonLd.image = image;
  if (contact?.phone) jsonLd.telephone = contact.phone;
  if (contact?.email) jsonLd.email = contact.email;
  if (contact?.address) {
    jsonLd.address = { "@type": "PostalAddress", streetAddress: contact.address };
  }
  return jsonLd;
}
