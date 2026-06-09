"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Globe } from "lucide-react";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations";
import { createInitialSite } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({ resolver: zodResolver(onboardingSchema) });

  // Pré-remplit l'URL mémorisée lors de l'inscription (depuis la home).
  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem("vitrio:site-origine");
      if (stored) {
        setValue("url_origine", stored);
        window.localStorage.removeItem("vitrio:site-origine");
      }
    } catch {
      /* stockage indisponible : ignoré */
    }
  }, [setValue]);

  const onSubmit = async (values: OnboardingInput) => {
    const fd = new FormData();
    fd.set("url_origine", values.url_origine ?? "");
    fd.set("nom_domaine", values.nom_domaine ?? "");
    // En cas de succès, l'action redirige (pas de retour). On gère l'erreur éventuelle.
    const result = await createInitialSite(null, fd);
    if (result && !result.success) toast.error(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="url_origine">URL de votre site actuel</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="url_origine"
            className="pl-9"
            placeholder="votresite.fr"
            {...register("url_origine")}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Vous n'avez pas encore de site ? Laissez ce champ vide, on part de zéro.
        </p>
        {errors.url_origine && (
          <p className="text-sm text-destructive">{errors.url_origine.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nom_domaine">Nom de domaine souhaité (optionnel)</Label>
        <Input id="nom_domaine" placeholder="mon-commerce.fr" {...register("nom_domaine")} />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Création de votre espace…" : "Lancer mon avant/après"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
