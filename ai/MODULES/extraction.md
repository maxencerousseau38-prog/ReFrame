# Modules `src/lib/extraction/` + `src/lib/understand/` — EXTRACTION & CONTENU

**Responsabilité** : HTML → contenu/structure/VisualDNA (`SiteAnalysis`) ;
puis contenu par scène (`ContentModel`).

- **Fichiers extraction** : `analyze.ts` (`analyzeUrlV2` V5 intact ;
  `analyzeUrlV2WithCapture` ; `enrichWithMeasurements` — raccordement prod D4,
  kill-switch `REFRAME_MEASURE=0`, dégradation octet-identique) ·
  `pipeline.ts` (7 passes, try/catch silencieux par passe — garde <100 chars) ·
  `pass-content.ts` (headline/services/testimonials/FAQ réels ; `extractPrimaryCtaLabel`
  fallback Tier 1 de F16) · `language.ts` (html lang > stopwords fr/en/es/de/it ;
  F13 : pt/nl manquants) · `visual-dna.ts` (V5, <style> inline seulement — supplanté
  par measure/ quand capture) · `bridge.ts` (ExtractionResult→SiteAnalysis).
- **Fichiers understand** : `content-model.ts` (`buildContentModel` : scènes avec
  headings RÉELS, items/quotes/média par scène ; `realHeading` ; alias
  features↔services, portfolio↔gallery côté composer).
- **Invariants** : champs absents = undefined (jamais devinés) ; no-fabrication.
- **Tests** : content-v2.test, content-model.test, extract/analyze/extraction-audit (V5).
- **Dette** : passes silencieuses (aucune trace d'échec) ; `visual-dna.ts` V5 vs
  `measure/` duplication conceptuelle (convergence C11) ; F13.
