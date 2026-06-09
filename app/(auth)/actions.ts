"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { magicLinkSchema, signupSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

/** Construit l'URL absolue de callback à partir de l'origine de la requête. */
async function getCallbackUrl(next: string): Promise<string> {
  const hdrs = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    hdrs.get("origin") ??
    `https://${hdrs.get("host")}`;
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

/**
 * Connexion par lien magique.
 * Envoie un e-mail contenant un lien qui authentifie l'utilisateur.
 */
export async function signInWithMagicLink(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "E-mail invalide" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: await getCallbackUrl("/dashboard"),
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { success: false, error: "Envoi impossible. Vérifiez l'adresse et réessayez." };
  }
  return { success: true, message: "Lien de connexion envoyé. Consultez votre boîte mail." };
}

/**
 * Inscription par lien magique : crée le compte avec les métadonnées
 * (nom, entreprise) puis redirige vers l'onboarding après confirmation.
 */
export async function signUpWithMagicLink(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    nom: formData.get("nom"),
    entreprise: formData.get("entreprise"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      // Ces métadonnées alimentent le profil via le trigger handle_new_user.
      data: { nom: parsed.data.nom, entreprise: parsed.data.entreprise },
      emailRedirectTo: await getCallbackUrl("/onboarding"),
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { success: false, error: "Inscription impossible. Réessayez dans un instant." };
  }
  return {
    success: true,
    message: "Compte créé ! Cliquez sur le lien reçu par e-mail pour vous connecter.",
  };
}

/** Déconnexion : invalide la session puis redirige vers l'accueil. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
