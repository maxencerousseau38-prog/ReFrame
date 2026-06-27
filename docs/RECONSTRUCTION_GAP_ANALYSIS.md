# ReFrame — Reconstruction Gap Analysis (Spec vs Engine)

Status of the 10-phase "Ultimate Premium" doctrine against the current codebase.
Legend: ✅ done · 🟡 partial · ❌ missing. File refs are the place to change.

> Honesty note: the spec targets **90% extraction / 10% AI**. We are **not there
> yet** — extraction is solid on the basics but drops several real-content types
> (videos, embeds) and several phases are heuristic-light.

---

## Phase 1 — Full extraction  ·  🟡 (the biggest gap to the 90% target)

`src/lib/generation/engine.ts` (`analyzeUrl`, `extract*`), `src/lib/server/render.ts`.

| Field | State | Notes / ref |
|---|---|---|
| Headline, description | ✅ | h1/og/JSON-LD/title heuristics |
| Services (+ descriptions) | ✅ | `extractProse` h3+p pairs, nav fallback |
| Images (≤8, validated) | 🟡 | capped at 8; no per-section association |
| Hero image, logo, accent color | ✅ | `extractImages`, logo regex, weighted color vote |
| Nav + multi-page crawl | ✅ | `crawlPages` (≤6 pages) + sitemap |
| Contact (phone/email/address/booking) | ✅ | `extractContact` |
| Integrations (Stripe/Calendly/GA4…) | ✅ | `detectIntegrations` |
| Stats | 🟡 | JSON-LD `aggregateRating` only |
| Testimonials | ✅ | `extractTestimonials` — JSON-LD + DOM |
| Dark source detection | ✅ | `detectSourceDark` → theme default |
| FAQ content | ✅ | `extractFaq` — JSON-LD FAQPage + `<details>`/`<dl>`/question-headings |
| Social links | ✅ | `extractSocialLinks` → wired into all three footers |
| Fonts / typography | ✅ | `extractFonts` — serif-led source → `theme.font="serif"` |
| Menu / pricing tables (`collection`) | ✅ | `extractCollection` → dedicated Menu page |
| Team / people | ✅ | `extractTeam` (photo-gated) → premium `TeamGrid` section |
| Per-page `<title>`/meta on crawl | ❌ | homepage meta only |
| Videos / embeds | ❌ | not tracked |

## Phase 2 — Business analysis & audit  ·  ✅ (Design System V4)

`detectIndustry` + `INDUSTRY_PROFILES` (`industries.ts`); `analysis.scores`.

- ✅ **20 industries** with dedicated profiles: restaurant, artisan, realestate,
  saas, agency, ecommerce, health, hotel, architect, lawyer, gym, coach, plumber,
  electrician, construction, finance, fashion, automotive, medical, generic.
- ✅ Each has unique keywords, theme palette, defaults, CTA, per-trade section flow.
- ✅ **7 new section types** (emergency, process, before-after, booking, map,
  schedule, newsletter) mapped to existing renderable components.
- 🟡 Audit is coarse; audience/conversion-goal modelling is implicit.

## Phase 3 — Hero  ·  ✅ (recently elevated)

`src/components/blocks/index.tsx` hero family; `catalog.ts`.
- ✅ 13 premium heroes: HeroSplitPremium, HeroBento, HeroAurora, HeroPremium1/2,
  HeroSpotlight, HeroEditorial, HeroImageFull, HeroMonumental, HeroAgencia,
  HeroBeam, HeroArchform, HeroCanvas.
- ✅ Brand-derived, primary+secondary CTA, responsive, WCAG-compliant ink.

## Phase 4 — Premium component mapping  ·  ✅

`pickVariant` (`catalog.ts`) maps every section to a scored variant (sector + mood
+ brand jitter). Sectors expanded for all 20 industries.
- ✅ Deterministic, varied, never-random mapping.
- ✅ ~50+ components across 10+ categories.

## Phase 5 — Design-system enforcement  ·  🟡

Tokens via `deriveScheme` + `DESIGN.md`; fluid `clamp()` type; hairline system.
- ✅ Consistent tokens, spacing scale, fluid type, brand-derived color.
- ❌ No automated "detect misalignment / weak hierarchy / imbalance and
  auto-correct" pass — it's authored, not enforced by a checker.

## Phase 6 — Accessibility  ·  🟡  (authority: web-design-guidelines)

- ✅ Reduced-motion honoured, visible focus in places, brand contrast via scheme,
  semantic sections, image fallbacks.
- ❌ No systematic WCAG AA audit pass (contrast math on every text/bg pair, alt-text
  coverage, focus order, form labels) wired into generation/quality.

## Phase 7 — Quality pass  ·  🟡

- ✅ `qualityPass()` in engine.ts (hero/footer anchoring, dedup, image distribution).
- ✅ `qualityReport()` in quality.ts (8-category scorecard, issues list).
- 🟡 No "improve-until-premium" loop — scorecard is informational, not corrective.

## Phase 8 — Business-asset detection  ·  ✅ / 🟡

- ✅ `detectIntegrations` covers Stripe/PayPal/Calendly/HubSpot/Intercom/Crisp/
  GA4/GTM/Meta Pixel/Mailchimp/booking.
- 🟡 "Warn before publishing if a critical asset is missing" is not surfaced in the
  publish flow as a blocking pre-flight.

## Phase 9 — SEO preservation  ·  🟡

`routePath` (nested-path preservation), `src/lib/server/seo.ts`.
- ✅ URL/path continuity, titles/descriptions, sitemap/robots, JSON-LD in export.
- 🟡 Internal linking preservation is partial.

## Phase 10 — Publishing  ·  ✅

Analyze → rebuild → AI-edit → publish → connect domain → live. Backend now
durable (Supabase) + Supabase Auth.

---

## Prioritized backlog

**P0 — extraction gap (Phase 1): ✅ COMPLETE**
1. ✅ Real FAQ extraction
2. ✅ Social links → all footers
3. ✅ Fonts capture → serif preservation
4. ✅ Menu / pricing `collection` → dedicated page
5. ✅ Team / people → premium TeamGrid

**P0b — Design System V4 (Phase 2): ✅ COMPLETE**
6. ✅ 12 new industries (hotel→medical) with profiles + keywords + themes
7. ✅ Per-trade INDUSTRY_FLOW in planSmart (19 sector flows)
8. ✅ 7 new section types with renderableCategory mapping
9. ✅ Catalog sector lists expanded for all 20 industries

**P1 — make "premium" measurable (Phases 6–7):**
10. WCAG AA contrast checker over the derived scheme + a11y lint.
11. Post-generation scorecard auto-fixes for lowest-scoring categories.

**P2 — depth & polish:**
12. Publish pre-flight that warns on missing critical business assets.
13. Per-page meta on crawl; per-section image association.
14. Dedicated components for new section types (emergency CTA, before-after
    gallery, booking widget, map, schedule grid, newsletter signup).

**P3 — advanced:**
15. Video/embed extraction and preservation.
16. Automated design misalignment detection + auto-correction (Phase 5).
