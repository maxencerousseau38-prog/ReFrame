import Link from "next/link";
import { ArrowLeft, Quote } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Panneau gauche — marque (masqué sur mobile) */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand via-chart-2 to-brand p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-white/10 blur-3xl" />
        <Logo className="relative text-white [&_span:last-child]:text-white" />
        <div className="relative mt-auto max-w-md">
          <Quote className="size-8 text-white/50" />
          <blockquote className="mt-4 text-2xl font-medium leading-snug">
            En une semaine, mon restaurant avait enfin un site dont je suis fière. Et je change
            mon menu toute seule en deux minutes.
          </blockquote>
          <p className="mt-6 text-sm text-white/80">Léa Martin — Le Bistrot Lumière, Grenoble</p>
        </div>
      </aside>

      {/* Panneau droit — formulaire */}
      <main className="relative flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Retour au site
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center p-6 pb-16">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
