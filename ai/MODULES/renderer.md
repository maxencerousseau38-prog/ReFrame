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
  - C7a `SceneShell` (monté sur le wrapper de `SiteRenderer`) : publie
    `--rf-scene-*` + `data-scene*` depuis `Block.scene` ; transparent sans scene
    (wrapper V5 identique) ; ne peint rien (voir `ai/MODULES/compose.md`).
  - C7b **13/13 heroes pilotés** : `rfHeroMinH`/`rfHeroPadY` (inline, valeurs
    EXACTES sans plancher) pour les full-bleed + SplitPremium ; classes
    arbitraires `pt/pb-[var(--rf-scene-pt/pb,<V5>)]` par breakpoint pour les
    bannières responsives ; `BlockRenderer` passe `_scene` (heroMediaPosition
    → flip `lg:order` dans Premium2/SplitPremium). Décision : les heroes
    bannière n'appliquent PAS minh (occupation par le rythme ; l'occupation
    forte route vers un skin full-bleed via pickHeroVariant, C7d).
  - C7c **Layout Engine** : 13 grilles de cartes en `--rf-scene-cols/gap`
    (breakpoint large ; stacking mobile V5 intact), 7 splits en
    `--rf-scene-ratio`, `FeaturesAlternating` alterné par `_scene.alternate`.
- **Encore figé (périmètre C10 ex-C9)** : fonds par `alternateBackgrounds`
  global (→ `background/contrastPair` par scène), gaps verticaux de rythme,
  cartes ; exclusions voulues C7c : footer, hairline `gap-px`, bento interne.
- **Points de montage C7** : SceneShell en place (B2) ; `BlockRenderer` L~3900 ;
  REGISTRY variant→composant.
- **Invariants** : fallbacks V5 exacts dans chaque `var()` ; aucun nouveau hardcode
  pour un axe déjà tokenisé ; overflow=0 à 320/390/768/1440 (protocole CONVENTIONS).
- **Exclusions actées** : CTAEditorial py-8 compact ; clamp monumental CTAAsterisk ;
  colonnes de lecture ≤672px ; petits labels h3.
- **Dette** : fichier monolithique (éclatement prévu avec C7/C9) ; `dnaCtaClasses` peu consommé.
