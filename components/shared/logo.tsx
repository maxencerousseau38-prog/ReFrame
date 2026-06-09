import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

interface LogoProps {
  className?: string;
  href?: string;
  /** Masque le texte pour n'afficher que la marque graphique. */
  iconOnly?: boolean;
}

/** Logo de marque : un monogramme dégradé + le nom Vitrio. */
export function Logo({ className, href = "/", iconOnly = false }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5 font-semibold", className)}
      aria-label={SITE.name}
    >
      <span className="relative grid size-8 place-items-center overflow-hidden rounded-[0.6rem] bg-gradient-to-br from-brand to-chart-2 text-white shadow-sm ring-1 ring-black/5">
        <span className="text-base font-bold tracking-tight">V</span>
        <span className="absolute inset-0 bg-white/0 transition-colors group-hover:bg-white/10" />
      </span>
      {!iconOnly && (
        <span className="text-lg font-semibold tracking-tight">{SITE.name}</span>
      )}
    </Link>
  );
}
