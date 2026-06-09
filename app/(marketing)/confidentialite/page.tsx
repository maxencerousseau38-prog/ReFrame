import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  robots: { index: false },
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updatedAt="2026-06-01"
      intro="Nous attachons une grande importance à la protection de vos données personnelles, dans le respect du Règlement Général sur la Protection des Données (RGPD)."
      sections={[
        {
          heading: "Données collectées",
          body: [
            "Nous collectons les données que vous nous fournissez : nom, adresse e-mail, nom de votre entreprise, ainsi que les contenus de votre site (textes, photos, coordonnées).",
            "Nous collectons également les messages envoyés via les formulaires de contact (le nôtre et ceux des sites que nous hébergeons).",
          ],
        },
        {
          heading: "Finalités du traitement",
          body: [
            "Vos données sont utilisées pour créer et héberger votre site, gérer votre compte et votre abonnement, vous contacter et assurer le support.",
          ],
        },
        {
          heading: "Base légale",
          body: [
            "Les traitements reposent sur l'exécution du contrat qui nous lie, votre consentement, et le respect de nos obligations légales.",
          ],
        },
        {
          heading: "Durée de conservation",
          body: [
            "Vos données sont conservées pendant la durée de la relation contractuelle, puis archivées conformément aux délais légaux.",
          ],
        },
        {
          heading: "Vos droits",
          body: [
            "Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition sur vos données.",
            `Pour exercer vos droits, écrivez-nous à ${SITE.email}.`,
          ],
        },
        {
          heading: "Cookies",
          body: [
            "Le site utilise des cookies strictement nécessaires à son fonctionnement (authentification, préférences). Aucun cookie publicitaire n'est déposé sans votre consentement.",
          ],
        },
        {
          heading: "Sous-traitants",
          body: [
            "Nous faisons appel à des prestataires (hébergement, paiement, e-mails) qui présentent des garanties conformes au RGPD.",
          ],
        },
      ]}
    />
  );
}
