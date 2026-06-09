import { TESTIMONIALS } from "@/lib/marketing-data";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Ils nous font confiance"
          title="Des commerçants qui ont repris la main sur leur site"
        />

        <div className="mt-16 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.08} className="break-inside-avoid">
              <figure className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <blockquote className="text-pretty text-[15px] leading-relaxed text-foreground/90">
                  « {t.quote} »
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand to-chart-2 text-xs font-semibold text-white">
                    {t.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
