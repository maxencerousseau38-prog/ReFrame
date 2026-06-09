"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { siteContentSchema, type SiteContentInput } from "@/lib/validations";
import { saveSiteContent } from "@/app/(dashboard)/actions";
import { SitePreview } from "./site-preview";
import { PhotoUploader } from "./photo-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteContent } from "@/types";

const FIELDS: {
  name: keyof SiteContentInput;
  label: string;
  placeholder: string;
  type?: "text" | "textarea";
}[] = [
  { name: "entreprise", label: "Nom de l'établissement", placeholder: "Le Bistrot Lumière" },
  { name: "slogan", label: "Accroche", placeholder: "Cuisine de marché, ambiance chaleureuse" },
  { name: "telephone", label: "Téléphone", placeholder: "04 76 00 11 22" },
  { name: "email", label: "E-mail de contact", placeholder: "contact@exemple.fr" },
  { name: "adresse", label: "Adresse", placeholder: "5 place Victor Hugo, 38000 Grenoble" },
  { name: "horaires", label: "Horaires", placeholder: "Mar–Sam : 12h–14h / 19h–22h" },
  { name: "promo", label: "Promotion en cours", placeholder: "Menu déjeuner à 18€ en semaine" },
  { name: "apropos", label: "À propos", placeholder: "Présentez votre établissement…", type: "textarea" },
];

export function EditorForm({
  siteId,
  userId,
  initialContent,
}: {
  siteId: string;
  userId: string;
  initialContent: SiteContent;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SiteContentInput>({
    resolver: zodResolver(siteContentSchema),
    defaultValues: {
      entreprise: initialContent.entreprise ?? "",
      slogan: initialContent.slogan ?? "",
      telephone: initialContent.telephone ?? "",
      email: initialContent.email ?? "",
      adresse: initialContent.adresse ?? "",
      horaires: initialContent.horaires ?? "",
      promo: initialContent.promo ?? "",
      apropos: initialContent.apropos ?? "",
      couleur: initialContent.couleur ?? "#6d4dff",
    },
  });

  const watched = watch();
  // Aperçu en direct : valeurs saisies + champs non gérés par le formulaire (photos).
  const previewContent: SiteContent = {
    ...initialContent,
    ...watched,
  };

  const onSubmit = async (values: SiteContentInput) => {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.set(k, v ?? ""));
    const result = await saveSiteContent(siteId, null, fd);
    if (result.success) toast.success(result.message ?? "Enregistré.");
    else toast.error(result.error);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Informations clés</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div
                key={field.name}
                className={`space-y-2 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}
              >
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    rows={4}
                    placeholder={field.placeholder}
                    {...register(field.name)}
                  />
                ) : (
                  <Input
                    id={field.name}
                    placeholder={field.placeholder}
                    {...register(field.name)}
                    aria-invalid={!!errors[field.name]}
                  />
                )}
                {errors[field.name] && (
                  <p className="text-sm text-destructive">{errors[field.name]?.message}</p>
                )}
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="couleur">Couleur principale</Label>
              <div className="flex items-center gap-3">
                <input
                  id="couleur"
                  type="color"
                  className="size-10 cursor-pointer rounded-lg border border-border bg-transparent p-1"
                  {...register("couleur")}
                />
                <span className="text-sm text-muted-foreground">{watched.couleur}</span>
              </div>
              {errors.couleur && (
                <p className="text-sm text-destructive">{errors.couleur.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Photos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajoutez des photos de votre établissement, vos plats ou vos réalisations.
          </p>
          <div className="mt-4">
            <PhotoUploader
              siteId={siteId}
              userId={userId}
              initialPhotos={initialContent.photos ?? []}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            <Save className="size-4" />
            {isSubmitting ? "Enregistrement…" : "Enregistrer les modifications"}
          </Button>
          {isDirty && (
            <span className="text-sm text-muted-foreground">Modifications non enregistrées</span>
          )}
        </div>
      </form>

      {/* Aperçu en direct (sticky) */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Aperçu en direct</h2>
        <SitePreview content={previewContent} />
      </div>
    </div>
  );
}
