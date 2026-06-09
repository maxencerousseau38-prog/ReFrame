import { Suspense } from "react";
import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Vitrio et obtenez votre site moderne, hébergé et à jour.",
  robots: { index: false },
};

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/40" />}>
      <SignUpForm />
    </Suspense>
  );
}
