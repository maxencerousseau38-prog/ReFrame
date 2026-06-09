import { Reveal } from "./reveal";

interface PageHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

/** Bandeau d'en-tête réutilisé en haut des pages internes. */
export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-72 aurora opacity-50" />
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
        <Reveal>
          {eyebrow && (
            <span className="mb-3 inline-block rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              {eyebrow}
            </span>
          )}
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}
