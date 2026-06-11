import type { SiteSchema } from "@/lib/generation/types";
import type { PublishedSite, StoreBackend } from "./types";
import { fsBackend } from "./fs-backend";
import { kvBackend, kvConfigured } from "./kv-backend";

export type { PublishedSite } from "./types";

/**
 * Server-side persistence for published sites.
 *
 * A published schema is written through the active backend and served back from
 * `/s/<slug>`. The backend is chosen once per process from the environment:
 * Vercel KV / Upstash Redis when its credentials are present, the filesystem
 * otherwise. Callers use the async API below and never see which backend is in
 * play — adding Postgres/Blob/etc. later means one more adapter, no caller
 * changes.
 */
const backend: StoreBackend = kvConfigured() ? kvBackend : fsBackend;

/** Which backend is active — handy for a health endpoint or logs. */
export function storeBackendName(): string {
  return backend.name;
}

/** Slug must round-trip safely through a URL and any backend key/path. */
function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "site"
  );
}

/** Reject anything that isn't a plain slug before it reaches a backend. */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,63}$/.test(slug);
}

/** Read one published site, or null if it doesn't exist. */
export async function getSite(slug: string): Promise<PublishedSite | null> {
  if (!isValidSlug(slug)) return null;
  return backend.read(slug);
}

/**
 * Persist a schema under a unique slug derived from the brand name and return
 * the stored record. Collisions get a short random suffix so one brand never
 * clobbers another's published site.
 */
export async function publishSite(schema: SiteSchema): Promise<PublishedSite> {
  const base = slugify(schema.brand?.name ?? "site");
  let slug = base;
  for (let i = 0; i < 5 && (await backend.read(slug)); i++) {
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const now = new Date().toISOString();
  const record: PublishedSite = { slug, schema, createdAt: now, updatedAt: now };
  await backend.write(record);
  return record;
}

/** List published sites, newest first. */
export async function listSites(): Promise<PublishedSite[]> {
  return backend.list();
}
