import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 aurora opacity-60" />
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="text-[7rem] font-bold leading-none tracking-tighter text-gradient-brand">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Page introuvable</h1>
        <p className="mt-3 text-muted-foreground">
          La page que vous cherchez a peut-être été déplacée ou n'existe plus.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">
              <Compass className="size-4" />
              Nous contacter
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
