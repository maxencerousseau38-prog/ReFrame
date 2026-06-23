# ReFrame design system — Figma export

`figma-tokens.json` is the ReFrame foundation design system in **W3C Design
Tokens** format (compatible with the **Tokens Studio for Figma** plugin). It is
the source for building the ReFrame component library in Figma, kept in sync
with `src/app/globals.css`, `tailwind.config.ts` and `DESIGN.md`.

## Push to Figma (two paths)

**A. Tokens Studio plugin (works today, no MCP):**
1. In Figma, install **Tokens Studio for Figma**.
2. Plugin → Tokens → Import → upload `design/figma-tokens.json`.
3. "Create styles" / "Create variables" → you get Figma color/typography/
   spacing/radius/shadow variables matching the app 1:1.
4. Build components (Button, Card, Dialog, Hero, …) on top of those variables.

**B. Figma MCP (when the connector is live):**
Run the `figma-generate-library` flow (`/figma-generate-library`) against this
repo — it reads `src/components/ui` + these tokens and generates the Figma
library (variables + component set) automatically. (Was prepared while the
Figma MCP server was disconnected.)

## What's in here
- **Colors** — background / foreground / card / secondary / muted / accent /
  brand / border / ring (the app's `:root` tokens, hex).
- **Radius** — sm/md/lg(20px)/pill.
- **Spacing** — 4px scale (1→10).
- **Sizes** — container 1320 / wide 1416 / prose 624.
- **Typography** — Geist, weights 400/510/590, the fluid type scale resolved to
  fixed Figma sizes, display/body composite styles.
- **Shadows** — the premium micro "stack" shadow + high elevation.
