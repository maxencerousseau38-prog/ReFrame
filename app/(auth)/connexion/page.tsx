import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace Vitrio par lien magique.",
  robots: { index: false },
};

export default function ConnexionPage() {
  return <SignInForm />;
}
