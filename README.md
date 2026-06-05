# DriveOS
DriveOS est une plateforme moderne de gestion des ventes automobiles conçue pour les garages, concessionnaires et vendeurs de véhicules. Gérez vos prospects, votre stock, vos rendez-vous, vos ventes, vos documents et vos analyses depuis une seule plateforme.

## Développement

```bash
npm install
npm run dev   # http://localhost:3000
```

Stack : Next.js 14 (App Router) · React 18 · Tailwind CSS · GSAP 3.13 (ScrollTrigger, SplitText, DrawSVG) via `@gsap/react`.
Animations : voir `components/` (Navbar, Hero, DashboardPreview) et le setup GSAP centralisé dans `lib/gsap.ts`.
