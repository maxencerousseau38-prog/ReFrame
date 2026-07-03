/**
 * V2 Chantier 3 — localized labels for ENGINE-GENERATED text.
 *
 * These strings only appear when the source site did not provide a real
 * heading for a section (the real heading always wins — content-model.ts).
 * The English values are exactly the strings the composer used to hardcode,
 * so English sites keep byte-identical output.
 */

export type LabelKey =
  | "features"
  | "services"
  | "testimonials"
  | "contact"
  | "faq"
  | "portfolio"
  | "about"
  | "ourStory"
  | "learnMore";

const LABELS: Record<string, Record<LabelKey, string>> = {
  en: {
    features: "What we offer",
    services: "Our services",
    testimonials: "What our clients say",
    contact: "Get in touch",
    faq: "Frequently asked questions",
    portfolio: "Our work",
    about: "About",
    ourStory: "Our Story",
    learnMore: "Learn more",
  },
  fr: {
    features: "Ce que nous proposons",
    services: "Nos services",
    testimonials: "Ce que disent nos clients",
    contact: "Contactez-nous",
    faq: "Questions fréquentes",
    portfolio: "Nos réalisations",
    about: "À propos",
    ourStory: "Notre histoire",
    learnMore: "En savoir plus",
  },
  es: {
    features: "Lo que ofrecemos",
    services: "Nuestros servicios",
    testimonials: "Lo que dicen nuestros clientes",
    contact: "Contáctanos",
    faq: "Preguntas frecuentes",
    portfolio: "Nuestro trabajo",
    about: "Sobre nosotros",
    ourStory: "Nuestra historia",
    learnMore: "Saber más",
  },
  de: {
    features: "Was wir bieten",
    services: "Unsere Leistungen",
    testimonials: "Was unsere Kunden sagen",
    contact: "Kontakt",
    faq: "Häufige Fragen",
    portfolio: "Unsere Arbeiten",
    about: "Über uns",
    ourStory: "Unsere Geschichte",
    learnMore: "Mehr erfahren",
  },
  it: {
    features: "Cosa offriamo",
    services: "I nostri servizi",
    testimonials: "Cosa dicono i nostri clienti",
    contact: "Contattaci",
    faq: "Domande frequenti",
    portfolio: "I nostri lavori",
    about: "Chi siamo",
    ourStory: "La nostra storia",
    learnMore: "Scopri di più",
  },
};

/** Localized generated label; unknown/absent language falls back to English. */
export function label(key: LabelKey, lang?: string): string {
  return (LABELS[lang ?? "en"] ?? LABELS.en)[key];
}
