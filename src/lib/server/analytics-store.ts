import { promises as fs } from "fs";
import path from "path";

/**
 * Lightweight pageview analytics for published sites — the "your site is
 * working" signal that makes the subscription feel alive. One total counter
 * plus per-day counters (so we can show a 7-day trend) per slug. KV when
 * configured, filesystem otherwise. No PII, no cookies.
 */

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const useKv = Boolean(KV_URL && KV_TOKEN);
const DAY_TTL = 100 * 24 * 60 * 60;

const day = (d = new Date()) => d.toISOString().slice(0, 10);

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
  ? path.join(path.resolve(process.env.REFRAME_DATA_DIR), "analytics")
  : path.join(process.cwd(), ".data", "analytics");
const fileFor = (slug: string) => path.join(FS_DIR, `${slug}.json`);

export async function trackView(slug: string): Promise<void> {
  if (!/^[a-z0-9-]{1,64}$/.test(slug)) return;
  if (useKv) {
    await kv(["INCR", `views:${slug}`]);
    const dk = `views:${slug}:${day()}`;
    const n = await kv<number>(["INCR", dk]);
    if (n === 1) await kv(["EXPIRE", dk, DAY_TTL]);
    return;
  }
  let data: { total: number; days: Record<string, number> } = { total: 0, days: {} };
  try {
    data = JSON.parse(await fs.readFile(fileFor(slug), "utf8"));
  } catch {
    /* new */
  }
  data.total += 1;
  data.days[day()] = (data.days[day()] || 0) + 1;
  await fs.mkdir(FS_DIR, { recursive: true });
  await fs.writeFile(fileFor(slug), JSON.stringify(data), "utf8");
}

export interface SiteStats {
  total: number;
  last7: number;
}

export async function getStats(slug: string): Promise<SiteStats> {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) days.push(day(new Date(Date.now() - i * 86400000)));
  if (useKv) {
    const total = Number((await kv<string | null>(["GET", `views:${slug}`])) || 0);
    const daily = await Promise.all(days.map((d) => kv<string | null>(["GET", `views:${slug}:${d}`])));
    const last7 = daily.reduce((s, v) => s + Number(v || 0), 0);
    return { total, last7 };
  }
  try {
    const data = JSON.parse(await fs.readFile(fileFor(slug), "utf8")) as { total: number; days: Record<string, number> };
    const last7 = days.reduce((s, d) => s + (data.days[d] || 0), 0);
    return { total: data.total || 0, last7 };
  } catch {
    return { total: 0, last7: 0 };
  }
}
