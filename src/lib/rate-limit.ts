/**
 * Fixed-window rate limiter. Uses Vercel KV / Upstash when configured, so the
 * window is shared across all serverless instances; otherwise falls back to an
 * in-memory window (fine for a single process / local dev). KV failures also
 * fall back to memory rather than failing the request.
 */

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const kvOn = Boolean(KV_URL && KV_TOKEN);

export type RateLimitResult = { ok: boolean; retryAfter: number };

/* ---- in-memory fallback (per-process) ----------------------------------- */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function memoryLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= max) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, retryAfter: 0 };
}

/* ---- shared KV window ---------------------------------------------------- */
async function kvCmd<T>(command: (string | number)[]): Promise<T> {
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

async function kvLimit(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
  const k = `rl:${key}`;
  // INCR is atomic; the first hit of a window arms the expiry so the window
  // slides forward exactly windowMs from the first request.
  const count = await kvCmd<number>(["INCR", k]);
  if (count === 1) await kvCmd(["PEXPIRE", k, windowMs]);
  if (count > max) {
    const pttl = await kvCmd<number>(["PTTL", k]);
    return { ok: false, retryAfter: pttl > 0 ? Math.ceil(pttl / 1000) : Math.ceil(windowMs / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

export async function rateLimit(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
  if (kvOn) {
    try {
      return await kvLimit(key, max, windowMs);
    } catch {
      // KV unreachable — degrade to the in-memory window rather than 500.
      return memoryLimit(key, max, windowMs);
    }
  }
  return memoryLimit(key, max, windowMs);
}

/** Best-effort client key from common proxy headers. */
export function clientKey(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "anon";
}
