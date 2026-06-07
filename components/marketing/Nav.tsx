import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function MarketingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl border border-white/[0.07] bg-ink-900/60 px-4 py-2.5 backdrop-blur-xl">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-mist-300 md:flex">
          <a href="#produit" className="transition-colors hover:text-white">Produit</a>
          <a href="#analyse" className="transition-colors hover:text-white">Analyse</a>
          <Link href="/pricing" className="transition-colors hover:text-white">Tarifs</Link>
          <a href="#confiance" className="transition-colors hover:text-white">Confiance</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden rounded-xl px-3.5 py-2 text-sm font-medium text-mist-200 transition-colors hover:text-white sm:block"
          >
            Connexion
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03] active:scale-95"
          >
            Démarrer
          </Link>
        </div>
      </div>
    </header>
  );
}
