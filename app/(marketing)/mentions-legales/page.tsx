import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      updatedAt="2026-06-01"
      sections={[
        {
          heading: "Éditeur du site",
          body: [
            `Le présent site est édité par ${SITE.company}, au capital social de 1 000 €, immatriculée au RCS sous le numéro SIRET ${SITE.siret}.`,
            `Siège social : ${SITE.address}.`,
            `Adresse e-mail : ${SITE.email} — Téléphone : ${SITE.phone}.`,
          ],
        },
        {
          heading: "Directeur de la publication",
          body: ["Le directeur de la publication est le représentant légal de la société."],
        },
        {
          heading: "Hébergement",
          body: [
            "Le site et les sites de nos clients sont hébergés sur une infrastructure cloud sécurisée (fournisseur d'hébergement à préciser en production).",
          ],
        },
        {
          heading: "Propriété intellectuelle",
          body: [
            "L'ensemble des éléments du site (textes, visuels, logo, code) est protégé par le droit de la propriété intellectuelle. Toute reproduction non autorisée est interdite.",
          ],
        },
        {
          heading: "Contact",
          body: [`Pour toute question : ${SITE.email}.`],
        },
      ]}
    />
  );
}
