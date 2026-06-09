const CATEGORIES = [
  "Restaurants",
  "Garages",
  "Artisans",
  "Agences immobilières",
  "Fleuristes",
  "Instituts de beauté",
  "Plombiers",
  "Coiffeurs",
  "Boulangeries",
  "Cabinets",
];

/** Bandeau défilant des types de commerces servis (preuve sociale légère). */
export function TrustStrip() {
  return (
    <section className="border-y border-border/60 bg-muted/20 py-8">
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Pensé pour les commerces et indépendants locaux
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
        <div
          className="flex w-max gap-10 pr-10"
          style={{ animation: "marquee 32s linear infinite" }}
        >
          {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-lg font-medium text-muted-foreground/70"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
