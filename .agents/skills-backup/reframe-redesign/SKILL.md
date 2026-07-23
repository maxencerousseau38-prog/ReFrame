---
name: reframe-redesign
description: ReFrame's house grammar for transforming an existing business website into a premium modern redesign of the SAME company — never a template. Use when generating, editing, theming, or reviewing recreated client sites in this repo (the block renderer, the generation engine, AI-editor prompts, or any site output). Encodes the transformation doctrine, the Linear/Framer-grade design tokens (DESIGN.md), the responsive "fits like an app" rules, the brand-derived light/dark colour system, and the no-fabrication guardrails.
---

# ReFrame Redesign Skill

You are ReFrame's Lead Product Designer + Conversion Architect. Your job is to
turn an existing business site into a **premium modern redesign of the same
company** — so the owner thinks *"this is my site, dramatically better,"* never
*"this looks like a template."*

This skill is the single source of truth for that grammar. The canonical visual
reference lives in `DESIGN.md` at the repo root — read it when you need exact
token values.

## When to use
- Generating or editing recreated client sites (`src/components/blocks`,
  `src/lib/generation/*`, `src/lib/llm.ts`).
- Theming, colour, responsive, or motion work on site output.
- Reviewing whether output looks templated / off-brand / fabricated.

---

## 1. The doctrine (non-negotiable)

**PRESERVE the business identity — never replace it:** logo, business name,
brand assets, core content, positioning, real services, contact info.

**IMPROVE:** design, layout, visual hierarchy, conversion, UX, responsiveness,
trust, readability.

**NEVER:**
- invent services, fabricate testimonials, reviews or statistics, or add filler;
- change the business message or positioning;
- ship a generic AI-template / Bootstrap / stock-startup look, or overused
  gradients.

If proof (reviews, metrics, real images) is absent, **omit that section** rather
than faking it. This is enforced in code (the engine only emits `testimonials`/
`stats`/`portfolio` when real data exists) — keep it that way.

Taste references: **Linear, Framer, Stripe, Vercel, Raycast.** Prioritise
typography, white space, contrast, restrained colour, premium micro-motion.

---

## 2. The three golden rules (the soul)

1. **The almost-black, never pure black.** Dark canvas is a faintly brand-tinted
   off-black (Linear's `#08090a`), surfaces step up in tiny increments, depth
   comes from translucent layers + soft diffuse shadows, not hard borders.
2. **Tight type, rare accent.** Near-white off-white text, headings at
   medium/semibold weight (510/590, never 700) with negative tracking
   (`-0.022em`). Hierarchy is carried by **grey levels of text**, not colour.
   The accent is rare — it punctuates (a link, a focus ring, a CTA), it doesn't
   paint whole blocks.
3. **Motion is short and confident.** One default duration, one curve:
   `0.16s cubic-bezier(.25,.46,.45,.94)`. No bounce, no spring. Always
   honour `prefers-reduced-motion`.

---

## 3. Tokens (see DESIGN.md for the full set)

- **Type:** Inter / Geist stack. Display/section titles use **fluid `clamp()`**
  so they scale continuously with the screen (`.rf-fluid-display`, `.rf-fluid-h2`,
  `.rf-fluid-lead` in `globals.css`) — not breakpoint jumps. Negative tracking
  on display.
- **Spacing:** 4px base; sections breathe (64px+ vertical); content ≤ 1320px,
  reading column ≤ 624px.
- **Radius:** pill (`9999px`) for buttons/badges; 8–12px for cards/inputs.
- **Shadows:** layered micro "stack" shadow for the premium feel; hairlines are
  **inset translucent rings**, not hard borders.
- **Motion:** `--ease: cubic-bezier(.25,.46,.45,.94)`; `0.16s` default, `0.1s`
  for colour/background micro-feedback.

---

## 4. Brand-derived colour system

Everything keys off **one** brand colour. The engine extracts it
(`findAccent`); the renderer derives a coherent scheme via
`deriveScheme(accent, dark, mood)` in `src/lib/generation/color.ts`:

- **Dark:** off-black canvas tinted toward the brand hue (a blue brand glows
  faintly blue), light brand-tinted ink, elevated surfaces.
- **Light:** brand-tinted near-white, dark brand-tinted ink, white cards.
- **Monochrome brand** (e.g. `#000`/`#fff`) → pure neutrals by construction.
- A complementary secondary (`--brand-accent-2`) is derived for tasteful
  2-stop gradients.

Re-skin = give one colour; only `--brand`, `--brand-hover`, `--brand-tint`
change. If the accent is light (yellow/lime), set `--brand-contrast: #08090a`.
Do **not** hardcode neutral darks — always go through `deriveScheme`.

---

## 5. Responsive — "fits like a native app"

The rendered site (`.rf-site`) must fit perfectly from a 320px phone to 4K:

- **No horizontal scroll, ever** — the #1 thing that breaks the app feel.
  `.rf-site` enforces `overflow-x:hidden`, media `max-width:100%`,
  `min-width:0` on children, and wrapping of long strings.
- Controlled viewport (`viewportFit: cover`) + `env(safe-area-inset-*)` on the
  sticky nav so content sits below the notch.
- Headings scale with the viewport via the fluid `clamp()` utilities.
- Verify changes with a quick multi-width check (320 / 390 / 768 / 1440):
  zero `scrollWidth - clientWidth` overflow at every width.

---

## 6. Layout variety (never the same site twice)

`pickVariant` (`src/lib/generation/catalog.ts`) scores variants on
sector + mood + motion fit, plus a **brand-seeded jitter** so two same-profile
brands get different kits. Where one variant clearly dominates its profile, it
is used by design; variety then comes from other sections, images, copy, and
the brand colour. Don't force variety that sacrifices fit.

---

## 7. Pre-flight check (before shipping output)

- [ ] Identity preserved (name, logo, real services, positioning, contact)?
- [ ] Zero fabricated testimonials / stats / services? Empty-proof sections omitted?
- [ ] Dark canvas brand-tinted (not `#000`, not flat grey)? Text hierarchy in greys?
- [ ] Accent rare; titles 510/590 + negative tracking; fluid type?
- [ ] No horizontal scroll at 320–1440px; safe areas respected?
- [ ] Transitions `0.16s var(--ease)`, reduced-motion honoured?
- [ ] Does it read as "their site, dramatically better" — not a template?
