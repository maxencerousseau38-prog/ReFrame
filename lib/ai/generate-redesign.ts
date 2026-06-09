/**
 * ============================================================================
 * STUB — Génération de refonte (avant/après) par IA
 * ============================================================================
 *
 * ⚠️ AUCUNE IA RÉELLE N'EST APPELÉE ICI POUR L'INSTANT.
 *
 * Cette fonction simule l'analyse d'un site existant et la génération d'une
 * version modernisée. Elle est volontairement isolée pour pouvoir être
 * remplacée plus tard par un véritable pipeline (scraping + LLM + génération
 * de template) sans toucher au reste de l'application.
 *
 * TODO (production) :
 *   1. Récupérer le HTML/contenu du site d'origine (scraping respectueux).
 *   2. Extraire les informations clés (nom, coordonnées, horaires, offres…).
 *   3. Appeler un modèle pour proposer textes/structure améliorés.
 *   4. Générer un rendu « après » et le stocker (storage + table sites.contenu).
 *
 * En attendant, on renvoie des données plausibles déduites de l'URL et du
 * nom d'entreprise, après un délai simulé.
 * ============================================================================
 */

import type { SiteContent } from "@/types/database";

export interface RedesignAnalysis {
  /** Score « avant » simulé (qualité du site existant, sur 100). */
  scoreBefore: number;
  /** Score « après » simulé. */
  scoreAfter: number;
  /** Points faibles détectés (simulés). */
  issues: string[];
  /** Améliorations apportées (simulées). */
  improvements: string[];
  /** Contenu pré-rempli pour le nouveau site. */
  generatedContent: SiteContent;
}

/** Petit utilitaire de délai pour simuler un traitement asynchrone. */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simule l'analyse + la génération d'une refonte.
 * @param url URL du site d'origine (peut être vide).
 * @param entreprise Nom de l'établissement, utilisé pour pré-remplir le contenu.
 */
export async function generateRedesign(
  url: string | null | undefined,
  entreprise?: string | null,
): Promise<RedesignAnalysis> {
  // Simule le temps d'un traitement réel.
  await delay(1500);

  const nom = entreprise?.trim() || "Votre établissement";

  return {
    scoreBefore: 34,
    scoreAfter: 92,
    issues: [
      "Site non adapté aux mobiles",
      "Temps de chargement trop long",
      "Coordonnées difficiles à trouver",
      "Aucune sécurisation (HTTPS) détectée",
      "Design daté qui inspire peu confiance",
    ],
    improvements: [
      "Mise en page responsive, pensée mobile d'abord",
      "Chargement quasi instantané via notre CDN",
      "Coordonnées et horaires mis en avant",
      "Certificat SSL et sauvegardes inclus",
      "Identité visuelle modernisée",
    ],
    generatedContent: {
      entreprise: nom,
      slogan: "Bienvenue — votre nouvelle vitrine en ligne",
      apropos: `${nom} bénéficie désormais d'un site moderne, rapide et facile à mettre à jour. Personnalisez ce texte depuis votre éditeur.`,
      horaires: "Lun–Ven : 9h–18h",
      couleur: "#6d4dff",
      photos: [],
    },
  };
}
