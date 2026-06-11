import { promises as fs } from "fs";
import path from "path";
import type { SiteSchema } from "@/lib/generation/types";

/**
 * Server-side persistence for published sites.
 *
 * This is a small file-backed store so the publish flow *actually works* in a
 * single-instance deployment (and in local/dev): a published schema is written
 * to disk and served back from `/s/<slug>`. The exported async interface is the
 * seam where a real backend (Postgres, Vercel KV/Blob, S3…) drops in later —
 * swap the body of these functions, the callers don't change.
 */

export interface PublishedSite {
  slug: string;
  schema: SiteSchema;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = process.env.REFRAME_DATA_DIR
  ? path.resolve(process.env.REFRAME_DATA_DIR)
  : path.join(process.cwd(), ".data", "sites");

function fileFor(slug: string): string {
  return path.join(DATA_DIR, `${slug}.json`);
}

/** Slug must round-trip safely through a URL and the filesystem. */
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

/** Reject anything that isn't a plain slug so callers can't read arbitrary files. */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,63}$/.test(slug);
}

async function slugTaken(slug: string): Promise<boolean> {
  try {
    await fs.access(fileFor(slug));
    return true;
  } catch {
    return false;
  }
}

/** Read one published site, or null if it doesn't exist / can't be parsed. */
export async function getSite(slug: string): Promise<PublishedSite | null> {
  if (!isValidSlug(slug)) return null;
  try {
    const raw = await fs.readFile(fileFor(slug), "utf8");
    return JSON.parse(raw) as PublishedSite;
  } catch {
    return null;
  }
}

/**
 * Persist a schema under a unique slug derived from the brand name and return
 * the stored record. Collisions get a short random suffix so one brand never
 * clobbers another's published site.
 */
export async function publishSite(schema: SiteSchema): Promise<PublishedSite> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const base = slugify(schema.brand?.name ?? "site");
  let slug = base;
  for (let i = 0; i < 5 && (await slugTaken(slug)); i++) {
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const now = new Date().toISOString();
  const record: PublishedSite = {
    slug,
    schema,
    createdAt: now,
    updatedAt: now,
  };
  await fs.writeFile(fileFor(slug), JSON.stringify(record), "utf8");
  return record;
}

/** List published sites, newest first. Best-effort: ignores unreadable files. */
export async function listSites(): Promise<PublishedSite[]> {
  let names: string[];
  try {
    names = await fs.readdir(DATA_DIR);
  } catch {
    return [];
  }
  const sites = await Promise.all(
    names
      .filter((n) => n.endsWith(".json"))
      .map((n) => getSite(n.replace(/\.json$/, "")))
  );
  return sites
    .filter((s): s is PublishedSite => s !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
