import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  robots: { index: false },
};

export default function CgvPage() {
  return (
    <LegalPage
      title="Conditions générales de vente"
      updatedAt="2026-06-01"
      intro="Les présentes CGV régissent les ventes de prestations de refonte et d'abonnements d'hébergement proposées par Vitrio."
      sections={[
        {
          heading: "Objet",
          body: [
            "Vitrio propose deux prestations complémentaires : une refonte initiale de site (paiement unique) et un abonnement mensuel d'hébergement et de maintenance.",
          ],
        },
        {
          heading: "Prix et paiement",
          body: [
            "Les prix sont indiqués en euros toutes taxes comprises. La refonte fait l'objet d'un paiement unique ; l'hébergement d'un abonnement récurrent prélevé mensuellement ou annuellement.",
            "Les paiements sont opérés via notre prestataire de paiement sécurisé.",
          ],
        },
        {
          heading: "Abonnement et hébergement",
          body: [
            "L'abonnement paie l'hébergement du site sur notre infrastructure, son maintien en ligne, sa sécurité et son accès à l'éditeur.",
            "En cas de résiliation ou de non-paiement, le site est mis hors ligne. Les contenus peuvent être conservés temporairement en vue d'une réactivation.",
          ],
        },
        {
          heading: "Durée et résiliation",
          body: [
            "L'abonnement est sans engagement : il peut être résilié à tout moment et prend fin à l'échéance de la période en cours.",
          ],
        },
        {
          heading: "Droit de rétractation",
          body: [
            "Conformément au Code de la consommation, le client professionnel agissant dans le cadre de son activité ne bénéficie pas, en principe, du droit de rétractation de 14 jours.",
          ],
        },
        {
          heading: "Responsabilité",
          body: [
            "Vitrio fournit une plateforme d'hébergement et de création de site. Nous ne garantissons aucun résultat commercial, de trafic ou de référencement.",
          ],
        },
      ]}
    />
  );
}
