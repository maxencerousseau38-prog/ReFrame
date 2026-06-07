# Turismo — Vitrine véhicules (911 GTS · A110 · Revuelto)

Site vitrine statique reprenant le design et la configuration de [drive-turismo.fr](https://drive-turismo.fr) (abonnement automobile premium, tout compris), décliné pour trois modèles :

- **Porsche 911 Carrera GTS** (992.2 T-Hybrid)
- **Alpine A110 GTS**
- **Lamborghini Revuelto**

## Contenu

| Fichier | Description |
| --- | --- |
| `index.html` | Page d'accueil : hero, flotte, « tout compris », abonnements (Single / One / Plus), fonctionnement, FAQ, newsletter |
| `porsche-911-carrera-gts.html` | Fiche détaillée + configurateur d'abonnement |
| `alpine-a110.html` | Fiche détaillée + configurateur d'abonnement |
| `lamborghini-revuelto.html` | Fiche détaillée + configurateur d'abonnement |
| `assets/styles.css` | Design system v2 (style Turismo, police Inter, accent `#0a6bff`) |
| `assets/main.js` | Menu mobile, **filtres de catégories**, **favoris** (cœur, localStorage), accordéon FAQ, configurateur de prix, animations au scroll |
| `assets/icons/` | Police d'icônes Bootstrap Icons **auto-hébergée** (aucune dépendance CDN) |

## Design (repris de drive-turismo.fr)

- **Header à deux niveaux** : barre utilitaire + barre de catégories à icônes (filtrante).
- **Hero** « Votre voiture d'exception, en quelques clics » : texte à gauche + collage de photos incliné à droite.
- **Cartes véhicules** style catalogue Turismo : photo, badge de disponibilité, cœur favori, micro-icônes de specs, pastilles de couleurs, prix « à partir de X €/mois ».
- Sections sombres « tout compris » / « fonctionnement », pages détaillées cinématiques.

## Aperçu

Aucune dépendance à installer — ouvrez simplement `index.html`, ou servez le dossier :

```bash
cd site
python3 -m http.server 8000
# http://localhost:8000
```

## Tarifs (alignés sur drive-turismo.fr)

- **Abonnement One** : 4 780 € d'activation, puis 249 €/mois (accès aux 6 catégories, switch illimité).
- **Abonnement Plus** : 1 980 € d'activation, puis 175 €/mois (catégories 1–2, switch 4×/an).
- **Abonnement Single** : 750 € d'activation, mensualité selon options (engagement 12/24 mois).
- **Forfait** : 2 000 km/mois inclus (jusqu'à 4 000 km en Single) — **+0,5 €/km** au-delà.
- **Livraison à domicile** : 1,5 €/km.

Les configurateurs par véhicule appliquent ces règles (forfait 2 000 km de base, +0,5 €/km au-delà). Les mensualités de base par modèle sont indicatives — les tarifs exacts par catégorie ne sont pas publics sur le site officiel (chargés après sélection du pays).

## Personnalisation

- **Visuels** : photos provisoires dans `assets/img/`. Pour les remplacer, déposez vos fichiers sous les mêmes noms (`911-1.jpg`, `alpine-1.jpg`, `revuelto-1.jpg`, etc.) ou ajustez les classes `.media--gts`, `.media--alpine`, `.media--revuelto` dans `styles.css`.
- **Tarifs / specs** : modifiables directement dans le HTML. Le configurateur lit le prix de base via l'attribut `data-base` et les écarts via `data-delta` sur chaque option.
- **Couleurs / police** : variables CSS dans `:root` (`assets/styles.css`).

## Crédits photos (provisoires)

| Modèle | Source | Licence |
| --- | --- | --- |
| Porsche 911 (992) | Wikimedia Commons | CC BY-SA |
| Porsche 911 / Panamera (galerie) | Unsplash | Licence Unsplash |
| Alpine A110 S | Wikimedia Commons | CC BY-SA |
| Lamborghini Revuelto | Wikimedia Commons | CC BY-SA |
| Lamborghini (galerie) | Unsplash | Licence Unsplash |

> Photos à usage provisoire (démonstration). Remplacez-les par vos propres visuels avant toute mise en production. Tarifs et caractéristiques indicatifs.
