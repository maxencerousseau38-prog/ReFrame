import type { SiteSchema } from "@/lib/generation/types";

export interface PublishedSite {
  slug: string;
  schema: SiteSchema;
  createdAt: string;
  updatedAt: string;
  /** Owner user id, when the site was published by a signed-in user. */
  ownerId?: string;
}

/**
 * Storage backend contract for published sites.
 *
 * Implementations only deal with already-validated slugs — the store layer
 * (`index.ts`) validates and allocates slugs before calling these. Keeping the
 * surface this small is what lets filesystem, KV, Postgres, etc. be swapped
 * behind one env switch without any caller changes.
 */
export interface StoreBackend {
  /** Human label, surfaced for logs / diagnostics. */
  readonly name: string;
  /** Return the stored site, or null if absent / unreadable. */
  read(slug: string): Promise<PublishedSite | null>;
  /** Persist (create or overwrite) a record. */
  write(record: PublishedSite): Promise<void>;
  /** Delete a record. No-op if it doesn't exist. */
  remove(slug: string): Promise<void>;
  /** All sites, newest first. Best-effort. */
  list(): Promise<PublishedSite[]>;
}
