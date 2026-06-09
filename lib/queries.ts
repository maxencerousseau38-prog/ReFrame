import { createClient } from "@/lib/supabase/server";
import type { Site, Subscription } from "@/types";

/** Récupère le site principal de l'utilisateur (le plus récent), ou null. */
export async function getUserSite(userId: string): Promise<Site | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sites")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Site>();
  return data ?? null;
}

/** Récupère l'abonnement de l'utilisateur, ou null. */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Subscription>();
  return data ?? null;
}

/** Compte les messages non lus pour un site donné. */
export async function getUnreadMessageCount(siteId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("site_messages")
    .select("id", { count: "exact", head: true })
    .eq("site_id", siteId)
    .eq("lu", false);
  return count ?? 0;
}
