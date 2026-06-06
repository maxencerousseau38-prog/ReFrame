# DriveOS
DriveOS est le logiciel moderne de gestion commerciale conçu spécifiquement pour les garagistes. Gérez vos prospects, votre stock de véhicules, vos rendez-vous, vos ventes, vos documents et vos analyses depuis une seule plateforme.

## Développement

```bash
npm install
npm run dev   # http://localhost:3000
```

Stack : Next.js 14 (App Router) · React 18 · Tailwind CSS · GSAP 3.13 (ScrollTrigger, SplitText, DrawSVG) via `@gsap/react`.
Animations : voir `components/` (Navbar, Hero, DashboardPreview) et le setup GSAP centralisé dans `lib/gsap.ts`.
