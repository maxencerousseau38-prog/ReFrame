# DriveOS
DriveOS est une plateforme moderne de gestion des ventes automobiles conçue pour les garages, concessionnaires et vendeurs de véhicules. Gérez vos prospects, votre stock, vos rendez-vous, vos ventes, vos documents et vos analyses depuis une seule plateforme.

## Stack technique
- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (composants compatibles 21st.dev)
- **Framer Motion** pour les animations
- Thème clair / sombre intégré (classe `.dark`)

## Démarrage
```bash
npm install      # installe les dépendances
npm run dev      # serveur de développement (http://localhost:5173)
npm run build    # build de production
npm run preview  # prévisualise le build
npm run lint     # analyse statique ESLint
```

## Structure
```
src/
  components/      Sidebar, Topbar, Pill (briques d'interface)
  components/ui/   Primitives shadcn/ui (button, card, table, badge…)
  views/           Dashboard, Prospects, Stock véhicules, écrans à venir
  lib/utils.ts     Helper cn() (clsx + tailwind-merge)
  data.ts          Données de démonstration et navigation
  icons.tsx        Jeu d'icônes SVG
  animations.ts    Variantes d'animation Framer Motion
```

## Ajouter des composants shadcn / 21st.dev
```bash
npx shadcn@latest add <composant>
npx shadcn@latest add "https://21st.dev/r/..."
```

> Interface de démonstration alimentée par des données factices. Le branchement
> aux API métier (prospects, stock, ventes) reste à réaliser.
