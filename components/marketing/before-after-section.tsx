import { BeforeAfter } from "./before-after";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

export function BeforeAfterSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Avant / Après"
          title="La même adresse, une toute autre impression"
          description="Voici à quoi ressemble une refonte Vitrio. Glissez pour comparer."
        />
        <Reveal className="mt-14" delay={0.1}>
          <BeforeAfter />
        </Reveal>
      </div>
    </section>
  );
}
