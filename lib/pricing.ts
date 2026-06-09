/**
 * Données tarifaires.
 *
 * Le modèle économique repose sur deux briques complémentaires :
 *  1. Une refonte initiale (paiement unique).
 *  2. Un abonnement mensuel qui paie l'HÉBERGEMENT (le site reste en ligne, sécurisé,
 *     sauvegardé et modifiable). Si l'abonnement s'arrête, le site est mis hors ligne.
 *
 * Les `stripePriceId` sont laissés vides volontairement : ils seront branchés en
 * Phase Stripe (voir lib/stripe/products.ts).
 */

export type BillingPeriod = "mensuel" | "annuel";

export interface HostingPlan {
  id: "essentiel" | "pro" | "premium";
  name: string;
  /** Prix mensuel affiché en facturation mensuelle. */
  monthly: number;
  /** Prix mensuel équivalent en facturation annuelle (2 mois offerts). */
  yearly: number;
  description: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
  /** À brancher en Phase Stripe. */
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

/** Refonte initiale : paiement unique. */
export interface RedesignPack {
  id: "express" | "standard" | "surmesure";
  name: string;
  price: number;
  description: string;
  features: string[];
  highlight?: boolean;
  stripePriceId?: string;
}

export const HOSTING_PLANS: HostingPlan[] = [
  {
    id: "essentiel",
    name: "Essentiel",
    monthly: 49,
    yearly: 41,
    description: "Le nécessaire pour rester en ligne, sécurisé et à jour.",
    features: [
      "Hébergement rapide (CDN mondial)",
      "Certificat SSL inclus",
      "Sauvegardes quotidiennes",
      "Éditeur de contenu simple",
      "1 nom de domaine connecté",
      "Boîte de réception des messages",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 99,
    yearly: 82,
    description: "Pour les commerces qui veulent aller plus loin.",
    highlight: true,
    badge: "Le plus choisi",
    features: [
      "Tout l'offre Essentiel",
      "Pages illimitées",
      "Galerie photos & menu/produits",
      "Module promotions & horaires",
      "Statistiques de visites",
      "Support prioritaire sous 24 h",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    monthly: 199,
    yearly: 166,
    description: "L'accompagnement complet, mains libres.",
    features: [
      "Tout l'offre Pro",
      "Modifications déléguées (2/mois)",
      "Réservation / prise de RDV",
      "Multi-établissements",
      "Nom de domaine premium offert",
      "Interlocuteur dédié",
    ],
  },
];

export const REDESIGN_PACKS: RedesignPack[] = [
  {
    id: "express",
    name: "Refonte Express",
    price: 199,
    description: "Une vitrine moderne en une page, livrée en quelques jours.",
    features: [
      "Page unique optimisée",
      "Reprise de vos contenus",
      "Design responsive mobile",
      "Mise en ligne incluse",
    ],
  },
  {
    id: "standard",
    name: "Refonte Standard",
    price: 499,
    description: "Un site complet multi-pages, prêt à convertir.",
    highlight: true,
    features: [
      "Jusqu'à 6 pages",
      "Galerie, menu ou catalogue",
      "Formulaire de contact",
      "Optimisation SEO de base",
      "2 cycles de révisions",
    ],
  },
  {
    id: "surmesure",
    name: "Refonte Sur-mesure",
    price: 999,
    description: "Un site taillé pour votre activité, sans compromis.",
    features: [
      "Pages illimitées",
      "Fonctionnalités spécifiques",
      "Identité visuelle affinée",
      "Rédaction accompagnée",
      "Révisions illimitées",
    ],
  },
];

/** Économie annuelle (en %) communiquée sur le toggle de la page tarifs. */
export const YEARLY_DISCOUNT_LABEL = "2 mois offerts";
