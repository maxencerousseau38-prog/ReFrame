/** Données mock du site marketing : étapes, bénéfices, témoignages, FAQ, exemples. */

export interface Feature {
  icon: string; // nom d'icône lucide
  title: string;
  description: string;
}

/** Les 3 grandes étapes du fonctionnement. */
export const STEPS: { number: string; title: string; description: string }[] = [
  {
    number: "01",
    title: "Vous nous donnez votre adresse",
    description:
      "Indiquez l'URL de votre site actuel (ou partez de zéro). On analyse votre activité et vos contenus existants.",
  },
  {
    number: "02",
    title: "On génère une version moderne",
    description:
      "Vous découvrez un avant/après de votre site, repensé pour le mobile, rapide et clair. Vous validez ou ajustez.",
  },
  {
    number: "03",
    title: "On héberge et on maintient",
    description:
      "Votre nouveau site vit sur notre infrastructure : en ligne, sécurisé, sauvegardé et modifiable en quelques clics.",
  },
];

/** Bénéfices clés mis en avant sur la home et la page fonctionnalités. */
export const FEATURES: Feature[] = [
  {
    icon: "Sparkles",
    title: "Design moderne, fait pour vous",
    description:
      "Un site soigné qui reflète votre métier, pensé mobile-first, sans jargon ni template générique.",
  },
  {
    icon: "Gauge",
    title: "Rapide partout",
    description:
      "Hébergement sur un réseau mondial : vos pages s'affichent en un instant, même en 4G.",
  },
  {
    icon: "ShieldCheck",
    title: "Sécurisé et sauvegardé",
    description:
      "Certificat SSL inclus, sauvegardes quotidiennes et surveillance continue. Vous dormez tranquille.",
  },
  {
    icon: "PenLine",
    title: "Modifiable en autonomie",
    description:
      "Horaires, coordonnées, photos, promos : changez vos infos en quelques clics, sans connaissance technique.",
  },
  {
    icon: "Inbox",
    title: "Messages centralisés",
    description:
      "Chaque message reçu via votre site arrive dans votre espace. Vous ne ratez plus une demande.",
  },
  {
    icon: "RefreshCw",
    title: "Toujours à jour",
    description:
      "On s'occupe des mises à jour techniques et de la maintenance. Votre site reste impeccable dans le temps.",
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "En une semaine, mon restaurant avait enfin un site dont je suis fière. Et je change mon menu toute seule en deux minutes.",
    name: "Léa Martin",
    role: "Le Bistrot Lumière, Grenoble",
    initials: "LM",
  },
  {
    quote:
      "Je n'y connais rien en informatique. Là, je n'ai rien eu à gérer : ils ont tout fait et le site tourne tout seul.",
    name: "Karim Benali",
    role: "Garage Central, Grenoble",
    initials: "KB",
  },
  {
    quote:
      "Le rapport qualité-prix est imbattable. Pour le prix d'un déjeuner par mois, mon site reste en ligne et à jour.",
    name: "Sophie Durand",
    role: "Horizon Immobilier",
    initials: "SD",
  },
  {
    quote:
      "L'avant/après m'a convaincue en deux secondes. La nouvelle version est tellement plus pro.",
    name: "Nadia Bouaziz",
    role: "Fleurs Nadia",
    initials: "NB",
  },
  {
    quote:
      "Les messages de mes clients arrivent directement dans mon espace. Fini les formulaires perdus.",
    name: "Olivier Mercier",
    role: "Plomberie Mercier",
    initials: "OM",
  },
  {
    quote:
      "Simple, rapide, efficace. Exactement ce qu'il faut pour un artisan qui n'a pas de temps à perdre.",
    name: "Camille Roy",
    role: "Institut Éclat",
    initials: "CR",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: FaqItem[] = [
  {
    question: "Que se passe-t-il si j'arrête mon abonnement ?",
    answer:
      "Votre abonnement paie l'hébergement de votre site sur notre infrastructure. Si vous l'arrêtez, votre site est mis hors ligne (mais vos contenus sont conservés un temps si vous souhaitez réactiver).",
  },
  {
    question: "Dois-je avoir des connaissances techniques ?",
    answer:
      "Aucune. Nous nous occupons de la création, de l'hébergement et de la maintenance. Vous modifiez vos informations clés depuis un éditeur simple, sans code.",
  },
  {
    question: "Puis-je garder mon nom de domaine actuel ?",
    answer:
      "Oui. Nous connectons votre nom de domaine existant à votre nouveau site. Si vous n'en avez pas, nous pouvons vous en fournir un.",
  },
  {
    question: "Combien de temps pour avoir mon nouveau site ?",
    answer:
      "Comptez généralement quelques jours pour une première version, selon l'offre de refonte choisie et la rapidité de vos retours.",
  },
  {
    question: "La refonte et l'abonnement, c'est bien deux choses ?",
    answer:
      "Exactement. La refonte est un paiement unique pour créer votre nouveau site. L'abonnement mensuel paie ensuite l'hébergement, la sécurité, les sauvegardes et l'accès à l'éditeur.",
  },
  {
    question: "Promettez-vous plus de clients ou de trafic ?",
    answer:
      "Non, et nous tenons à être honnêtes : Vitrio est une plateforme (site + hébergement + outils), pas une agence marketing. Nous vous donnons un site moderne et fiable ; les résultats dépendent de votre activité.",
  },
];

export interface Example {
  slug: string;
  business: string;
  category: string;
  city: string;
  beforeLabel: string;
  afterLabel: string;
  /** Couleur d'accent pour l'aperçu maquette. */
  accent: string;
}

export const EXAMPLES: Example[] = [
  {
    slug: "bistrot-lumiere",
    business: "Le Bistrot Lumière",
    category: "Restaurant",
    city: "Grenoble",
    beforeLabel: "Site de 2014, illisible sur mobile",
    afterLabel: "Menu à jour, réservation, photos",
    accent: "#b4541f",
  },
  {
    slug: "garage-central",
    business: "Garage Central",
    category: "Garage automobile",
    city: "Grenoble",
    beforeLabel: "Page unique sans coordonnées claires",
    afterLabel: "Services, horaires, devis en ligne",
    accent: "#1f4fb4",
  },
  {
    slug: "horizon-immo",
    business: "Horizon Immobilier",
    category: "Agence immobilière",
    city: "Grenoble",
    beforeLabel: "Annonces non responsive",
    afterLabel: "Vitrine moderne, contact rapide",
    accent: "#1f9d72",
  },
  {
    slug: "fleurs-nadia",
    business: "Fleurs Nadia",
    category: "Fleuriste",
    city: "Lyon",
    beforeLabel: "Aucun site, juste une page Facebook",
    afterLabel: "Boutique vitrine élégante",
    accent: "#c0398b",
  },
  {
    slug: "plomberie-mercier",
    business: "Plomberie Mercier",
    category: "Artisan plombier",
    city: "Chambéry",
    beforeLabel: "Site lent et daté",
    afterLabel: "Urgences, zone d'intervention, avis",
    accent: "#2b6fb0",
  },
  {
    slug: "institut-eclat",
    business: "Institut Éclat",
    category: "Institut de beauté",
    city: "Annecy",
    beforeLabel: "Pas de présence en ligne",
    afterLabel: "Prestations, tarifs, prise de RDV",
    accent: "#7c4dff",
  },
];
