# Audit Premium — 2026-07-19 (Phases 1-2 du programme qualité)

> Question de gate : **« Une agence premium pourrait-elle vendre ce résultat 20 000 € ? »**
> Verdict global : **presque** — la première ET la dernière impression sont désormais
> au niveau (heroes immersifs, nav overlay, footers signés, closings sectoriels,
> contact varié) ; les points restants sont listés en backlog priorisé.

## Phase 1 — Architecture (état vérifié)

- **App Router** : 12 pages + 33 routes API (auth, billing Stripe, publish, domaines
  Vercel, exports, analytics, leads). Surface mature.
- **Sécurité (spot-check)** : `/api/img` **gardé contre le SSRF** (public http/https
  only, pas de private/loopback, gate content-type) ; `rateLimit` sur 21 routes ;
  auth par `getCurrentUser()` (15 routes). Une `security-review` OWASP complète
  reste à passer (Phase 7 planifiée).
- **Moteur** : planner (5 familles d'arcs + rythme `--rf-rhythm`) → catalog
  (scoring secteur+mood+motion+jitter marque, co-prefer ties) → engine (props
  réelles only, F21 zéro fabrication) → qualityPass (une photo = une fois,
  priorité éditoriale, exclusions team/collection). **Modules profonds, seams
  propres** (vocabulaire codebase-design) : `pickVariant`/`pickVariantFrom` est
  l'interface étroite qui cache tout le scoring.
- **Scraping** : extraction solide (voir `docs/RECONSTRUCTION_GAP_ANALYSIS.md`) ;
  manques réels : méta par page au crawl, vidéos/embeds, association image↔section.
  ⚠️ E1 : la sandbox bloque le TLS sortant → le scraping live ne se teste pas ici.
- **Design system** : tokens brand-agnostiques (`deriveScheme`), type fluide,
  hairlines, motion `EASE` 0.16s, reduced-motion honoré partout.

## Phase 2 — Qualité des sites générés (verdict froid)

| Axe | État | Preuve |
|---|---|---|
| Slop IA (3 points, glassmorphism, gradients) | **0 détecté** dans les blocs générés | grep + revue |
| « Même squelette » inter-secteurs | Tué (5 familles d'arcs + rythmes) | probes + captures |
| Monopoles intra-secteur | Tués : hero, footer, about, services, testimonials, CTA, **contact** | probes 2/8 + captures |
| Fabrication | Zéro (F21 partout, tagline réelle, descriptions réelles) | tests |
| Responsive | 320→1440 overflow-x=0 sur toutes les preuves | Playwright |
| Cohérence métier | Collections curées préservées (« nos vins ») ; voix de closing sectorielle | tests + captures |

## Backlog priorisé (prochains lots)

1. **Nav mobile hamburger** — les liens disparaissent sous `md:` (seuls marque+CTA
   restent) ; la référence premium a une nav mobile complète. Impact : chaque site.
2. **SEO par page** — titres/meta des sous-pages crawlées (aujourd'hui homepage only).
3. **Association image↔section à la source** — le pool global peut mettre une photo
   de la section A dans la section B ; extraire la proximité DOM.
4. **Stats/FAQ/gallery variety** — mêmes méthode tie/probe que les autres slots.
5. **Phase 7 complète** — security-review OWASP, Core Web Vitals mesurés, bundle.
6. **`ensureSlot("stats")` retail** — peut réinsérer une bande stats après contact.

## Lot livré avec cet audit (Phase 3, exécution)

**Monopole du contact tué** — le DERNIER « même structure pour tous » : l'engine
codait `ContactFormPremium1` en dur (chaque site finissait sur le même formulaire).
Désormais `pickVariantFrom(["ContactFormPremium1","ContactAtelier"])` — contrainte
métier préservée (section toujours À FORMULAIRE → capture de leads intacte, même
endpoint `/api/contact`), architecture variée par marque : clair 2-colonnes vs
**ContactAtelier** (bureau d'enquête sombre : bande brand-contrast, canaux réels en
liste hairline CALL/WRITE/VISIT/BOOK, formulaire sur carte claire élevée — fusion
Archform Contact + comparaison 21st, #2575 rejeté pour slop). Warm/elegant se
partagent les deux ; minimal/bold gardent le clair (fit).
Preuves : 5 tests régression + wiring, 546 tests, tsc 0, build 0, Playwright
1440/768/390 overflow-x=0, 0 erreur console, captures.
