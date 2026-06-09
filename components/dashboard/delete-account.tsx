"use client";

import { Trash2 } from "lucide-react";
import { deleteAccount } from "@/app/(dashboard)/actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteAccount() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="size-4" /> Supprimer mon compte
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer définitivement votre compte ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Votre compte, votre site, vos photos et vos messages
            seront définitivement supprimés. Votre site sera mis hors ligne.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          {/* Server Action : supprime le compte puis redirige. */}
          <form action={deleteAccount}>
            <AlertDialogAction type="submit" className="bg-destructive text-white hover:bg-destructive/90">
              Oui, supprimer
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
