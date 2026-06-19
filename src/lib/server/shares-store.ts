import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { SiteAnalysis, SiteSchema } from "@/lib/generation/types";

/**
 * Public, read-by-id snapshots of a redesign — the seam that stops the "wow"
 * from living only in the visitor's sessionStorage. An anonymous user's rebuild
 * is persisted here the moment it's generated and gets a shareable /r/<id> URL,
 * so it survives a refresh/closed tab and can be sent to a partner.
 *
 * Unlike projects, shares have no owner and are readable by id only (the id is
 * the capability). KV when configured, filesystem otherwise.
 */

export interface Share {
  id: string;
  schema: SiteSchema;
  /** Kept so the share page can still show the before/after. */
  analysis?: SiteAnalysis;
  createdAt: string;
}

function newId(): string {
  return crypto.randomBytes(9).toString("base64url");
}

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const useKv = Boolean(KV_URL && KV_TOKEN);
const kvKey = (id: string) => `share:${id}`;
/** Anonymous previews are ephemeral-ish; expire after 60 days to bound storage. */
const TTL_SECONDS = 60 * 24 * 60 * 60;

async function kv<T = unknown>(command: (string | number)[]): Promise<T> {
  const res = await fetch(KV_URL as string, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV ${command[0]} failed: ${res.status}`);
  const data = (await res.json()) as { result: T; error?: string };
  if (data.error) throw new Error(`KV ${command[0]} error: ${data.error}`);
  return data.result;
}

const FS_DIR = process.env.REFRAME_DATA_DIR
  ? path.join(path.resolve(process.env.REFRAME_DATA_DIR), "shares")
  : path.join(process.cwd(), ".data", "shares");
const fileFor = (id: string) => path.join(FS_DIR, `${id}.json`);

export async function createShare(schema: SiteSchema, analysis?: SiteAnalysis): Promise<Share> {
  const share: Share = { id: newId(), schema, analysis, createdAt: new Date().toISOString() };
  const json = JSON.stringify(share);
  if (useKv) {
    await kv(["SET", kvKey(share.id), json, "EX", TTL_SECONDS]);
  } else {
    await fs.mkdir(FS_DIR, { recursive: true });
    await fs.writeFile(fileFor(share.id), json, "utf8");
  }
  return share;
}

export async function getShare(id: string): Promise<Share | null> {
  // Guard against path traversal / bad ids before any I/O.
  if (!/^[A-Za-z0-9_-]{6,32}$/.test(id)) return null;
  if (useKv) {
    const raw = await kv<string | null>(["GET", kvKey(id)]);
    return raw ? (JSON.parse(raw) as Share) : null;
  }
  try {
    return JSON.parse(await fs.readFile(fileFor(id), "utf8")) as Share;
  } catch {
    return null;
  }
}
