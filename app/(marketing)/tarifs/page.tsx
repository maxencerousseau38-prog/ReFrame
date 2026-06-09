import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Une refonte initiale (paiement unique) puis un abonnement mensuel qui paie l'hébergement de votre site. Sans engagement.",
};

export default function TarifsPage() {
  return (
    <>
      <PageHero
        eyebrow="Tarifs"
        title="Simple et transparent"
        description="Une refonte unique pour créer votre site, puis un abonnement mensuel qui paie l'hébergement, la sécurité et les mises à jour. Sans engagement."
      />
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Pricing />
        </div>
      </section>
      <Faq />
    </>
  );
}
