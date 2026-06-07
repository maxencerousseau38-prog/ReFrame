import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-content-center bg-ink-950 px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:44px_44px] opacity-30" />
      <div className="relative">
        <Logo className="mx-auto" />
        <p className="num mt-8 text-6xl font-semibold text-white">404</p>
        <p className="mt-2 text-mist-400">Cette analyse est introuvable.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03]"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
