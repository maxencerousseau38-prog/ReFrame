import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/server/tokens";
import { setEmailVerified } from "@/lib/server/users-store";

export const runtime = "nodejs";

function originOf(req: Request): string {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/** GET /api/auth/verify?token=... — confirm an email and bounce to the app. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const userId = verifyToken("verify-email", token);
  const origin = originOf(req);
  if (!userId) {
    return NextResponse.redirect(`${origin}/dashboard?verified=invalid`);
  }
  await setEmailVerified(userId);
  return NextResponse.redirect(`${origin}/dashboard?verified=1`);
}
