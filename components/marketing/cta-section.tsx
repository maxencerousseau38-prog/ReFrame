import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute inset-0 -z-10 aurora opacity-70" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Prêt à donner à votre commerce le site qu'il mérite ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
              Découvrez gratuitement l'avant/après de votre site. Sans engagement.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="shadow-md">
                <Link href="/inscription">
                  Créer mon site
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/tarifs">Voir les tarifs</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
