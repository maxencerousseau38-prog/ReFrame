import type { Metadata } from "next";
import { KeyRound, Mail } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { DeleteAccount } from "@/components/dashboard/delete-account";

export const metadata: Metadata = { title: "Paramètres" };

export default async function ParametresPage() {
  const { user, profile } = await requireUser();

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 lg:p-10">
      <PageHeader title="Paramètres" description="Gérez votre profil et votre compte." />

      {/* Profil */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Profil</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ces informations vous identifient.</p>
        <div className="mt-5">
          <ProfileForm
            initial={{
              nom: profile?.nom ?? user.user_metadata?.nom ?? "",
              entreprise: profile?.entreprise ?? "",
            }}
          />
        </div>
      </section>

      {/* Connexion */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Connexion</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Adresse e-mail :</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <KeyRound className="mt-0.5 size-4 text-brand" />
            <p className="text-muted-foreground">
              Votre compte fonctionne <span className="font-medium text-foreground">sans mot de
              passe</span>. Vous recevez un lien de connexion sécurisé par e-mail à chaque
              connexion. Rien à mémoriser, rien à perdre.
            </p>
          </div>
        </div>
      </section>

      {/* Zone de danger */}
      <section className="rounded-2xl border border-destructive/30 bg-destructive/[0.03] p-6">
        <h2 className="font-semibold text-destructive">Zone de danger</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          La suppression de votre compte est définitive et entraîne la mise hors ligne de votre
          site.
        </p>
        <div className="mt-4">
          <DeleteAccount />
        </div>
      </section>
    </div>
  );
}
