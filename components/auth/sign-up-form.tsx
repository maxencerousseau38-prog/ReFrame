"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/validations";
import { signUpWithMagicLink } from "@/app/(auth)/actions";
import { MagicLinkSuccess } from "./magic-link-success";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  const searchParams = useSearchParams();
  const siteUrl = searchParams.get("site");
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  // Mémorise l'URL saisie sur la home pour pré-remplir l'onboarding après connexion.
  React.useEffect(() => {
    if (siteUrl) {
      try {
        window.localStorage.setItem("vitrio:site-origine", siteUrl);
      } catch {
        /* stockage indisponible : ignoré */
      }
    }
  }, [siteUrl]);

  const onSubmit = async (values: SignupInput) => {
    const fd = new FormData();
    fd.set("email", values.email);
    fd.set("nom", values.nom);
    fd.set("entreprise", values.entreprise);
    const result = await signUpWithMagicLink(null, fd);
    if (result.success) {
      setSentTo(values.email);
    } else {
      toast.error(result.error);
    }
  };

  if (sentTo) return <MagicLinkSuccess email={sentTo} />;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Créer mon site</h1>
      <p className="mt-2 text-muted-foreground">
        Quelques infos et on vous envoie un lien pour démarrer. Sans mot de passe.
      </p>
      {siteUrl && (
        <p className="mt-4 rounded-lg border border-brand/20 bg-brand/5 px-3 py-2 text-sm text-foreground">
          On analysera <span className="font-medium">{siteUrl}</span> après votre connexion.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="nom">Votre nom</Label>
          <Input id="nom" placeholder="Jean Dupont" {...register("nom")} aria-invalid={!!errors.nom} />
          {errors.nom && <p className="text-sm text-destructive">{errors.nom.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="entreprise">Nom de votre établissement</Label>
          <Input
            id="entreprise"
            placeholder="Le Bistrot Lumière"
            {...register("entreprise")}
            aria-invalid={!!errors.entreprise}
          />
          {errors.entreprise && (
            <p className="text-sm text-destructive">{errors.entreprise.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="vous@entreprise.fr"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <Sparkles className="size-4" />
          {isSubmitting ? "Création…" : "Créer mon compte"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        En continuant, vous acceptez nos{" "}
        <Link href="/cgu" className="underline hover:text-foreground">
          CGU
        </Link>{" "}
        et notre{" "}
        <Link href="/confidentialite" className="underline hover:text-foreground">
          politique de confidentialité
        </Link>
        .
      </p>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-medium text-brand hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
