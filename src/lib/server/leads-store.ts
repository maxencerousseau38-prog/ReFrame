import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { getSupabase, supabaseConfigured } from "./supabase";

/**
 * Lead capture for published sites. Every contact-form submission is stored here
 * FIRST (so a lead is never lost if email delivery hiccups), then emailed
 * best-effort. Owners read their leads in the dashboard. KV when configured,
 * filesystem otherwise; indexed per owner.
 */

export interface Lead {
  id: string;
  ownerId: string;
  slug: string;
  brand: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

function newId(): string {
  return crypto.randomBytes(9).toString("base64url");
}

const sbOn = supabaseConfigured();

interface LeadRow {
  id: string;
  owner_id: string;
  slug: string;
  brand: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

function rowToLead(r: LeadRow): Lead {
  return {
    id: r.id,
    ownerId: r.owner_id,
    slug: r.slug,
    brand: r.brand,
    name: r.name,
    email: r.email,
    message: r.message,
    createdAt: r.created_at,
  };
}

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const useKv = Boolean(KV_URL && KV_TOKEN);
const kvKey = (id: string) => `lead:${id}`;
const kvIndex = (ownerId: string) => `leads:${ownerId}`;

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
  ? path.join(path.resolve(process.env.REFRAME_DATA_DIR), "leads")
  : path.join(process.cwd(), ".data", "leads");

export async function createLead(input: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
  const lead: Lead = { ...input, id: newId(), createdAt: new Date().toISOString() };
  if (sbOn) {
    const { error } = await getSupabase().from("leads").insert({
      id: lead.id,
      owner_id: lead.ownerId,
      slug: lead.slug,
      brand: lead.brand,
      name: lead.name,
      email: lead.email,
      message: lead.message,
      created_at: lead.createdAt,
    });
    if (error) throw new Error(`supabase leads insert failed: ${error.message}`);
    return lead;
  }
  if (useKv) {
    await kv(["SET", kvKey(lead.id), JSON.stringify(lead)]);
    await kv(["ZADD", kvIndex(lead.ownerId), Date.parse(lead.createdAt), lead.id]);
  } else {
    await fs.mkdir(path.join(FS_DIR, lead.ownerId), { recursive: true });
    await fs.writeFile(path.join(FS_DIR, lead.ownerId, `${lead.id}.json`), JSON.stringify(lead), "utf8");
  }
  return lead;
}

export async function listLeadsByOwner(ownerId: string, limit = 200): Promise<Lead[]> {
  if (sbOn) {
    const { data, error } = await getSupabase()
      .from("leads")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as LeadRow[]).map(rowToLead);
  }
  if (useKv) {
    const ids = await kv<string[]>(["ZRANGE", kvIndex(ownerId), "0", String(limit - 1), "REV"]);
    if (!ids?.length) return [];
    const raw = await Promise.all(ids.map((id) => kv<string | null>(["GET", kvKey(id)])));
    return raw.filter(Boolean).map((r) => JSON.parse(r as string) as Lead);
  }
  try {
    const dir = path.join(FS_DIR, ownerId);
    const names = await fs.readdir(dir);
    const leads = await Promise.all(
      names.filter((n) => n.endsWith(".json")).map(async (n) => JSON.parse(await fs.readFile(path.join(dir, n), "utf8")) as Lead)
    );
    return leads.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, limit);
  } catch {
    return [];
  }
}
