import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";
import { BeforeAfter } from "@/components/marketing/before-after";
import { Reveal } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EXAMPLES } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: "Exemples",
  description: "Découvrez des sites de commerces locaux refaits et hébergés par Vitrio.",
};

export default function ExemplesPage() {
  return (
    <>
      <PageHero
        eyebrow="Exemples"
        title="Des refontes qui changent tout"
        description="Quelques commerces locaux qui ont modernisé leur présence en ligne avec Vitrio. Les exemples ci-dessous sont illustratifs."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <BeforeAfter />
          </Reveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLES.map((ex, i) => (
              <Reveal key={ex.slug} delay={(i % 3) * 0.08}>
                <article className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
                  {/* Aperçu maquette stylisé avec la couleur d'accent du commerce */}
                  <div
                    className="relative aspect-[16/10] overflow-hidden p-5"
                    style={{
                      background: `linear-gradient(135deg, ${ex.accent}22, ${ex.accent}05)`,
                    }}
                  >
                    <div className="flex h-full flex-col rounded-xl bg-card/90 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
                      <div
                        className="h-2 w-1/3 rounded-full"
                        style={{ backgroundColor: ex.accent }}
                      />
                      <div className="mt-3 h-2 w-2/3 rounded-full bg-foreground/10" />
                      <div className="mt-auto flex gap-2">
                        <div className="h-8 flex-1 rounded-lg bg-foreground/5" />
                        <div className="h-8 flex-1 rounded-lg bg-foreground/5" />
                      </div>
                    </div>
                    <Badge className="absolute right-4 top-4 bg-background/90 text-foreground hover:bg-background">
                      {ex.category}
                    </Badge>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold tracking-tight">{ex.business}</h3>
                    <p className="text-sm text-muted-foreground">{ex.city}</p>
                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex gap-2">
                        <dt className="shrink-0 font-medium text-destructive/80">Avant</dt>
                        <dd className="text-muted-foreground">{ex.beforeLabel}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="shrink-0 font-medium text-brand">Après</dt>
                        <dd className="text-muted-foreground">{ex.afterLabel}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg">
              <Link href="/inscription">
                Obtenir mon avant/après <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
