import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { ContactForm } from "@/components/marketing/contact-form";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur la refonte ou l'hébergement de votre site ? Écrivez-nous.",
};

export default function ContactPage() {
  const coords = [
    { icon: Mail, label: "E-mail", value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: Phone, label: "Téléphone", value: SITE.phone, href: `tel:${SITE.phone}` },
    { icon: MapPin, label: "Adresse", value: SITE.address },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Parlons de votre projet"
        description="Décrivez-nous votre activité : on vous dit comment Vitrio peut moderniser et héberger votre site."
      />
      <section className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Nous joindre</h2>
            <p className="mt-3 text-muted-foreground">
              Réponse sous 24 h ouvrées. Pas de robot : un humain lit chaque message.
            </p>
            <ul className="mt-8 space-y-5">
              {coords.map((c) => (
                <li key={c.label} className="flex items-start gap-4">
                  <span className="mt-0.5 inline-flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <c.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm text-muted-foreground">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="font-medium hover:text-brand">
                        {c.value}
                      </a>
                    ) : (
                      <p className="font-medium">{c.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
