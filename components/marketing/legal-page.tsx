import { formatDate } from "@/lib/utils";

export interface LegalSection {
  heading: string;
  body: string[];
}

interface LegalPageProps {
  title: string;
  updatedAt: string;
  intro?: string;
  sections: LegalSection[];
}

/** Gabarit homogène pour les pages légales (prose lisible et aérée). */
export function LegalPage({ title, updatedAt, intro, sections }: LegalPageProps) {
  return (
    <article className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="border-b border-border pb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Dernière mise à jour : {formatDate(updatedAt)}
          </p>
          {intro && <p className="mt-4 text-muted-foreground">{intro}</p>}
        </header>

        <div className="mt-10 space-y-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold tracking-tight">
                {i + 1}. {section.heading}
              </h2>
              <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
                {section.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          ⚖️ Ce document est un modèle de démonstration. Faites-le valider par un professionnel du
          droit avant toute mise en production.
        </p>
      </div>
    </article>
  );
}
