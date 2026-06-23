import { promises as fs } from "fs";
import path from "path";
import type { Plan } from "./plans";
import { isComped } from "./plans";
import { getSupabase, supabaseConfigured } from "./supabase";

/**
 * Server-side PROFILE store for ReFrame accounts.
 *
 * Identity (credentials, email verification, sessions) is owned by Supabase
 * Auth (auth.users). This store holds only the app-specific profile that hangs
 * off a user: their subscription plan and Stripe customer id, keyed by the
 * Supabase auth user id (a uuid). A DB trigger auto-creates the row on signup;
 * `upsertProfile` is the app-side safety net.
 *
 * Same env-driven adapter idea as the other stores: Supabase (Postgres) when
 * configured, then Vercel KV / Upstash Redis, then the filesystem.
 */

export interface User {
  id: string;
  email: string;
  /** Subscription tier. Absent means free. Set by billing. */
  plan?: Plan;
  /** Stripe customer id, when billing is wired. */
  stripeCustomerId?: string;
  /**
   * Whether the email is confirmed. Sourced from Supabase Auth at request time
   * (not persisted here); present so the dashboard can nudge unverified users.
   */
  emailVerified?: boolean;
  createdAt: string;
}

/** Public shape safe to expose to the client. */
export type PublicUser = Pick<User, "id" | "email" | "createdAt"> & {
  plan: Plan;
  emailVerified: boolean;
  /** True when the account is on the ADMIN_EMAILS allowlist (comped). */
  comped: boolean;
};

export function publicUser(u: User): PublicUser {
  return {
    id: u.id,
    email: u.email,
    createdAt: u.createdAt,
    plan: u.plan ?? "free",
    emailVerified: Boolean(u.emailVerified),
    comped: isComped(u.email),
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && email.length <= 254;
}

/* --- backend (Supabase, KV or filesystem) ---------------------------------- */

const sbOn = supabaseConfigured();

interface UserRow {
  id: string;
  email: string;
  plan: Plan | null;
  stripe_customer_id: string | null;
  created_at: string;
}

function rowToUser(r: UserRow): User {
  const u: User = { id: r.id, email: r.email, createdAt: r.created_at };
  if (r.plan) u.plan = r.plan;
  if (r.stripe_customer_id) u.stripeCustomerId = r.stripe_customer_id;
  return u;
}

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const kvOn = Boolean(KV_URL && KV_TOKEN);

const DATA_DIR = process.env.REFRAME_DATA_DIR
  ? path.resolve(process.env.REFRAME_DATA_DIR, "../users")
  : path.join(process.cwd(), ".data", "users");

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

const fileFor = (id: string) => path.join(DATA_DIR, `${id}.json`);

async function readUser(id: string): Promise<User | null> {
  if (sbOn) {
    const { data, error } = await getSupabase()
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return rowToUser(data as UserRow);
  }
  if (kvOn) {
    const raw = await kv<string | null>(["GET", `user:${id}`]);
    return raw ? (JSON.parse(raw) as User) : null;
  }
  try {
    return JSON.parse(await fs.readFile(fileFor(id), "utf8")) as User;
  } catch {
    return null;
  }
}

async function writeUser(user: User): Promise<void> {
  if (sbOn) {
    const row = {
      id: user.id,
      email: user.email,
      plan: user.plan ?? null,
      stripe_customer_id: user.stripeCustomerId ?? null,
      created_at: user.createdAt,
    };
    const { error } = await getSupabase().from("users").upsert(row, { onConflict: "id" });
    if (error) throw new Error(`supabase users write failed: ${error.message}`);
    return;
  }
  if (kvOn) {
    await kv(["SET", `user:${user.id}`, JSON.stringify(user)]);
    return;
  }
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(fileFor(user.id), JSON.stringify(user), "utf8");
  } catch (err) {
    if (process.env.VERCEL) throw new Error("storage_unconfigured");
    throw err;
  }
}

/* --- public API ------------------------------------------------------------ */

export async function getUserById(id: string): Promise<User | null> {
  return readUser(id);
}

/**
 * Ensure a profile row exists for a Supabase auth user, returning it. Idempotent
 * — safe to call on every request. The email is refreshed but plan/billing are
 * preserved across calls.
 */
export async function upsertProfile(input: { id: string; email: string }): Promise<User> {
  const existing = await readUser(input.id);
  if (existing) {
    if (input.email && existing.email !== input.email) {
      existing.email = input.email;
      await writeUser(existing);
    }
    return existing;
  }
  const user: User = {
    id: input.id,
    email: normalizeEmail(input.email),
    createdAt: new Date().toISOString(),
  };
  await writeUser(user);
  return user;
}

/** Update a user's subscription tier (and optionally their Stripe customer id). */
export async function setUserPlan(
  id: string,
  plan: Plan,
  stripeCustomerId?: string
): Promise<User | null> {
  const user = await readUser(id);
  if (!user) return null;
  user.plan = plan;
  if (stripeCustomerId) user.stripeCustomerId = stripeCustomerId;
  await writeUser(user);
  return user;
}
