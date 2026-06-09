import { cn } from "@/lib/utils";

/** Barre d'un faux navigateur (points + champ d'URL). */
function BrowserChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-black/5 bg-black/[0.03] px-3 py-2 dark:border-white/5 dark:bg-white/[0.03]">
      <div className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-red-400/80" />
        <span className="size-2.5 rounded-full bg-yellow-400/80" />
        <span className="size-2.5 rounded-full bg-green-400/80" />
      </div>
      <div className="mx-auto truncate rounded-md bg-background/70 px-3 py-1 text-[10px] text-muted-foreground">
        {url}
      </div>
    </div>
  );
}

/**
 * Aperçu « avant » : un site daté typique (couleurs criardes, mise en page tassée,
 * non responsive). Volontairement peu engageant.
 */
export function MockupBefore({ className }: { className?: string }) {
  return (
    <div className={cn("h-full w-full overflow-hidden bg-white", className)}>
      <BrowserChrome url="http://www.mon-ancien-site.fr/index.html" />
      <div className="space-y-2 p-3 font-serif text-[10px] leading-tight text-black">
        <div className="bg-[#1a3a8f] px-2 py-1.5 text-center text-white">
          <div className="text-sm font-bold">LE BISTROT LUMIERE</div>
          <div className="text-[8px] underline">Accueil | Menu | Contact | Plan</div>
        </div>
        <div className="border border-dashed border-gray-400 bg-[#fffbe6] p-1.5 text-center text-[9px] text-red-700">
          ★ BIENVENUE SUR NOTRE SITE ★ Cliquez ici pour entrer ★
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="col-span-2 space-y-1">
            <p className="text-justify text-[8px] text-gray-700">
              Bienvenue sur le site du Bistrot Lumiere. Nous sommes un restaurant situe a
              Grenoble. Ouvert depuis 2009. Cuisine traditionnelle. Reservation par telephone
              uniquement au 04 76 00 11 22.
            </p>
            <p className="text-[8px] text-blue-700 underline">Cliquez ici pour voir le menu</p>
            <p className="text-[8px] text-blue-700 underline">Telechargez notre carte (PDF)</p>
          </div>
          <div className="space-y-1">
            <div className="h-8 bg-gray-300" />
            <div className="bg-[#cc0000] px-1 py-0.5 text-center text-[7px] text-white">
              PROMO -10%
            </div>
            <div className="h-6 bg-gray-200" />
          </div>
        </div>
        <div className="border-t border-gray-300 pt-1 text-center text-[7px] text-gray-500">
          Copyright 2014 - Compteur de visites : 004271 - Optimise pour Internet Explorer
        </div>
      </div>
    </div>
  );
}

/**
 * Aperçu « après » : le même commerce, version Vitrio. Moderne, aéré, mobile-first.
 */
export function MockupAfter({ className }: { className?: string }) {
  return (
    <div className={cn("h-full w-full overflow-hidden bg-white", className)}>
      <BrowserChrome url="https://bistrot-lumiere.fr" />
      <div className="font-sans text-black">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2a1810] to-[#7a3b1a] px-4 py-5 text-white">
          <div className="flex items-center justify-between text-[9px]">
            <span className="font-semibold tracking-tight">Le Bistrot Lumière</span>
            <span className="flex gap-2 text-white/70">
              <span>Menu</span>
              <span>Réserver</span>
              <span>Contact</span>
            </span>
          </div>
          <div className="mt-4">
            <div className="text-[15px] font-semibold leading-tight">
              Cuisine de marché,
              <br />
              ambiance chaleureuse
            </div>
            <div className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[8px] font-medium text-[#7a3b1a]">
              Réserver une table →
            </div>
          </div>
        </div>
        {/* Cartes */}
        <div className="grid grid-cols-3 gap-1.5 p-3">
          {["Menu du jour", "Nos plats", "Horaires"].map((t) => (
            <div key={t} className="rounded-lg border border-gray-100 bg-gray-50 p-1.5">
              <div className="mb-1 h-6 rounded bg-gradient-to-br from-orange-100 to-orange-200" />
              <div className="text-[8px] font-medium">{t}</div>
              <div className="text-[7px] text-gray-400">Voir plus</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-1.5 text-[7px] text-gray-400">
          <span>Ouvert · Mar–Sam 12h–22h</span>
          <span>04 76 00 11 22</span>
        </div>
      </div>
    </div>
  );
}
