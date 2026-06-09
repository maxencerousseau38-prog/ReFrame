import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SiteStatus, SubscriptionStatus } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formate un montant en euros (sans décimales superflues). */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/** Date longue en français : « 9 juin 2026 ». */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/** Date + heure : « 9 juin 2026 à 14:05 ». */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/** Affiche un temps relatif court : « il y a 2 h ». */
export function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  return formatDate(date);
}

/** Métadonnées d'affichage pour le statut d'un site. */
export const SITE_STATUS_META: Record<
  SiteStatus,
  { label: string; tone: "neutral" | "warn" | "success" | "danger" }
> = {
  analyse: { label: "En analyse", tone: "warn" },
  brouillon: { label: "Brouillon", tone: "neutral" },
  en_ligne: { label: "En ligne", tone: "success" },
  hors_ligne: { label: "Hors ligne", tone: "danger" },
};

/** Métadonnées d'affichage pour le statut d'un abonnement. */
export const SUBSCRIPTION_STATUS_META: Record<
  SubscriptionStatus,
  { label: string; tone: "neutral" | "warn" | "success" | "danger" }
> = {
  active: { label: "Actif", tone: "success" },
  trialing: { label: "Période d'essai", tone: "success" },
  past_due: { label: "Paiement en retard", tone: "warn" },
  canceled: { label: "Résilié", tone: "danger" },
  incomplete: { label: "Incomplet", tone: "warn" },
  inactive: { label: "Inactif", tone: "neutral" },
};

/** Normalise une URL saisie par l'utilisateur (ajoute https:// si absent). */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

/** Initiales à partir d'un nom complet, pour les avatars. */
export function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}
