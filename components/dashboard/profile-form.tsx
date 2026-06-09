"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import { updateProfile } from "@/app/(dashboard)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  initial,
}: {
  initial: { nom: string; entreprise: string };
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: initial });

  const onSubmit = async (values: ProfileInput) => {
    const fd = new FormData();
    fd.set("nom", values.nom);
    fd.set("entreprise", values.entreprise ?? "");
    const result = await updateProfile(null, fd);
    if (result.success) toast.success(result.message ?? "Enregistré.");
    else toast.error(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom</Label>
          <Input id="nom" {...register("nom")} aria-invalid={!!errors.nom} />
          {errors.nom && <p className="text-sm text-destructive">{errors.nom.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="entreprise">Établissement</Label>
          <Input id="entreprise" {...register("entreprise")} />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting || !isDirty}>
        <Save className="size-4" />
        {isSubmitting ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
