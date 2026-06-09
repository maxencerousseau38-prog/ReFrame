import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  robots: { index: false },
};

/**
 * Vitrio fonctionne sans mot de passe (connexion par lien magique).
 * Cette page rassure l'utilisateur et lui propose simplement de renvoyer un lien.
 */
export default function MotDePasseOubliePage() {
  return (
    <div>
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
        <KeyRound className="size-3.5" />
        Vitrio fonctionne sans mot de passe
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Pas de mot de passe à retenir : on vous envoie un lien de connexion sécurisé par e-mail à
        chaque fois. Entrez votre adresse ci-dessous.
      </p>
      <SignInForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/connexion" className="font-medium text-brand hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
