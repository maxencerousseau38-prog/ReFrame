import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { FOOTER_NAV, SITE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {SITE.tagline} Pour les artisans, commerçants et PME locales.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              <a href={`mailto:${SITE.email}`} className="hover:text-foreground">
                {SITE.email}
              </a>
            </p>
          </div>

          {FOOTER_NAV.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {SITE.company}. Tous droits réservés.
          </p>
          <p className="text-xs">
            Vitrio est une plateforme d'hébergement et de création de sites — pas une agence
            marketing.
          </p>
        </div>
      </div>
    </footer>
  );
}
