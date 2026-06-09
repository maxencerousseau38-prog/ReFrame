import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Point de retour du lien magique.
 * Échange le code (PKCE) ou le token_hash (OTP) contre une session, puis
 * redirige l'utilisateur. Si le client n'a pas encore de site, on l'envoie
 * vers l'onboarding.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  let next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();
  let authError = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = !!error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "magiclink" | "email" | "signup" | "recovery",
      token_hash: tokenHash,
    });
    authError = !!error;
  } else {
    authError = true;
  }

  if (authError) {
    return NextResponse.redirect(`${origin}/connexion?erreur=lien_invalide`);
  }

  // Redirige vers l'onboarding si l'utilisateur n'a pas encore de site.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && next === "/dashboard") {
    const { count } = await supabase
      .from("sites")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);
    if (!count) next = "/onboarding";
  }

  return NextResponse.redirect(`${origin}${next}`);
}
