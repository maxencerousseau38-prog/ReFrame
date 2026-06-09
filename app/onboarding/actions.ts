"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validations";
import { normalizeUrl } from "@/lib/utils";
import type { ActionResult } from "@/types";

/**
 * Crée le site initial du client à partir de l'URL de son site existant.
 * Le site est créé au statut « analyse » : l'éditeur du dashboard proposera
 * ensuite la génération avant/après (mock).
 */
export async function createInitialSite(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Session expirée. Reconnectez-vous." };

  const parsed = onboardingSchema.safeParse({
    url_origine: formData.get("url_origine"),
    nom_domaine: formData.get("nom_domaine"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  // Récupère le nom de l'établissement pour pré-remplir le contenu.
  const { data: profile } = await supabase
    .from("profiles")
    .select("entreprise")
    .eq("user_id", user.id)
    .single();

  const urlOrigine = parsed.data.url_origine ? normalizeUrl(parsed.data.url_origine) : null;

  const { error } = await supabase.from("sites").insert({
    owner_id: user.id,
    url_origine: urlOrigine,
    nom_domaine: parsed.data.nom_domaine || null,
    statut: "analyse",
    contenu: { entreprise: profile?.entreprise ?? undefined },
  });

  if (error) {
    return { success: false, error: "Création du site impossible. Réessayez." };
  }

  redirect("/dashboard");
}
