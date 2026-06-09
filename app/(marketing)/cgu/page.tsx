import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  robots: { index: false },
};

export default function CguPage() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      updatedAt="2026-06-01"
      intro="Les présentes CGU encadrent l'utilisation de la plateforme Vitrio et de l'espace client."
      sections={[
        {
          heading: "Accès au service",
          body: [
            "L'accès à l'espace client nécessite la création d'un compte. Vous êtes responsable de la confidentialité de vos accès et des actions réalisées depuis votre compte.",
          ],
        },
        {
          heading: "Utilisation conforme",
          body: [
            "Vous vous engagez à utiliser la plateforme de manière loyale et à ne pas publier de contenus illicites, trompeurs ou portant atteinte aux droits de tiers.",
          ],
        },
        {
          heading: "Contenus du client",
          body: [
            "Vous restez propriétaire des contenus que vous publiez (textes, photos). Vous nous accordez les droits nécessaires pour les héberger et les afficher sur votre site.",
          ],
        },
        {
          heading: "Disponibilité",
          body: [
            "Nous mettons tout en œuvre pour assurer une disponibilité maximale du service. Des interruptions ponctuelles peuvent survenir pour maintenance.",
          ],
        },
        {
          heading: "Suspension et suppression",
          body: [
            "En cas de manquement aux présentes CGU, nous nous réservons le droit de suspendre ou de supprimer l'accès au service.",
          ],
        },
        {
          heading: "Modification des CGU",
          body: [
            "Nous pouvons faire évoluer les présentes CGU. Vous serez informé de toute modification substantielle.",
          ],
        },
      ]}
    />
  );
}
