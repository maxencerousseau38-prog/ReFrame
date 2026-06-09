import { STEPS } from "@/lib/marketing-data";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

export function HowItWorks() {
  return (
    <section id="fonctionnement" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Comment ça marche"
          title="Votre site moderne en 3 étapes"
          description="Vous n'avez rien de technique à gérer. On s'occupe de tout, vous gardez la main sur vos contenus."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-lg">
                <div className="absolute -right-4 -top-6 text-[7rem] font-bold leading-none text-muted/40 transition-colors group-hover:text-brand-muted">
                  {step.number}
                </div>
                <div className="relative">
                  <div className="mb-4 inline-flex size-10 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
