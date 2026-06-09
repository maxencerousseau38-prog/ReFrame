import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

/**
 * Récupère l'utilisateur courant + son profil.
 * Redirige vers la connexion si non authentifié.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single<Profile>();

  return { supabase, user, profile };
}

/**
 * Garde-fou admin : redirige vers le dashboard si l'utilisateur n'est pas admin.
 * La sécurité réelle est assurée par la RLS ; cette vérification améliore l'UX.
 */
export async function requireAdmin() {
  const ctx = await requireUser();
  if (ctx.profile?.role !== "admin") redirect("/dashboard");
  return ctx;
}
