import crypto from "crypto";

/**
 * Purpose-scoped, expiring, HMAC-signed tokens for email verification and
 * password reset. Stateless (no DB row): the signature covers the purpose,
 * subject and expiry, so a verify token can never be replayed as a reset token
 * and vice-versa. Signed with AUTH_SECRET, same as sessions.
 */

const SECRET = process.env.AUTH_SECRET || "reframe-dev-secret-change-me-in-production";

export type TokenPurpose = "verify-email" | "reset-password";

function hmac(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function signToken(purpose: TokenPurpose, subject: string, ttlMs: number): string {
  const exp = Date.now() + ttlMs;
  const payload = `${purpose}.${subject}.${exp}`;
  return `${payload}.${hmac(payload)}`;
}

/** Returns the subject (e.g. userId) when valid for `purpose`, else null. */
export function verifyToken(purpose: TokenPurpose, token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [p, subject, exp, sig] = parts;
  if (p !== purpose) return null;
  const expected = hmac(`${p}.${subject}.${exp}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Number(exp) < Date.now()) return null;
  return subject;
}
