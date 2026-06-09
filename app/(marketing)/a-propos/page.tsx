import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ShieldCheck, Handshake, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Vitrio aide les commerces et indépendants locaux à avoir un site moderne, hébergé et toujours à jour.",
};

const VALUES = [
  {
    icon: Heart,
    title: "Au service du local",
    description:
      "On travaille pour les artisans, restaurateurs et commerçants — pas pour des grands comptes. Leur réussite est notre métier.",
  },
  {
    icon: ShieldCheck,
    title: "Fiables et honnêtes",
    description:
      "On ne promet pas de miracles marketing. On promet un site qui marche, hébergé sérieusement, à un prix juste.",
  },
  {
    icon: Handshake,
    title: "Simples par principe",
    description:
      "Pas de jargon, pas d'usine à gaz. Un produit clair que l'on peut utiliser même sans être à l'aise avec l'informatique.",
  },
];

const STATS = [
  { value: "3 jours", label: "pour une première version" },
  { value: "100%", label: "des sites hébergés chez nous" },
  { value: "0", label: "ligne de code à écrire pour vous" },
  { value: "24 h", label: "de délai de réponse moyen" },
];

export default function AProposPage() {
  return (
    <>
      <PageHero
        eyebrow="À propos"
        title="On rend le web accessible aux commerces locaux"
        description="Vitrio est né d'un constat simple : avoir un bon site ne devrait pas être réservé aux grandes entreprises."
      />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-6 px-4 text-lg leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
          <Reveal>
            <p>
              Trop de commerçants vivent avec un site daté, lent, impossible à modifier — ou
              n'en ont tout simplement pas. Pendant ce temps, leurs clients cherchent sur leur
              téléphone et tombent sur une page cassée, ou rien du tout.
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <p>
              Nous avons créé Vitrio pour changer ça. On modernise votre site, on l'héberge sur
              une infrastructure rapide et sécurisée, et on vous laisse le modifier vous-même en
              quelques clics. Le tout pour quelques euros par mois.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-foreground">
              Notre conviction : un site, c'est comme une vitrine. Il doit être propre, à jour et
              accueillant. En permanence. C'est exactement ce dont on s'occupe.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/20 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-gradient-brand sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Nos valeurs" title="Ce qui nous guide" />
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-card p-8">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <v.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{v.title}</h3>
                  <p className="mt-2 text-muted-foreground">{v.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg">
              <Link href="/inscription">
                Rejoindre Vitrio <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
