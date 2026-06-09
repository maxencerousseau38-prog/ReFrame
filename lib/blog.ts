/** Articles de blog (contenu mock pour la démonstration). */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: number;
  category: string;
  author: { name: string; role: string };
  /** Contenu en paragraphes simples (markdown léger). */
  content: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "pourquoi-refaire-site-pme-locale",
    title: "Pourquoi refaire le site de votre PME locale en 2026 ?",
    excerpt:
      "Un site lent, daté ou non responsive fait fuir vos clients avant même qu'ils ne vous appellent. Voici ce qui change vraiment.",
    date: "2026-05-28",
    readingTime: 5,
    category: "Conseils",
    author: { name: "Léa Martin", role: "Conseillère clientèle" },
    content: [
      "La plupart des sites de commerces locaux ont été créés il y a plus de cinq ans, souvent par un proche ou sur un outil aujourd'hui abandonné. Résultat : un affichage cassé sur mobile, des informations obsolètes et un référencement en berne.",
      "Or, plus de 70 % des recherches locales se font depuis un smartphone. Si votre site n'est pas pensé mobile-first, vous perdez des clients sans même le savoir.",
      "Refaire son site ne veut pas dire tout reprendre soi-même. Avec Vitrio, vous fournissez votre adresse actuelle, nous générons une version moderne, et vous validez. L'hébergement, la sécurité et les mises à jour sont inclus.",
      "L'essentiel : un site rapide, clair, à jour, qui inspire confiance. C'est ce qui transforme un visiteur hésitant en client qui pousse votre porte.",
    ],
  },
  {
    slug: "hebergement-securite-ce-que-comprend-abonnement",
    title: "Hébergement et sécurité : ce que comprend votre abonnement",
    excerpt:
      "SSL, sauvegardes, performances, disponibilité… On vous explique simplement ce que paie votre abonnement mensuel.",
    date: "2026-05-12",
    readingTime: 4,
    category: "Produit",
    author: { name: "Karim Benali", role: "Responsable technique" },
    content: [
      "Quand on parle d'« hébergement », beaucoup imaginent un simple espace de stockage. En réalité, c'est ce qui garde votre site en ligne, rapide et protégé, 24 h/24.",
      "Votre abonnement Vitrio inclut un certificat SSL (le cadenas de sécurité), des sauvegardes quotidiennes, un réseau de diffusion mondial pour la vitesse, et une surveillance continue.",
      "Concrètement : si quelque chose tombe en panne, nous le voyons avant vous. Et si vous voulez modifier vos horaires ou ajouter une photo, vous le faites en quelques clics depuis votre espace.",
      "C'est la différence entre « avoir un site » et « avoir un site dont on n'a plus à s'occuper ».",
    ],
  },
  {
    slug: "5-elements-site-restaurant-qui-convertit",
    title: "5 éléments indispensables sur le site d'un restaurant",
    excerpt:
      "Menu à jour, horaires visibles, réservation simple… La check-list pour un site qui donne envie de réserver.",
    date: "2026-04-30",
    readingTime: 6,
    category: "Conseils",
    author: { name: "Léa Martin", role: "Conseillère clientèle" },
    content: [
      "Un client qui cherche un restaurant veut trois informations en moins de dix secondes : êtes-vous ouvert, où êtes-vous, et qu'est-ce qu'on y mange.",
      "1. Un menu toujours à jour, lisible sur mobile. 2. Les horaires bien visibles, dès la première page. 3. Le numéro de téléphone cliquable. 4. Quelques belles photos de vos plats. 5. Un moyen simple de réserver ou de vous écrire.",
      "Ces éléments paraissent évidents, et pourtant la majorité des sites de restaurants en oublient au moins un. Avec Vitrio, ils sont intégrés par défaut et modifiables en autonomie.",
      "Le bon réflexe : mettez-vous à la place d'un client pressé, le vendredi soir, sur son téléphone. Votre site doit lui faciliter la vie.",
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
