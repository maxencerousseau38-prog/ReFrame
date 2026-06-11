import type { PublishedSite, StoreBackend } from "./types";

/**
 * Vercel KV / Upstash Redis backend — for serverless + multi-instance.
 *
 * Talks to the KV REST API over plain `fetch`, so there's no npm dependency and
 * it runs in any runtime (edge or node). Activates automatically when both
 * `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set (Vercel injects these when
 * you attach a KV store; Upstash exposes the same pair).
 *
 * Layout:
 *   site:<slug>  -> JSON record (string)
 *   sites:index  -> sorted set, score = createdAt epoch, member = slug
 */

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

const keyFor = (slug: string) => `site:${slug}`;
const INDEX_KEY = "sites:index";

/** True when the KV credentials are present and this backend can be used. */
export function kvConfigured(): boolean {
  return Boolean(KV_URL && KV_TOKEN);
}

/** Execute a single Redis command via the KV REST API. */
async function kv<T = unknown>(command: (string | number)[]): Promise<T> {
  const res = await fetch(KV_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`KV ${command[0]} failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { result: T; error?: string };
  if (data.error) throw new Error(`KV ${command[0]} error: ${data.error}`);
  return data.result;
}

async function readSlug(slug: string): Promise<PublishedSite | null> {
  const raw = await kv<string | null>(["GET", keyFor(slug)]);
  return raw ? (JSON.parse(raw) as PublishedSite) : null;
}

export const kvBackend: StoreBackend = {
  name: "vercel-kv",

  read: readSlug,

  async write(record) {
    await kv(["SET", keyFor(record.slug), JSON.stringify(record)]);
    await kv(["ZADD", INDEX_KEY, Date.parse(record.createdAt), record.slug]);
  },

  async list() {
    const slugs = await kv<string[]>(["ZRANGE", INDEX_KEY, "0", "-1", "REV"]);
    if (!slugs || slugs.length === 0) return [];
    const records = await Promise.all(slugs.map(readSlug));
    return records.filter((r): r is PublishedSite => r !== null);
  },
};
