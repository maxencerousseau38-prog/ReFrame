import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export const metadata: Metadata = {
  title: "Bienvenue",
  robots: { index: false },
};

const PERKS = [
  "Analyse de votre site existant",
  "Génération d'un avant/après",
  "Mise en ligne sur notre infra",
];

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  // Si l'utilisateur a déjà un site, on l'envoie directement au dashboard.
  const { count } = await supabase
    .from("sites")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);
  if (count && count > 0) redirect("/dashboard");

  const prenom = user.user_metadata?.nom?.split(" ")[0];

  return (
    <div className="relative min-h-svh">
      <div className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-72 aurora opacity-50" />
      <header className="flex items-center justify-between p-6">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex max-w-lg flex-col px-6 py-10">
        <span className="text-sm font-medium text-brand">
          {prenom ? `Bienvenue ${prenom} !` : "Bienvenue !"}
        </span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Dernière étape avant votre nouveau site
        </h1>
        <p className="mt-3 text-muted-foreground">
          Indiquez l'adresse de votre site actuel. On l'analyse et on vous prépare une version
          moderne.
        </p>

        <ul className="mt-6 space-y-2">
          {PERKS.map((p) => (
            <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-brand" />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <OnboardingForm />
        </div>
      </main>
    </div>
  );
}
