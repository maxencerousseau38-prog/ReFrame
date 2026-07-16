# ReFrame — Visual Brain (Idea & Pattern Ledger)

The durable index of the **visual brain**. Every external component (21st.dev,
Figma, dribbble…) is disassembled into ATOMIC IDEAS, never adopted as a
component. Each idea is captured here once, classified by where it could improve
ReFrame, compared against everything already in the library, and given a status.

This is the organizing system that lets the library grow toward thousands of
premium, well-classified bricks that eventually feed the AI site generator.

> Companion docs: `README.md` (component catalog + per-intake decisions),
> `docs/DESIGN_SYSTEM.md` (frozen tokens, D11/D13), `DESIGN.md` (generated-site
> grammar, brand-agnostic).

---

## Operating protocol (per incoming component)

1. **Disassemble into ideas** — never think "Hero"; think button, badge, nav,
   layout, animation, effect, depth, light, glass, scroll, interaction,
   composition, UX. Extract *all* interesting ideas.
2. **Classify** each idea: type + target SaaS surfaces + target generated-site
   categories (taxonomy below).
3. **Compare to the whole library** (primitives, sections, prior intakes, this
   ledger). Decide: **REUSE** (already realized) · **MERGE** (fold into an
   existing brick) · **REPLACE** (new idea is strictly better) · **NEW** (a new
   primitive/pattern) · **REJECT** (violates the doctrine — logged as an
   anti-pattern so we never re-adopt it).
4. **Realize** only what passes the doctrine gate, in the right layer.
5. **Record** the idea here with its status and realization.

### Doctrine gate (every idea must pass)
Monochrome only (no blue/violet/cyan/green/flashy-gradient); glass discreet;
radius 20–28px; motion = opacity/translateY/scale/blur only, **reduced-motion
honored**; **never fabricate** (no fake testimonials/stats/avatars); "intemporel,
never spectacular". Failing ideas are logged as **REJECT / anti-pattern**.

---

## Realization layers

| Layer | Where | What lands here |
|---|---|---|
| **Primitive** | `src/components/ui/*` | Atomic, token-driven, reusable UI (Button, GlassPillNav, StatGroup, ScrollScaleReveal…) |
| **Section** | `src/components/design-system/sections/*` | Composed, universal sections (HeroReframed…) |
| **Pattern** | *this ledger* (+ small hooks when useful) | A reusable MECHANIC/idea, possibly realized across several primitives |
| **Generation brick** | `src/lib/library/*` / `blocks` | ⛔ **BLOCKED** — the generation library is currently dead/unwired and `blocks/index.tsx` is a 4 229-line god-file. Ideas tagged for generation are **QUEUED** here until that debt is resolved (roadmap P1/P2). |

---

## Taxonomy

**Idea types:** animation · transition · layout · proportion · spacing · card ·
CTA · hero · background · scroll · interaction · mouse · navigation · overlay ·
glass · responsive · depth · light · composition · organization · UX · UI.

**SaaS surfaces:** Landing · Dashboard · Workspace · Editor · Canvas · Toolbar ·
Sidebar · Inspector · Publish · BusinessPanels · Settings · AI · Analytics ·
Preview · Wizard · Auth · Billing · CommandPalette · DesignSystem.

**Generated-site categories (brand-agnostic — ideas transfer as re-skinnable
patterns):** Hero · Features · Pricing · FAQ · Portfolio · Restaurant · Garage ·
Artisan · Agence · Cabinet · Immobilier · SaaS · Blog · Contact · Testimonials ·
Footer · Navbar · Gallery · Timeline · Stats · CTA.

---

## Ledger

Status legend: 🟢 REALIZED · 🔵 QUEUED (generation, blocked) · 🟡 PATTERN (idea, not yet code) · 🔴 REJECT (anti-pattern).

### From intake #001 — "Ethereal Beams Hero"

| ID | Idea | Type | SaaS surfaces | Gen-site cat. | Compare → status | Realization |
|---|---|---|---|---|---|---|
| I-001 | Segmented glass nav pill | navigation · glass | Landing, Dashboard, Editor (mode switch), Billing (period) | Navbar | NEW → 🟢 | `GlassPillNav` |
| I-002 | Headline-metric row | composition · UI | Landing, Dashboard (KPIs), Analytics, Result | Stats | NEW → 🟢 | `StatGroup` |
| I-003 | Icon badge with soft entrance | badge · animation | Landing, everywhere | Hero, CTA | REUSE → 🟢 | `Badge` + `Reveal` |
| I-004 | Hero composition badge→title→lead→dual-CTA→stats | hero · layout | Landing | Hero (all sectors) | NEW → 🟢 | `HeroReframed` |
| I-005 | Ambient animated background field | background · light · depth | Landing, Auth, empty-states | Hero, Agence | REJECT-source (3D beams/particles) → 🟡 pattern **AmbientDrift** (monochrome, ≤5% opacity, no particles, reduced-motion off) | idea only |
| I-006 | Layered depth: blurred glass bar over live content | glass · depth | all chrome bars | Navbar | REUSE → 🟢 | `.glass` / `.glass-dark` |
| A-001 | Shimmer sweep across button | animation | — | — | 🔴 anti-pattern (flashy, non-doctrine) | never adopt |
| A-002 | Gradient-clip heading text | UI | — | — | 🔴 anti-pattern (flashy gradient) | emphasis by weight/grey instead |

### From intake #002 — "Zoom Parallax"

| ID | Idea | Type | SaaS surfaces | Gen-site cat. | Compare → status | Realization |
|---|---|---|---|---|---|---|
| I-007 | Scroll-linked scale reveal on a pinned stage | scroll · animation | Landing, Preview | Hero, Gallery | NEW → 🟢 | `ScrollScaleReveal` |
| I-008 | Sticky pinned scroll stage (track + progress) | scroll · layout | Landing | Hero, Timeline | MERGE (folded into I-007; reusable if extracted) → 🟡 pattern **StickyScrollStage** | inside `ScrollScaleReveal` |
| I-009 | Editorial multi-image cluster / collage reveal | composition · layout | — | **Gallery, Portfolio, Restaurant, Immobilier, Agence** | REJECT-source (brittle `vw` cluster, non-responsive) → 🔵 QUEUED as re-skinnable responsive collage pattern for generated sites (blocked by lib/library debt) | idea only |
| A-003 | Lenis JS smooth-scroll dependency | interaction | — | — | 🔴 anti-pattern (heavy dep for decoration; use CSS/native) | never adopt |
| P-001 | Reduced-motion discipline (freeze transforms) | UX · a11y | ALL | ALL | NEW → 🟡 policy pattern **MotionSafe** (already applied in I-007) | convention |

---

## Open pattern candidates (🟡 — ideas awaiting a real component to justify code)

- **AmbientDrift** (I-005): an extremely subtle monochrome moving light field —
  only if a future intake proves it stays "intemporel". Not built.
- **StickyScrollStage** (I-008): extract the pin+progress mechanic as a
  standalone primitive/hook once a 2nd consumer appears (avoid premature
  abstraction).
- **MotionSafe** (P-001): a shared reduced-motion helper/convention so every
  motion primitive freezes consistently.

## Generation-engine queue (🔵 — blocked; see Realization-layers note)

- **Responsive editorial collage** (I-009) → Gallery/Portfolio/Restaurant/
  Immobilier/Agence. Requires the dead `lib/library/*` to be resurrected or
  replaced, and `blocks/index.tsx` modularized (roadmap P1/P2), before any idea
  can actually be wired into generated output.

---

*Governance: one idea = one row, forever. Never delete — REJECTs stay as
anti-patterns so the same non-doctrine idea is never re-adopted. Every new intake
appends rows and reconciles against the whole table before writing any code.*
