import crypto from "crypto";
import { cookies } from "next/headers";
import { getUserById, type User } from "./users-store";

/**
 * Minimal, dependency-free session auth.
 *
 * A session is a stateless, HMAC-signed cookie: `<userId>.<expiry>.<sig>`.
 * `sig` is HMAC-SHA256(`<userId>.<expiry>`) with AUTH_SECRET, compared in
 * constant time. No server-side session table needed. Cookie is httpOnly +
 * sameSite=lax, and Secure in production.
 *
 * Set AUTH_SECRET in the environment for production. The dev fallback keeps
 * local sessions working but is not secret.
 */

const COOKIE = "rf_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const DEV_SECRET = "reframe-dev-secret-change-me-in-production";
const SECRET = process.env.AUTH_SECRET || DEV_SECRET;

/**
 * Whether a real, non-default AUTH_SECRET is configured. Surfaced on the health
 * endpoint so a misconfigured deploy is obvious.
 */
export function authSecretSecure(): boolean {
  return SECRET !== DEV_SECRET;
}

function sign(payload: string): string {
  // Fail closed: never sign/verify sessions with the dev default in production,
  // otherwise cookies would be trivially forgeable. This throws on mint (login
  // surfaces a loud 500) and is caught on verify (treated as no session).
  if (process.env.NODE_ENV === "production" && !authSecretSecure()) {
    throw new Error(
      "AUTH_SECRET is unset or the dev default in production. Set a strong AUTH_SECRET before serving sessions."
    );
  }
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

function makeToken(userId: string): string {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  let expected: string;
  try {
    expected = sign(`${userId}.${exp}`);
  } catch {
    return null; // misconfigured secret in prod — no valid sessions
  }
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Number(exp) < Date.now()) return null;
  return userId;
}

/** Write the session cookie. Call from a Route Handler or Server Action. */
export function startSession(userId: string): void {
  cookies().set(COOKIE, makeToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** Clear the session cookie. */
export function endSession(): void {
  cookies().set(COOKIE, "", { path: "/", maxAge: 0 });
}

/** Resolve the signed-in user, or null. Safe in Server Components and routes. */
export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const userId = verifyToken(token);
  if (!userId) return null;
  return getUserById(userId);
}
