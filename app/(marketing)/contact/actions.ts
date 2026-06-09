"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

/**
 * Enregistre une demande de contact issue du site marketing.
 * Insère via le client service role car la table contact_requests n'autorise
 * aucune insertion publique en RLS (lecture réservée aux admins).
 */
export async function submitContactRequest(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse({
    nom: formData.get("nom"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.from("contact_requests").insert(parsed.data);
    if (error) throw error;
    return { success: true, message: "Message envoyé, nous vous répondrons rapidement." };
  } catch {
    return {
      success: false,
      error: "Impossible d'envoyer le message pour le moment. Réessayez plus tard.",
    };
  }
}
