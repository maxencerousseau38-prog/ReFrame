import { FEATURES } from "@/lib/marketing-data";
import { Icon } from "@/components/shared/icon";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

export function FeaturesGrid() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Ce qui est inclus"
          title="Tout ce qu'il faut, rien de superflu"
          description="Une plateforme complète qui garde votre site en ligne, rapide et facile à mettre à jour."
        />

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 3) * 0.08} className="bg-card">
              <div className="h-full p-8 transition-colors hover:bg-accent/40">
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon name={feature.icon} className="size-5" />
                </div>
                <h3 className="text-base font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
