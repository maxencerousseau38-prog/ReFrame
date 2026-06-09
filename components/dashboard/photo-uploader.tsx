"use client";

import * as React from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveSitePhotos } from "@/app/(dashboard)/actions";
import { Button } from "@/components/ui/button";

const BUCKET = "site-assets";

/**
 * Téléversement de photos vers Supabase Storage.
 * Les fichiers sont rangés dans un dossier portant l'uid de l'utilisateur
 * (cf. policies RLS du bucket), puis la liste d'URL est persistée en base.
 */
export function PhotoUploader({
  siteId,
  userId,
  initialPhotos,
}: {
  siteId: string;
  userId: string;
  initialPhotos: string[];
}) {
  const [photos, setPhotos] = React.useState<string[]>(initialPhotos);
  const [uploading, setUploading] = React.useState(false);
  const supabase = React.useMemo(() => createClient(), []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const next = [...photos];

    for (const file of Array.from(files).slice(0, 12 - photos.length)) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${siteId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        toast.error(`Échec de l'envoi de ${file.name}`);
        continue;
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      next.push(data.publicUrl);
    }

    setPhotos(next);
    const result = await saveSitePhotos(siteId, next);
    setUploading(false);
    if (result.success) toast.success("Photos mises à jour.");
    else toast.error(result.error ?? "Erreur d'enregistrement.");
  };

  const removePhoto = async (url: string) => {
    const next = photos.filter((p) => p !== url);
    setPhotos(next);
    await saveSitePhotos(siteId, next);
    toast.success("Photo retirée.");
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {photos.map((url) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Photo du site" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(url)}
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Retirer la photo"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {photos.length < 12 && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand">
            {uploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ImagePlus className="size-5" />
            )}
            <span className="text-[10px]">Ajouter</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        JPG ou PNG, jusqu'à 12 photos. Elles sont stockées sur notre infrastructure sécurisée.
      </p>
      {photos.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-1 -ml-2 text-muted-foreground"
          onClick={() => {
            setPhotos([]);
            void saveSitePhotos(siteId, []);
          }}
        >
          Tout retirer
        </Button>
      )}
    </div>
  );
}
