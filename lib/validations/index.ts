import { z } from "zod";

/** Formulaire de contact du site marketing. */
export const contactSchema = z.object({
  nom: z.string().min(2, "Indiquez votre nom").max(100),
  email: z.string().email("Adresse e-mail invalide"),
  message: z.string().min(10, "Votre message est un peu court").max(2000),
});
export type ContactInput = z.infer<typeof contactSchema>;

/** Connexion / inscription par magic link. */
export const magicLinkSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
});
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;

export const signupSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  nom: z.string().min(2, "Indiquez votre nom").max(100),
  entreprise: z.string().min(2, "Indiquez le nom de votre établissement").max(120),
});
export type SignupInput = z.infer<typeof signupSchema>;

/** Onboarding : URL du site existant (optionnelle). */
export const onboardingSchema = z.object({
  url_origine: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal("")),
  nom_domaine: z.string().trim().max(120).optional().or(z.literal("")),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;

/** Éditeur de contenu du site (champs clés). */
export const siteContentSchema = z.object({
  entreprise: z.string().max(120).optional().or(z.literal("")),
  slogan: z.string().max(160).optional().or(z.literal("")),
  telephone: z.string().max(40).optional().or(z.literal("")),
  email: z.string().email("E-mail invalide").optional().or(z.literal("")),
  adresse: z.string().max(200).optional().or(z.literal("")),
  horaires: z.string().max(300).optional().or(z.literal("")),
  promo: z.string().max(200).optional().or(z.literal("")),
  apropos: z.string().max(2000).optional().or(z.literal("")),
  couleur: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "Couleur invalide")
    .optional()
    .or(z.literal("")),
});
export type SiteContentInput = z.infer<typeof siteContentSchema>;

/** Paramètres du profil. */
export const profileSchema = z.object({
  nom: z.string().min(2, "Indiquez votre nom").max(100),
  entreprise: z.string().max(120).optional().or(z.literal("")),
});
export type ProfileInput = z.infer<typeof profileSchema>;
