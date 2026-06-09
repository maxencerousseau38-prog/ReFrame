import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Globe, ExternalLink, PenLine, Link2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getUserSite } from "@/lib/queries";
import { SITE_STATUS_META, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { SitePreview } from "@/components/dashboard/site-preview";
import { SiteStatusActions } from "@/components/dashboard/site-status-actions";
import { Button } from "@/components/ui/button";
import type { SiteContent } from "@/types";

export const metadata: Metadata = { title: "Mon site" };

export default async function SitePage() {
  const { user } = await requireUser();
  const site = await getUserSite(user.id);
  if (!site) redirect("/onboarding");

  const status = SITE_STATUS_META[site.statut];
  const content = (site.contenu ?? {}) as SiteContent;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 lg:p-10">
      <PageHeader title="Mon site" description="Gérez votre site, son statut et son domaine.">
        <Button asChild variant="outline">
          <Link href="/dashboard/editeur">
            <PenLine className="size-4" /> Éditer
          </Link>
        </Button>
        <SiteStatusActions siteId={site.id} statut={site.statut} />
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* Aperçu */}
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Aperçu</h2>
          <SitePreview content={content} />
        </div>

        {/* Infos techniques */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Statut</span>
              <StatusBadge label={status.label} tone={status.tone} />
            </div>
            {site.statut === "analyse" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Lancez l'analyse depuis le tableau de bord pour générer votre site.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Globe className="size-4 text-brand" /> Nom de domaine
            </p>
            {site.nom_domaine ? (
              <a
                href={`https://${site.nom_domaine}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
              >
                {site.nom_domaine} <ExternalLink className="size-3.5" />
              </a>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Aucun domaine connecté.</p>
            )}
            <Button asChild variant="ghost" size="sm" className="mt-3 -ml-2 text-muted-foreground">
              <Link href="/contact">
                <Link2 className="size-4" /> Connecter un domaine
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 text-sm">
            {site.url_origine && (
              <div className="mb-3">
                <p className="text-muted-foreground">Site d'origine</p>
                <p className="mt-0.5 truncate">{site.url_origine}</p>
              </div>
            )}
            <div className="mb-3">
              <p className="text-muted-foreground">Créé le</p>
              <p className="mt-0.5">{formatDate(site.created_at)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dernière mise à jour</p>
              <p className="mt-0.5">{formatDate(site.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
