import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { Plan } from "./plans";
import { isComped } from "./plans";

/**
 * Server-side user store for ReFrame accounts.
 *
 * Same env-driven adapter idea as the sites store: Vercel KV / Upstash Redis
 * when its credentials are present, the filesystem otherwise. A user's id is
 * the SHA-256 of their normalized email, so both "find by email" (login) and
 * "get by id" (session resolve) are O(1) reads of the same key, with no
 * separate index. Passwords are scrypt-hashed with a per-user salt.
 *
 * This is a deliberately small, dependency-free foundation. It is the seam
 * where a managed auth provider (Auth.js/NextAuth, Clerk, WorkOS) drops in
 * later: swap these functions, callers stay the same.
 */

export interface User {
  id: string;
  email: string;
  /** `salt:derivedKey`, both hex. */
  passwordHash: string;
  createdAt: string;
  /** Subscription tier. Absent means free. Set by billing. */
  plan?: Plan;
  /** Stripe customer id, when billing is wired. */
  stripeCustomerId?: string;
  /** Whether the email address has been confirmed. */
  emailVerified?: boolean;
}

/** Public shape safe to expose to the client (never includes the hash). */
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

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const kvOn = Boolean(KV_URL && KV_TOKEN);

const DATA_DIR = process.env.REFRAME_DATA_DIR
  ? path.resolve(process.env.REFRAME_DATA_DIR, "../users")
  : path.join(process.cwd(), ".data", "users");

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function userId(email: string): string {
  return crypto.createHash("sha256").update(normalizeEmail(email)).digest("hex");
}

export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && email.length <= 254;
}

/* --- password hashing (scrypt) --------------------------------------------- */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;
  const key = Buffer.from(keyHex, "hex");
  const test = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  return key.length === test.length && crypto.timingSafeEqual(key, test);
}

/* --- backend (KV or filesystem) -------------------------------------------- */

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
  if (kvOn) {
    await kv(["SET", `user:${user.id}`, JSON.stringify(user)]);
    return;
  }
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(fileFor(user.id), JSON.stringify(user), "utf8");
  } catch (err) {
    // Serverless hosts (Vercel) have a read-only filesystem, so the on-disk
    // fallback can't persist anything: accounts need a KV database. Surface a
    // specific, actionable code instead of a generic write error.
    if (process.env.VERCEL) throw new Error("storage_unconfigured");
    throw err;
  }
}

/* --- public API ------------------------------------------------------------ */

export async function getUserById(id: string): Promise<User | null> {
  return readUser(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return readUser(userId(email));
}

/**
 * Create a new account. Throws "exists" if the email is already registered,
 * "invalid_email" / "weak_password" on bad input.
 */
export async function createUser(email: string, password: string): Promise<User> {
  if (!isValidEmail(email)) throw new Error("invalid_email");
  if (!password || password.length < 8) throw new Error("weak_password");

  const id = userId(email);
  if (await readUser(id)) throw new Error("exists");

  const user: User = {
    id,
    email: normalizeEmail(email),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  await writeUser(user);
  return user;
}

/** Mark a user's email as verified. */
export async function setEmailVerified(id: string): Promise<User | null> {
  const user = await readUser(id);
  if (!user) return null;
  user.emailVerified = true;
  await writeUser(user);
  return user;
}

/** Replace a user's password (used by reset). */
export async function updateUserPassword(id: string, password: string): Promise<boolean> {
  if (!password || password.length < 8) throw new Error("weak_password");
  const user = await readUser(id);
  if (!user) return false;
  user.passwordHash = hashPassword(password);
  await writeUser(user);
  return true;
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
