"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateRedesign, type RedesignAnalysis } from "@/lib/ai/generate-redesign";
import { siteContentSchema, profileSchema } from "@/lib/validations";
import type { ActionResult, SiteContent, SiteStatus } from "@/types";

/** Vérifie que le site appartient bien à l'utilisateur courant. */
async function assertOwnership(siteId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Session expirée." };

  const { data: site } = await supabase
    .from("sites")
    .select("id, owner_id, contenu")
    .eq("id", siteId)
    .maybeSingle();
  if (!site || site.owner_id !== user.id) {
    return { ok: false as const, error: "Site introuvable." };
  }
  return { ok: true as const, supabase, user, site };
}

/**
 * Lance l'analyse + génération avant/après (MOCK via stub IA).
 * Met à jour le contenu du site et passe son statut en « brouillon ».
 */
export async function runRedesignAnalysis(
  siteId: string,
): Promise<ActionResult & { analysis?: RedesignAnalysis }> {
  const ctx = await assertOwnership(siteId);
  if (!ctx.ok) return { success: false, error: ctx.error };

  const { data: fullSite } = await ctx.supabase
    .from("sites")
    .select("url_origine, contenu")
    .eq("id", siteId)
    .single();

  const currentContent = (fullSite?.contenu ?? {}) as SiteContent;
  const analysis = await generateRedesign(fullSite?.url_origine, currentContent.entreprise);

  // Fusionne le contenu généré avec l'existant (sans écraser ce que le client a saisi).
  const merged: SiteContent = { ...analysis.generatedContent, ...currentContent };

  const { error } = await ctx.supabase
    .from("sites")
    .update({ contenu: merged, statut: "brouillon" })
    .eq("id", siteId);

  if (error) return { success: false, error: "Échec de l'analyse. Réessayez." };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/site");
  return { success: true, analysis };
}

/** Change le statut d'un site (mise en ligne, mise hors ligne…). */
export async function updateSiteStatus(
  siteId: string,
  statut: SiteStatus,
): Promise<ActionResult> {
  const ctx = await assertOwnership(siteId);
  if (!ctx.ok) return { success: false, error: ctx.error };

  const { error } = await ctx.supabase.from("sites").update({ statut }).eq("id", siteId);
  if (error) return { success: false, error: "Mise à jour impossible." };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/site");
  return { success: true, message: "Statut mis à jour." };
}

/** Enregistre le contenu édité du site (infos clés). */
export async function saveSiteContent(
  siteId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await assertOwnership(siteId);
  if (!ctx.ok) return { success: false, error: ctx.error };

  const parsed = siteContentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const existing = (ctx.site.contenu ?? {}) as SiteContent;
  // Conserve les champs non gérés par le formulaire (photos, couleur…).
  const merged: SiteContent = { ...existing, ...parsed.data };

  const { error } = await ctx.supabase
    .from("sites")
    .update({ contenu: merged })
    .eq("id", siteId);
  if (error) return { success: false, error: "Enregistrement impossible." };

  revalidatePath("/dashboard/editeur");
  revalidatePath("/dashboard/site");
  return { success: true, message: "Modifications enregistrées." };
}

/** Met à jour la liste des photos du site (après upload côté client vers Storage). */
export async function saveSitePhotos(siteId: string, photos: string[]): Promise<ActionResult> {
  const ctx = await assertOwnership(siteId);
  if (!ctx.ok) return { success: false, error: ctx.error };

  const existing = (ctx.site.contenu ?? {}) as SiteContent;
  const merged: SiteContent = { ...existing, photos: photos.slice(0, 12) };

  const { error } = await ctx.supabase
    .from("sites")
    .update({ contenu: merged })
    .eq("id", siteId);
  if (error) return { success: false, error: "Enregistrement des photos impossible." };

  revalidatePath("/dashboard/editeur");
  revalidatePath("/dashboard/site");
  return { success: true };
}

/** Marque un message comme lu / non lu. */
export async function setMessageRead(messageId: string, lu: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("site_messages").update({ lu }).eq("id", messageId);
  if (error) return { success: false, error: "Action impossible." };
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
  return { success: true };
}

/** Met à jour le profil de l'utilisateur. */
export async function updateProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Session expirée." };

  const parsed = profileSchema.safeParse({
    nom: formData.get("nom"),
    entreprise: formData.get("entreprise"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ nom: parsed.data.nom, entreprise: parsed.data.entreprise || null })
    .eq("user_id", user.id);
  if (error) return { success: false, error: "Enregistrement impossible." };

  revalidatePath("/dashboard/parametres");
  return { success: true, message: "Profil mis à jour." };
}

/**
 * Supprime définitivement le compte de l'utilisateur courant.
 * Utilise le client service role pour supprimer l'utilisateur auth ; la
 * suppression en cascade (profiles, sites, messages…) est assurée par les
 * contraintes ON DELETE CASCADE du schéma.
 */
export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const admin = await createAdminClient();
  await admin.auth.admin.deleteUser(user.id);
  await supabase.auth.signOut();
  redirect("/");
}
