"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { magicLinkSchema, type MagicLinkInput } from "@/lib/validations";
import { signInWithMagicLink } from "@/app/(auth)/actions";
import { MagicLinkSuccess } from "./magic-link-success";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MagicLinkInput>({ resolver: zodResolver(magicLinkSchema) });

  const onSubmit = async (values: MagicLinkInput) => {
    const fd = new FormData();
    fd.set("email", values.email);
    const result = await signInWithMagicLink(null, fd);
    if (result.success) {
      setSentTo(values.email);
    } else {
      toast.error(result.error);
    }
  };

  if (sentTo) return <MagicLinkSuccess email={sentTo} />;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
      <p className="mt-2 text-muted-foreground">
        Entrez votre e-mail, on vous envoie un lien de connexion sécurisé.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
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
          {isSubmitting ? "Envoi…" : "Recevoir mon lien de connexion"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-medium text-brand hover:underline">
          Créer mon site
        </Link>
      </p>
    </div>
  );
}
