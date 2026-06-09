import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Rafraîchit la session Supabase à chaque requête et protège les routes privées.
 * Appelé depuis le middleware racine.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT : ne pas insérer de logique entre createServerClient et getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isProtected = isDashboard || isAdmin || isOnboarding;

  // Redirige vers la connexion si l'utilisateur n'est pas authentifié sur une route privée.
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Empêche un utilisateur connecté de revoir les pages d'authentification.
  const isAuthPage =
    pathname === "/connexion" || pathname === "/inscription" || pathname === "/mot-de-passe-oublie";
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
