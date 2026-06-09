import { createAdminClient } from "@/lib/supabase/server";
import type { Profile, Site, Subscription, SiteMessage } from "@/types";

export interface AdminClient {
  userId: string;
  nom: string | null;
  entreprise: string | null;
  email: string | null;
  role: Profile["role"];
  createdAt: string;
  site: Site | null;
  subscription: Subscription | null;
}

export interface AdminStats {
  totalClients: number;
  activeSubscriptions: number;
  sitesOnline: number;
  /** MRR simulé à partir des abonnements actifs. */
  mrr: number;
  /** Taux de churn simulé (démo). */
  churnRate: number;
  newContacts: number;
}

/**
 * Construit la liste agrégée des clients (profil + site + abonnement + email).
 * Utilise le client service role : à n'appeler qu'après requireAdmin().
 */
export async function getAdminClients(): Promise<AdminClient[]> {
  const admin = await createAdminClient();

  const [{ data: profiles }, { data: sites }, { data: subs }, usersRes] = await Promise.all([
    admin.from("profiles").select("*").order("created_at", { ascending: false }),
    admin.from("sites").select("*"),
    admin.from("subscriptions").select("*"),
    admin.auth.admin.listUsers(),
  ]);

  const emailByUser = new Map<string, string | undefined>(
    usersRes.data?.users.map((u) => [u.id, u.email]) ?? [],
  );
  const siteByUser = new Map<string, Site>();
  (sites as Site[] | null)?.forEach((s) => {
    if (!siteByUser.has(s.owner_id)) siteByUser.set(s.owner_id, s);
  });
  const subByUser = new Map<string, Subscription>();
  (subs as Subscription[] | null)?.forEach((s) => {
    if (!subByUser.has(s.user_id)) subByUser.set(s.user_id, s);
  });

  return (
    (profiles as Profile[] | null)?.map((p) => ({
      userId: p.user_id,
      nom: p.nom,
      entreprise: p.entreprise,
      email: emailByUser.get(p.user_id) ?? null,
      role: p.role,
      createdAt: p.created_at,
      site: siteByUser.get(p.user_id) ?? null,
      subscription: subByUser.get(p.user_id) ?? null,
    })) ?? []
  );
}

/** Statistiques globales pour le tableau de bord admin (MRR/churn simulés). */
export async function getAdminStats(): Promise<AdminStats> {
  const clients = await getAdminClients();
  const admin = await createAdminClient();
  const { count: newContacts } = await admin
    .from("contact_requests")
    .select("id", { count: "exact", head: true })
    .eq("traite", false);

  const realClients = clients.filter((c) => c.role !== "admin");
  const activeSubscriptions = realClients.filter((c) => c.subscription?.statut === "active").length;
  const sitesOnline = realClients.filter((c) => c.site?.statut === "en_ligne").length;

  // MRR simulé : 99 € moyen par abonnement actif.
  const mrr = activeSubscriptions * 99;

  return {
    totalClients: realClients.length,
    activeSubscriptions,
    sitesOnline,
    mrr,
    churnRate: 2.4,
    newContacts: newContacts ?? 0,
  };
}

/** Détail complet d'un client (par user_id), pour la fiche admin. */
export async function getAdminClientDetail(userId: string): Promise<{
  client: AdminClient | null;
  messages: SiteMessage[];
}> {
  const clients = await getAdminClients();
  const client = clients.find((c) => c.userId === userId) ?? null;

  let messages: SiteMessage[] = [];
  if (client?.site) {
    const admin = await createAdminClient();
    const { data } = await admin
      .from("site_messages")
      .select("*")
      .eq("site_id", client.site.id)
      .order("recu_le", { ascending: false });
    messages = (data ?? []) as SiteMessage[];
  }

  return { client, messages };
}
