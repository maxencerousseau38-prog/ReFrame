# ReFrame — Reconstruction Gap Analysis (Spec vs Engine)

Status of the 10-phase "Ultimate Premium" doctrine against the current codebase.
Legend: ✅ done · 🟡 partial · ❌ missing. File refs are the place to change.

> Honesty note: the spec targets **90% extraction / 10% AI**. We are **not there
> yet** — extraction is solid on the basics but drops several real-content types
> (FAQ, social, fonts, team, menu) and several phases are heuristic-light.

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
| **Testimonials** | ✅ (new) | `extractTestimonials` — JSON-LD + DOM |
| **Dark source detection** | ✅ (new) | `detectSourceDark` → theme default |
| **FAQ content** | ❌ | structure detected, but Q&A never read → uses generic `defaultFaq` (borderline filler) |
| **Social links** | ❌ | no `a[href*=instagram/linkedin/…]` collection |
| **Fonts / typography** | ❌ | source typefaces not captured |
| **Team / people** | ❌ | no extraction |
| **Menu / pricing tables** (`collection`) | ❌ | declared in types, never extracted |
| **Per-page `<title>`/meta on crawl** | ❌ | homepage meta only |
| **Videos / embeds** | ❌ | not tracked |

## Phase 2 — Business analysis & audit  ·  🟡

`detectIndustry` + `INDUSTRY_PROFILES` (`industries.ts`); `analysis.scores`
(design/perf/seo/mobile/accessibility) + `issues`.
- ✅ Industry detection, positioning defaults, audit scores exist (the `/100`
  audit in the spec image is partially real).
- 🟡 Audit is coarse; not surfaced as the explicit per-category scorecard the spec
  shows. Audience/conversion-goal modelling is implicit.

## Phase 3 — Hero  ·  ✅ (recently elevated)

`src/components/blocks/index.tsx` hero family; `catalog.ts`.
- ✅ Rich premium hero set; `HeroImageFull` / `HeroMonumental` reworked to the
  Havenn editorial bar; primary+secondary CTA; brand-derived; responsive.
- 🟡 Trust indicators in-hero only when real (stats); could add logo/rating rows
  when genuinely extracted.

## Phase 4 — Premium component mapping  ·  🟡

`pickVariant` (`catalog.ts`) maps every section to a scored variant (sector + mood
+ brand jitter).
- ✅ Deterministic, varied, never-random mapping.
- ⚠️ Reality check vs spec: components are **ReFrame-original Tailwind**, *inspired
  by* shadcn/Magic UI/Aceternity — they are **not** literally built on the shadcn
  primitives. The `shadcn-ui` skill informs patterns; output stays bespoke. Either
  (a) accept "shadcn-grounded in spirit", or (b) a real refactor onto shadcn — big.

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

## Phase 7 — Quality pass  ·  ❌ (mostly missing)

- 🟡 `analysis.scores` exist as input audit.
- ❌ No post-generation scorecard (Typography/Spacing/Hierarchy/Images/A11y/
  Responsive/Conversion/Consistency) and no "improve-until-premium" loop.

## Phase 8 — Business-asset detection  ·  ✅ / 🟡

- ✅ `detectIntegrations` covers Stripe/PayPal/Calendly/HubSpot/Intercom/Crisp/
  GA4/GTM/Meta Pixel/Mailchimp/booking.
- 🟡 "Warn before publishing if a critical asset is missing" is not surfaced in the
  publish flow as a blocking pre-flight.

## Phase 9 — SEO preservation  ·  🟡

`routePath` (nested-path preservation), `src/lib/server/seo.ts`.
- ✅ URL/path continuity, titles/descriptions, sitemap/robots.
- 🟡 Structured data (JSON-LD) is read but not re-emitted on the rebuild; internal
  linking preservation is partial.

## Phase 10 — Publishing  ·  ✅

Analyze → rebuild → AI-edit → publish (`/api/publish-site`) → connect domain
(`vercel-domains`) → live. Backend now durable (Supabase) + Supabase Auth.

---

## Prioritized backlog

**P0 — close the extraction gap (Phase 1), highest fidelity-per-effort, low risk:**
1. **Real FAQ** extraction → replace generic `defaultFaq` (kills filler).
2. **Social links** → footer icons (small renderer wire-up).
3. **Fonts** capture → optionally preserve the source typeface in the theme.
4. **Menu / pricing `collection`** extraction (tables / `dl`) for restaurants & pricing.
5. **Team / people** extraction for agencies/health/pro-services.

**P1 — make "premium" measurable (Phases 6–7):**
6. **WCAG AA contrast checker** over the derived scheme + a generation-time a11y
   lint (alt text, labels, focus), driven by `web-design-guidelines`.
7. **Post-generation scorecard** (8 categories) + targeted auto-fixes for the
   lowest-scoring categories.

**P2 — depth & polish:**
8. Re-emit JSON-LD structured data on the rebuild (Phase 9).
9. Publish pre-flight that **warns** on missing critical business assets (Phase 8).
10. Per-page meta on crawl; per-section image association.

Each P0/P1 item is a focused, tested change in `engine.ts` (+ a small renderer
or type touch). Recommend executing P0 in one batch (one extractor + test each),
verifying via `/zpreview`, then P1.
