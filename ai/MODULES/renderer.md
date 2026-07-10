# Module `src/components/blocks/index.tsx` — RENDERER (~4 200 l., 46 composants)

**Responsabilité** : `SiteSchema` → React/HTML. Devient un EXÉCUTEUR : les
décisions viennent des vars/props, pas des composants.

- **Entrées** : schema (blocks/theme/tokens) ; `themeCss(theme, scope, tokens)`
  émet `--brand-*` (deriveScheme fallback des rôles non mesurés) + `--rf-*` + @font-face.
- **Branchements data-driven en place** :
  - A1 `rfSectionPad(floor)` : 37 sections, padding = `max(var(--rf-space-section, floor), floor)`.
  - A2 `rfContainer(1152)` + `rfContainerRatio(0.89|0.78)` : 37 emplacements + SiteNav.
  - A3 `globals.css` : `rf-fluid-display/h2/h3` → `--rf-text-*`/`--rf-heading-weight`/`--rf-tracking`
    (font-semibold concurrents retirés des titres fluides).
  - `useDNA/_dna` (V5) : motion/cards/CTA partiellement.
- **Encore figé (périmètre C7/C9)** : 13 heroes (min-h, imagePosition/overlay non lus),
  ~40 `grid-cols-*`, ~100 `gap-*`, alternances par index, fonds par `alternateBackgrounds` global.
- **Points de montage C7** : wrapper par bloc dans `SiteRenderer` (→ SceneShell, B2) ;
  `BlockRenderer` L~3900 ; REGISTRY variant→composant.
- **Invariants** : fallbacks V5 exacts dans chaque `var()` ; aucun nouveau hardcode
  pour un axe déjà tokenisé ; overflow=0 à 320/390/768/1440 (protocole CONVENTIONS).
- **Exclusions actées** : CTAEditorial py-8 compact ; clamp monumental CTAAsterisk ;
  colonnes de lecture ≤672px ; petits labels h3.
- **Dette** : fichier monolithique (éclatement prévu avec C7/C9) ; `dnaCtaClasses` peu consommé.
