import { Star } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CompanyCard } from "@/components/app/CompanyCard";
import { Reveal } from "@/components/ui/Reveal";
import { COMPANIES } from "@/lib/data";

export default function FavoritesPage() {
  const favorites = COMPANIES.filter((c) => c.score >= 75);
  return (
    <AppShell title="Favoris">
      <Reveal>
        <div className="mb-6">
          <p className="eyebrow flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-gold" />
            Favoris
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Vos entreprises favorites
          </h1>
          <p className="mt-1 text-sm text-mist-400">
            Les opportunités que vous avez épinglées.
          </p>
        </div>
      </Reveal>
      <div className="space-y-2.5">
        {favorites.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.05}>
            <CompanyCard company={c} />
          </Reveal>
        ))}
      </div>
    </AppShell>
  );
}
