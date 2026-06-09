"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En production, brancher ici un service de monitoring (Sentry…).
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-svh place-items-center px-6">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium text-muted-foreground">Erreur inattendue</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Quelque chose s'est mal passé
        </h1>
        <p className="mt-3 text-muted-foreground">
          Désolé, une erreur est survenue. Vous pouvez réessayer ou revenir à l'accueil.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RefreshCw className="size-4" />
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="size-4" />
              Accueil
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
