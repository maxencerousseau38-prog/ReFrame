import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { BeforeAfterSection } from "@/components/marketing/before-after-section";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Fonctionnalités",
  description:
    "Hébergement rapide et sécurisé, éditeur simple, messages centralisés, sauvegardes : tout ce qu'inclut Vitrio.",
};

const DETAILS = [
  {
    title: "Un éditeur pensé pour les non-techniciens",
    description:
      "Modifiez vos horaires, coordonnées, photos, textes et promotions sans toucher une ligne de code. Les changements sont publiés en un clic.",
    points: ["Aucune compétence technique requise", "Aperçu avant publication", "Photos via votre espace"],
  },
  {
    title: "Une infrastructure qui tient la route",
    description:
      "Votre site est hébergé sur un réseau mondial, avec certificat SSL, sauvegardes quotidiennes et surveillance continue.",
    points: ["Certificat SSL inclus", "Sauvegardes automatiques", "Disponibilité surveillée"],
  },
  {
    title: "Tous vos messages au même endroit",
    description:
      "Chaque demande envoyée depuis votre site arrive dans votre boîte de réception Vitrio. Vous ne ratez plus aucun contact.",
    points: ["Notifications par e-mail", "Marquage lu / non lu", "Historique conservé"],
  },
];

export default function FonctionnalitesPage() {
  return (
    <>
      <PageHero
        eyebrow="Fonctionnalités"
        title="Une plateforme, pas juste un site"
        description="Vitrio réunit la création, l'hébergement et les outils du quotidien dans un seul abonnement clair."
      >
        <Button asChild size="lg">
          <Link href="/inscription">
            Créer mon site <ArrowRight className="size-4" />
          </Link>
        </Button>
      </PageHero>

      <FeaturesGrid />

      <section className="pb-8">
        <div className="mx-auto max-w-7xl space-y-24 px-4 sm:px-6 lg:px-8">
          {DETAILS.map((d, i) => (
            <Reveal key={d.title}>
              <div
                className={`grid items-center gap-10 lg:grid-cols-2 ${
                  i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">{d.title}</h3>
                  <p className="mt-3 text-muted-foreground">{d.description}</p>
                  <ul className="mt-6 space-y-3">
                    {d.points.map((p) => (
                      <li key={p} className="flex items-center gap-2.5 text-sm">
                        <Check className="size-4 text-brand" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-brand-muted/40 p-6">
                  <div className="flex h-full flex-col gap-3">
                    <div className="h-3 w-1/3 rounded-full bg-foreground/10" />
                    <div className="flex-1 rounded-xl bg-card shadow-sm ring-1 ring-black/5" />
                    <div className="flex gap-3">
                      <div className="h-16 flex-1 rounded-xl bg-card shadow-sm ring-1 ring-black/5" />
                      <div className="h-16 flex-1 rounded-xl bg-card shadow-sm ring-1 ring-black/5" />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <BeforeAfterSection />

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <SectionHeading
            title="Une question sur une fonctionnalité ?"
            description="On vous montre tout en quelques minutes."
          />
          <Button asChild className="mt-8" size="lg" variant="outline">
            <Link href="/contact">Nous contacter</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
