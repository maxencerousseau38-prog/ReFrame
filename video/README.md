# @driveos/video

Plugin vidéo de **DriveOS** — génération automatique de vidéos promotionnelles
pour les annonces de véhicules, à l'aide de [Remotion](https://www.remotion.dev)
(vidéos écrites en React).

À partir d'une fiche véhicule DriveOS, ce plugin produit une vidéo MP4 prête à
publier (site web, YouTube, Reels, TikTok).

## Installation

```bash
cd video
npm install
```

## Aperçu en direct (Remotion Studio)

```bash
npm run dev
```

Ouvre Remotion Studio sur http://localhost:3000 où l'on peut éditer les props
(les champs du véhicule) en direct.

## Compositions

| ID                    | Format        | Usage                      |
| --------------------- | ------------- | -------------------------- |
| `CarListing`          | 1920×1080     | Site web / YouTube         |
| `CarListingVertical`  | 1080×1920     | Reels / Stories / TikTok   |

## Rendu d'une vidéo

```bash
# Avec les props par défaut
npm run render

# Avec les données d'un véhicule DriveOS
npx remotion render CarListing out/listing.mp4 --props=./sample-vehicle.json

# Version verticale
npx remotion render CarListingVertical out/listing-vertical.mp4 --props=./sample-vehicle.json
```

## Intégration avec DriveOS

Les props attendues correspondent à un enregistrement véhicule (voir
[`src/schema.ts`](./src/schema.ts)). Depuis le backend DriveOS, il suffit de
sérialiser la fiche véhicule en JSON et de la passer via `--props`, ou
d'utiliser l'API `@remotion/renderer` pour un rendu programmatique côté serveur.

Champs (`carListingSchema`) :

- `dealershipName`, `make`, `model`, `year`
- `price`, `currency`, `mileageKm`, `fuel`, `transmission`
- `highlights` — jusqu'à 4 points forts
- `photos` — URLs des photos du véhicule
- `accentColor` — couleur d'accent (charte du garage)
