import { MapPin, Phone, Clock, Mail, Tag } from "lucide-react";
import type { SiteContent } from "@/types";

/**
 * Aperçu du site du client à partir de son contenu (jsonb).
 * Reflète ce que verront les visiteurs sur le site hébergé.
 */
export function SitePreview({ content }: { content: SiteContent }) {
  const accent = content.couleur || "#6d4dff";
  const rows = [
    content.telephone && { icon: Phone, value: content.telephone },
    content.adresse && { icon: MapPin, value: content.adresse },
    content.horaires && { icon: Clock, value: content.horaires },
    content.email && { icon: Mail, value: content.email },
  ].filter(Boolean) as { icon: typeof Phone; value: string }[];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white text-black shadow-sm">
      {/* Bandeau */}
      <div
        className="relative px-6 py-10 text-white"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}
      >
        <div className="text-xl font-semibold tracking-tight">
          {content.entreprise || "Votre établissement"}
        </div>
        {content.slogan && <p className="mt-1 max-w-md text-sm text-white/90">{content.slogan}</p>}
      </div>

      {/* Promo */}
      {content.promo && (
        <div
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          <Tag className="size-4" /> {content.promo}
        </div>
      )}

      <div className="space-y-4 p-6">
        {content.apropos && (
          <p className="text-sm leading-relaxed text-neutral-600">{content.apropos}</p>
        )}
        {rows.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {rows.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                <r.icon className="size-4" style={{ color: accent }} />
                {r.value}
              </li>
            ))}
          </ul>
        )}
        {!content.apropos && rows.length === 0 && (
          <p className="text-sm text-neutral-400">
            Renseignez vos informations dans l'éditeur pour voir l'aperçu se remplir.
          </p>
        )}
      </div>
    </div>
  );
}
