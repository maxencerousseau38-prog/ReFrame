# ReFrame Design System — Component Library

The official, monochrome component library. **Single source of truth** for
reusable UI across the Landing, Dashboard, Workspace, and Editor (ReFrame's own
product chrome). It composes on the frozen D11 tokens (`globals.css` +
`tailwind.config.ts`) and the monochrome D13 identity — see
`docs/DESIGN_SYSTEM.md`.

## Structure

```
design-system/
  index.ts        single import surface (re-exports ui/ primitives + sections)
  README.md       this catalog + governance + per-component analysis
  sections/       composed, universal sections/templates (HeroReframed, …)
```

Foundation **primitives** live in `@/components/ui` (Button, Badge, Card, Input,
GlassPillNav, StatGroup, …) — the shadcn/Radix layer on the same tokens. This
library re-exports them so `@/components/design-system` is the one place to
import from.

## Boundary (honest)

This library is the **product chrome** DS (ReFrame's monochrome identity). It is
intentionally distinct from the **generated-site** system (`DESIGN.md` +
`reframe-redesign` skill + `deriveScheme`), which is **brand-agnostic**: those
components adopt each *client's* colour, not ReFrame's black/silver. A monochrome
chrome component is therefore NOT dropped as-is into a generated client site.
Shared *patterns* (glass pill, stat row) can be reused there, but re-skinned
through the client brand. Keeping this separation is a governance rule (D11).

## Governance — the intake pipeline

Every component received from an external source (21st.dev, Figma, dribbble, …)
goes through this before entering the library — **never integrated verbatim**:

1. **Analyse** — role, structure, responsive, animation, dependencies.
2. **Identify reusable atoms** — a hero is not one component; it is a nav + badge
   + title + CTAs + stats + background.
3. **Generalise** each atom into a universal, token-driven ReFrame primitive.
4. **Re-skin to ReFrame** — monochrome palette, Phosphor icons, `ease-premium`
   motion, 16px buttons / 24px glass, remove ALL source identity.
5. **De-duplicate** — if a primitive already exists (Button, Badge, Card), map to
   it and extend; never fork.
6. **Reject** anything that violates the language (glow, halo, flashy gradient,
   neon, particle/3D-gaming effect, non-neutral colour) — and record why.
7. **Document** — analysis, kept/removed/improved, where-used, and scores.

---

## Intake log

### #001 — "Ethereal Beams Hero" (21st.dev, three.js / react-three-fiber)

**Why it was interesting.** A black-and-white hero with a strong glassmorphic
nav pill and a clean stats row — the *layout* instincts are close to ReFrame.

**Decomposed into atoms**, then triaged:

| Atom | Decision | Reason |
|---|---|---|
| 3D beams shader background (`three`, `@react-three/fiber`, `@react-three/drei`) | **REJECTED** | Heavy absent deps (~600 KB) + a moving light-beam/particle effect — exactly the "gaming / futuristic / neon" class D13 forbids. Replaced by a dotted grid + faint white `.ambient`. |
| Shimmer sweep on buttons (translating gradient) | **REJECTED** | Flashy decorative motion; V3 motion is fade / translateY / scale / opacity only. |
| White glow shadow (`shadow-2xl shadow-white/25`) | **REJECTED** | Glow/halo is explicitly banned. ReFrame depth = hairline + very light shadow. |
| Gradient-clip heading (`bg-gradient-to-r … bg-clip-text`) | **REJECTED** | Flashy gradient; heading is solid near-white, hierarchy by grey. |
| lucide-react icons | **REPLACED** | ReFrame is Phosphor-uniform (`GithubLogo`, `Star`, `ArrowRight`). |
| Glass segmented nav pill | **EXTRACTED → `GlassPillNav`** | Genuinely new, reusable; rebuilt monochrome + accessible. |
| Stats row (1M+/50+/24-7) | **EXTRACTED → `StatGroup`** | Reusable metric display; rebuilt monochrome, tabular figures. |
| Badge with icon | **MAPPED → existing `Badge`** | No duplicate; entrance via existing motion. |
| Buttons (primary/outline/ghost) | **MAPPED → existing `Button`** | Already the canonical 16px language; outline/secondary/ghost cover it. |
| Hero composition | **REINTERPRETED → `HeroReframed` section** | Same skeleton, 100% ReFrame skin, zero rejected effects. |

**New components added:** `GlassPillNav`, `StatGroup`, `HeroReframed` (section).
**Reused (no dup):** `Button`, `Badge`.

**Scores (0–5) of the delivered ReFrame versions:**

| Component | Design | Reusability | Premium | Perf | A11y |
|---|---|---|---|---|---|
| GlassPillNav | 5 | 5 | 5 | 5 | 5 |
| StatGroup | 4 | 5 | 4 | 5 | 5 |
| HeroReframed | 5 | 4 | 5 | 5 | 5 |
| *(rejected beams hero, for contrast)* | 4 | 2 | 3 | 1 | 3 |

**Where used:** GlassPillNav → landing nav, dashboard/editor segment switchers,
pricing period toggle. StatGroup → landing social-proof, dashboard KPI row,
result "why your new site is better". HeroReframed → landing, template previews,
empty-state splash.

---

## Catalog (populated so far)

- **Primitives:** `Button`, `Badge`, `Card`, `Input`, `Label`, **`GlassPillNav`**,
  **`StatGroup`**, `BrowserFrame`, `Reveal`, `BlurReveal`.
- **Sections:** **`HeroReframed`**.

Live gallery: `/design-system` (renders every entry on the real tokens).

## Queued (next intakes, one coherent lot at a time)

Buttons ✓ · Inputs · Cards→24px glass · Tables · Panels · Sidebars · Dialogs ·
Dropdowns · Command palette · Pricing · Testimonials · Features · Footers ·
Empty/Loading/Skeleton · Motion presets. Added only as real components are
received and re-skinned — never as empty scaffolding.
