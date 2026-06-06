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
| `assets/styles.css` | Design system (style Apple/premium, police Inter, accent `#007aff`) |
| `assets/main.js` | Nav mobile, accordéon FAQ, configurateur de prix, animations |

## Aperçu

Aucune dépendance à installer — ouvrez simplement `index.html`, ou servez le dossier :

```bash
cd site
python3 -m http.server 8000
# http://localhost:8000
```

## Personnalisation

- **Visuels** : les véhicules utilisent des dégradés + silhouettes SVG comme placeholders. Pour intégrer de vraies photos, remplacez les `<div class="...__media media--*">` par des `<img>` (ou ajustez les classes `.media--gts`, `.media--alpine`, `.media--revuelto` dans `styles.css`).
- **Tarifs / specs** : modifiables directement dans le HTML. Le configurateur lit le prix de base via l'attribut `data-base` et les écarts via `data-delta` sur chaque option.
- **Couleurs / police** : variables CSS dans `:root` (`assets/styles.css`).

> Les tarifs et caractéristiques sont indicatifs et destinés à la démonstration.
