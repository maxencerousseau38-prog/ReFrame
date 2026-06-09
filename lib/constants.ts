/**
 * Constantes globales de l'application.
 * Le nom de marque est centralisé ici : changez-le une fois pour le propager partout.
 */

export const SITE = {
  name: "Vitrio",
  // Slogan principal repris dans le hero et les metadata.
  tagline: "Ton site refait, hébergé et toujours à jour.",
  description:
    "Vitrio refait le site web de ta PME locale, l'héberge sur une infrastructure rapide et sécurisée, et te laisse le modifier en quelques clics. Pour quelques euros par mois.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://vitrio.fr",
  locale: "fr_FR",
  email: "bonjour@vitrio.fr",
  phone: "+33 4 00 00 00 00",
  address: "12 rue des Artisans, 38000 Grenoble, France",
  company: "Vitrio SAS",
  siret: "000 000 000 00000",
} as const;

/** Navigation principale du site marketing. */
export const MARKETING_NAV = [
  { label: "Fonctionnalités", href: "/fonctionnalites" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Exemples", href: "/exemples" },
  { label: "Blog", href: "/blog" },
  { label: "À propos", href: "/a-propos" },
] as const;

/** Liens du pied de page, regroupés par colonne. */
export const FOOTER_NAV = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "/fonctionnalites" },
      { label: "Tarifs", href: "/tarifs" },
      { label: "Exemples", href: "/exemples" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Contact", href: "/contact" },
      { label: "Connexion", href: "/connexion" },
      { label: "Créer un compte", href: "/inscription" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Confidentialité", href: "/confidentialite" },
      { label: "CGV", href: "/cgv" },
      { label: "CGU", href: "/cgu" },
    ],
  },
] as const;

/** Navigation de l'espace client (dashboard). */
export const DASHBOARD_NAV = [
  { label: "Vue d'ensemble", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Mon site", href: "/dashboard/site", icon: "Globe" },
  { label: "Éditeur", href: "/dashboard/editeur", icon: "PenLine" },
  { label: "Messages", href: "/dashboard/messages", icon: "Inbox" },
  { label: "Facturation", href: "/dashboard/facturation", icon: "CreditCard" },
  { label: "Paramètres", href: "/dashboard/parametres", icon: "Settings" },
] as const;

/** Navigation du back-office admin. */
export const ADMIN_NAV = [
  { label: "Tableau de bord", href: "/admin", icon: "Gauge" },
  { label: "Clients", href: "/admin/clients", icon: "Users" },
  { label: "Demandes de contact", href: "/admin/contacts", icon: "MailQuestion" },
] as const;
