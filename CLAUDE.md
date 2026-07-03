# ReFrame — Operating Doctrine (CLAUDE.md)

ReFrame turns an existing business website into a **premium modern redesign of the
same company** — the owner must think *"this is exactly my site, dramatically
better,"* never *"this looks like a template / AI."*

This file is the always-loaded contract. The visual grammar + exact tokens live in
`DESIGN.md`; the house rules in the `reframe-redesign` skill; the spec-vs-engine
status in `docs/RECONSTRUCTION_GAP_ANALYSIS.md`.

## Mandatory skills (never bypass)

Before ANY generation, reconstruction, redesign, component creation, or quality
review, activate and use these via the Skill tool:

- **ui-ux-pro-max** — UI/UX intelligence (styles, palettes, type pairing, UX rules).
- **frontend-design** — distinctive, non-templated visual direction.
- **shadcn-ui** — component foundation (built into native ReFrame components, never
  exposed as third-party).
- **web-design-guidelines** — design quality review **and the accessibility / WCAG
  authority** (the requested `web-accessibility` skill is not installed; this skill
  covers contrast, semantics, keyboard, focus).
- Plus the in-repo **reframe-redesign** house grammar.

A SessionStart hook (`.claude/hooks/reframe-skills-reminder.sh`) re-injects this
rule every session.

## Golden rules (non-negotiable)

- **Preserve identity**: logo, name, real services, positioning, contact. Improve
  design / hierarchy / conversion / responsiveness / trust / a11y / performance.
- **Never fabricate**: no invented testimonials, stats, services, or filler. If
  real proof is absent, **omit the section** (enforced in the engine — keep it so).
- **Never templated / AI-looking / generic.** No cheap gradients, neon, cyberpunk.
- Taste references: Apple, Stripe, Linear, Framer, Vercel, Notion.
- Quality floor always: responsive 320→4K (zero horizontal scroll), visible focus,
  `prefers-reduced-motion` honoured, WCAG AA contrast.

## The 10-phase reconstruction pipeline

1. **Extract everything** (target 90% extraction / 10% AI): structure, nav, pages,
   content, images, logo, colors, typography, icons, services, products,
   testimonials, trust signals, contact, forms, SEO meta, integrations.
2. **Business analysis**: industry, audience, positioning, model, conversion goals,
   trust factors → pick the design direction.
3. **Hero** (>50% of perceived quality): premium, brand-derived, strong hierarchy,
   primary + secondary CTA, trust indicators, responsive. Worthy of a $10k+ redesign.
4. **Premium component mapping**: map every extracted section to the best component
   in the system (shadcn-grounded, ReFrame-native). Never random layouts.
5. **Design-system enforcement**: consistent spacing/type/hierarchy/grids; detect &
   auto-correct misalignment, weak hierarchy, imbalance.
6. **Accessibility enforcement**: WCAG AA, contrast, semantic HTML, keyboard,
   accessible forms/buttons/nav, screen-reader compatibility.
7. **Quality pass**: score Typography, Spacing, Hierarchy, Images, Accessibility,
   Responsiveness, Conversion, Consistency; improve until premium.
8. **Business-asset detection**: Stripe, PayPal, Calendly, HubSpot, Intercom, Crisp,
   GA, GTM, Meta Pixel, Mailchimp, booking/reservation. Warn before publishing if a
   critical asset is missing.
9. **SEO preservation**: URLs, metadata, titles, descriptions, structured data,
   internal linking — never damage SEO.
10. **Publishing**: Analyze → Rebuild → AI-edit → Publish → Connect domain → Live,
    in under 10 minutes.

## Where things live

- Generation engine / extraction: `src/lib/generation/` (`engine.ts`, `catalog.ts`,
  `industries.ts`, `color.ts`, `types.ts`, `validate.ts`).
- Block renderer + components: `src/components/blocks/index.tsx` (theme vars, heroes,
  sections, registry).
- Data stores / auth / billing: `src/lib/server/`.
- Visual QA gallery: `/zpreview?industry=<sector>&img=1[&dark=1]` (real engine output).

## Dev commands

- `npm test` — vitest. `npx tsc --noEmit` — typecheck. `npm run build` — prod build.
- Verify UI changes visually via `/zpreview` + a multi-width screenshot
  (320 / 390 / 768 / 1440), asserting zero horizontal overflow.

## Honest status

The engine is mature but does **not yet** hit "90% extraction" — see
`docs/RECONSTRUCTION_GAP_ANALYSIS.md` for what's done / partial / missing and the
prioritized plan. Don't claim capabilities that aren't implemented.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
