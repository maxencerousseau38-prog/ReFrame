"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { ActionResult, SiteStatus } from "@/types";

/** Vérifie que l'appelant est bien administrateur. */
async function assertAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  return data?.role === "admin";
}

/** (Admin) Change le statut du site d'un client. */
export async function adminUpdateSiteStatus(
  siteId: string,
  statut: SiteStatus,
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { success: false, error: "Accès refusé." };

  const admin = await createAdminClient();
  const { error } = await admin.from("sites").update({ statut }).eq("id", siteId);
  if (error) return { success: false, error: "Mise à jour impossible." };

  revalidatePath("/admin/clients");
  return { success: true, message: "Statut du site mis à jour." };
}

/** (Admin) Marque une demande de contact comme traitée / non traitée. */
export async function setContactTreated(id: string, traite: boolean): Promise<ActionResult> {
  if (!(await assertAdmin())) return { success: false, error: "Accès refusé." };

  const admin = await createAdminClient();
  const { error } = await admin.from("contact_requests").update({ traite }).eq("id", id);
  if (error) return { success: false, error: "Action impossible." };

  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
  return { success: true };
}
