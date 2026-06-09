import type { Metadata } from "next";
import Link from "next/link";
import { PenLine, Globe, Inbox, CreditCard, ArrowRight, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getUserSite, getUserSubscription, getUnreadMessageCount } from "@/lib/queries";
import { SITE_STATUS_META, SUBSCRIPTION_STATUS_META } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { AnalysisFlow } from "@/components/dashboard/analysis-flow";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const { user, profile } = await requireUser();
  const site = await getUserSite(user.id);
  const subscription = await getUserSubscription(user.id);
  const unread = site ? await getUnreadMessageCount(site.id) : 0;

  const prenom = (profile?.nom ?? user.user_metadata?.nom)?.split(" ")[0];
  const siteStatus = site ? SITE_STATUS_META[site.statut] : null;
  const subMeta = subscription ? SUBSCRIPTION_STATUS_META[subscription.statut] : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 lg:p-10">
      <PageHeader
        title={prenom ? `Bonjour ${prenom} 👋` : "Bonjour 👋"}
        description="Voici l'état de votre site et de votre abonnement."
      >
        {site && (
          <Button asChild>
            <Link href="/dashboard/editeur">
              <PenLine className="size-4" /> Modifier mon site
            </Link>
          </Button>
        )}
      </PageHeader>

      {/* Aucun site : invite à l'onboarding */}
      {!site && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
            <Plus className="size-6" />
          </div>
          <h2 className="text-lg font-semibold">Aucun site pour le moment</h2>
          <p className="mt-1 text-muted-foreground">
            Démarrez en quelques secondes : indiquez l'adresse de votre site actuel.
          </p>
          <Button asChild className="mt-6">
            <Link href="/onboarding">Démarrer mon site</Link>
          </Button>
        </div>
      )}

      {/* Site en analyse : flux avant/après */}
      {site && site.statut === "analyse" && <AnalysisFlow siteId={site.id} />}

      {/* Statistiques */}
      {site && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="Globe"
              label="Statut du site"
              value={
                siteStatus ? (
                  <StatusBadge label={siteStatus.label} tone={siteStatus.tone} />
                ) : (
                  "—"
                )
              }
              hint={site.nom_domaine ?? "Domaine non configuré"}
              href="/dashboard/site"
            />
            <StatCard
              icon="CreditCard"
              label="Abonnement"
              value={
                subMeta ? <StatusBadge label={subMeta.label} tone={subMeta.tone} /> : "Aucun"
              }
              hint={subscription?.plan ? `Offre ${subscription.plan}` : "À activer"}
              href="/dashboard/facturation"
            />
            <StatCard
              icon="Inbox"
              label="Messages non lus"
              value={unread}
              hint={unread > 0 ? "À consulter" : "Tout est lu"}
              href="/dashboard/messages"
            />
            <StatCard
              icon="PenLine"
              label="Éditeur"
              value="Mettre à jour"
              hint="Horaires, photos, promos…"
              href="/dashboard/editeur"
            />
          </div>

          {/* Actions rapides */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold">Actions rapides</h3>
              <div className="mt-4 grid gap-2">
                {[
                  { href: "/dashboard/editeur", icon: PenLine, label: "Modifier mes informations" },
                  { href: "/dashboard/site", icon: Globe, label: "Gérer mon site et mon domaine" },
                  { href: "/dashboard/messages", icon: Inbox, label: "Consulter mes messages" },
                  { href: "/dashboard/facturation", icon: CreditCard, label: "Voir ma facturation" },
                ].map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm transition-colors hover:border-border hover:bg-accent/40"
                  >
                    <a.icon className="size-4 text-brand" />
                    <span className="flex-1">{a.label}</span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-gradient-to-br from-brand/5 to-transparent p-6">
              <h3 className="font-semibold">Besoin d'un coup de main ?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Notre équipe répond à vos questions sous 24 h ouvrées. Pour les offres Premium,
                nous modifions votre site à votre place.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/contact">Contacter le support</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
