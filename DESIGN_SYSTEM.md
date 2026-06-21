# ReFrame Design System

Three layers, one token system. Built to feel like Linear / Vercel / Framer.

```
shadcn/ui (foundation)      Magic UI (effects)         Aceternity (heroes)
├── Design tokens           ├── Spotlight              ├── Hero sections
├── Buttons / Cards         ├── Aurora background      ├── Premium backgrounds
├── Dialogs / Modals        ├── Bento                  └── Interactive sections
├── Inputs / Forms          ├── Meteors / BorderBeam
├── Dropdowns / Sheets      └── ShineBorder / Marquee
├── Tabs / Navigation       └── BlurFade
```

- **Foundation** — `src/components/ui/` (shadcn pattern on Radix): the app's
  buttons, cards, dialogs, inputs, dropdowns, sheets, tabs, labels. Accessible,
  keyboard-navigable, dark-mode native, responsive. Import from the central
  registry: `@/components/ui`.
- **Effects** — `src/components/blocks/fx.tsx` (Magic-UI-inspired, ReFrame
  originals, no third-party branding, export-safe): Spotlight, Aurora, Meteors,
  BorderBeam, ShineBorder, Marquee, BlurFade.
- **Heroes / sections** — `src/components/blocks/` (Aceternity-inspired premium
  blocks the generation engine composes): HeroAurora, HeroSplitPremium,
  HeroBento, HeroAgencia, HeroImageFull, HeroMonumental, ... selected via
  `BLOCK_CATALOG`.

> Note: the **app UI** (dashboard, editor, marketing) uses the foundation tokens
> below. The **generated client sites** are intentionally brand-agnostic and use
> a separate `--brand-*` token set (re-skinned per customer); see `DESIGN.md`.

---

## Tokens (app foundation)

Defined in `src/app/globals.css` `:root` (HSL channels) and mapped in
`tailwind.config.ts`. Dark is the default scheme.

| Token | Tailwind class | Role |
|-------|----------------|------|
| `--background` | `bg-background` | App canvas (OLED black) |
| `--foreground` | `text-foreground` | Primary text (white) |
| `--card` / `--card-foreground` | `bg-card` | Elevated panels (dialogs, menus, sheets) |
| `--secondary` | `bg-secondary` | Subtle fills |
| `--muted` / `--muted-foreground` | `text-muted-foreground` | Secondary text |
| `--accent` / `--accent-foreground` | `bg-accent` | Interactive accent (lime) |
| `--brand` / `--brand-foreground` | `bg-brand` | Explicit brand color (alias of accent) |
| `--border` | `border-border` | Hairlines |
| `--input` | — | Field borders |
| `--ring` | `ring-ring` | Focus ring |
| `--radius` | `rounded-lg/md/sm` | Corner scale |

Re-brand the whole app by changing `--accent` / `--brand` in `globals.css`.

---

## Central registry

```ts
import { Button, Card, Dialog, DialogContent, Sheet, Tabs, DropdownMenu, Input, Label } from "@/components/ui";
```

Standardized primitives (all dark-mode, responsive, accessible, keyboard-nav):

| Need | Components |
|------|-----------|
| Buttons | `Button` (+`asChild`, variants: default/light/outline/secondary/ghost/link) |
| Cards | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| Dialogs / Modals | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` |
| Inputs / Forms | `Input`, `Label` (pair for accessible fields) |
| Dropdowns | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, ... |
| Sheets (drawers) | `Sheet`, `SheetTrigger`, `SheetContent` (side: left/right/top/bottom) |
| Tabs / Navigation | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| Accordion | `Accordion` |

Accessibility & keyboard nav come from **Radix UI** under the hood (focus trap,
ESC, roving focus, type-ahead, ARIA). Overlay motion uses `tailwindcss-animate`.

---

## Composability with the premium layers

The foundation is the base; effects and heroes compose on top, on the same
tokens, so nothing clashes:

```tsx
import { Card, CardContent } from "@/components/ui";
import { ShineBorder } from "@/components/blocks/fx";

<ShineBorder>
  <Card><CardContent>…</CardContent></Card>
</ShineBorder>
```

`shadcn add` works (`components.json` is configured) and drops new components
into `src/components/ui/` using `cn` and these tokens — then add the export to
`src/components/ui/index.ts`.
