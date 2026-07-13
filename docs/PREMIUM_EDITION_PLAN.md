# ReFrame — Premium Edition (sprint UI/UX, plan méthodique)

> Directive utilisateur (2026-07-10) : faire de ReFrame le SaaS IA le plus
> premium du marché (niveau Apple/Framer/Linear/Arc/Vercel), sensation « wow »
> dès l'ouverture. **Additif uniquement** : ne jamais toucher au moteur IA ni
> aux fonctionnalités ; aucune régression ; 497+ tests. Références (Lovable
> incluse) = repères de finition, JAMAIS copiées. U0 (progrès honnête) +
> D8 (preuve visible) + D11 (design system gelé) s'appliquent.
>
> Principe de sprint : « 20 composants parfaits > 200 moyens ». Un lot cohérent
> à la fois, chacun prouvé (avant/après). Le gel D11 fait que les changements de
> tokens re-skinnent tout le chrome d'un coup — c'est le levier.

## Lots (PX)

| Lot | Contenu | Statut |
|---|---|---|
| **PX1 — Nouvelle identité** | tokens : accent lime→**indigo premium** (`234 78% 54%`, AA 7.0), canvas near-black cool, brand violet discret, off-white ; commentaires/doc gelé mis à jour. Tout le chrome hérite (D11). | **✅ fait** — landing/editor/result re-tintés, vert disparu, 497 tests |
| PX2 — Composants premium | Button (variants + glass sur outline), Input, Dropdown, Tabs, Modal/Dialog, Card, Sidebar/Toolbar : verre léger, hairline, focus/hover/active cohérents, un seul langage | à faire |
| PX3 — Motion & micro-interactions | couche motion (spring/fade/scale/stagger via framer-motion), hover magnétique léger, glow subtil, skeletons de chargement, transitions de panneaux « les autres respirent » | à faire |
| PX4 — Chat AI premium | bulles, suggestions, streaming, loading, icônes — « discuter avec un designer IA », plus ChatGPT | à faire |
| PX5 — Publish flow premium | `PublishFlow` unifié 4 étapes (spec `UX_WORKSPACE_PUBLISH_SPEC.md` §4) : URL/visibilité/SEO(OG/favicon)/scan/publier — U0 : n'exposer que le réel (slug/visibilité/SEO = backend, cf. §7 de la spec) | à faire |
| PX6 — Assets premium | **zéro placeholder** : imagerie pro (Unsplash/Pexels libres, ou meilleures images du repo) pour templates/exemples/aperçus ; miniatures parfaites | à faire |
| PX7 — Responsive parfait | tablette/mobile repensés (ex-UX4 : bottom sheets, barre d'action pouce), chrome mobile result, aucun overflow/vide/incohérence 320→ultrawide | à faire |

## Garde-fous

- **U0** : aucune fausse interface ; n'ajouter que des capacités réellement
  implémentées (le preview et le publish n'affichent que le réel).
- **Séparation** : ces tokens habillent le CHROME de ReFrame ; les SITES générés
  restent régis par `DESIGN.md` + `reframe-redesign` (brand-agnostiques).
- **Preuve** : chaque lot livre avant/après (captures multi-largeurs) + tokens/
  composants modifiés + justification. Le motion se ressent en interaction
  (limite : pas d'enregistrement vidéo en sandbox — assumé).
- **Anti-duplication** : un seul Design System (`globals.css` + `tailwind.config`
  + `docs/DESIGN_SYSTEM.md` gelé). Aucun token local.

## Question ouverte (backend, pour PX5)

Le workflow publish demandé (slug choisi, visibilité, override SEO, domaine
perso/SSL) exige du BACKEND (cf. `UX_WORKSPACE_PUBLISH_SPEC.md` §7). À trancher :
implémenter (UX6/UX7 d'origine) ou exposer honnêtement « bientôt » (U0). PX5-UI
peut se livrer en dégradant honnêtement les étapes qui attendent le backend.
