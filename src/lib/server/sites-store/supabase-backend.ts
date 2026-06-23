import type { SiteSchema } from "@/lib/generation/types";
import { getSupabase, supabaseConfigured } from "@/lib/server/supabase";
import type { PublishedSite, StoreBackend } from "./types";

/**
 * Postgres (Supabase) backend for published sites. Durable and multi-instance —
 * the production default. Selected over KV/filesystem when Supabase env is set.
 */

export { supabaseConfigured };

const TABLE = "sites";

/** DB row <-> domain record. The DB is snake_case; the app is camelCase. */
interface Row {
  slug: string;
  schema: SiteSchema;
  owner_id: string | null;
  domain: string | null;
  domain_verified: boolean;
  created_at: string;
  updated_at: string;
}

function toRecord(r: Row): PublishedSite {
  const site: PublishedSite = {
    slug: r.slug,
    schema: r.schema,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    domainVerified: Boolean(r.domain_verified),
  };
  if (r.owner_id) site.ownerId = r.owner_id;
  if (r.domain) site.domain = r.domain;
  return site;
}

export const supabaseBackend: StoreBackend = {
  name: "supabase",

  async read(slug) {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return toRecord(data as Row);
  },

  async write(record) {
    const row = {
      slug: record.slug,
      schema: record.schema,
      owner_id: record.ownerId ?? null,
      domain: record.domain ?? null,
      domain_verified: Boolean(record.domainVerified),
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    };
    const { error } = await getSupabase().from(TABLE).upsert(row, { onConflict: "slug" });
    if (error) throw new Error(`supabase sites write failed: ${error.message}`);
  },

  async remove(slug) {
    const { error } = await getSupabase().from(TABLE).delete().eq("slug", slug);
    if (error) throw new Error(`supabase sites remove failed: ${error.message}`);
  },

  async list() {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select("*")
      .order("updated_at", { ascending: false });
    if (error || !data) return [];
    return (data as Row[]).map(toRecord);
  },
};
