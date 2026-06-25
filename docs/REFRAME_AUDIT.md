# ReFrame — Premium Quality Audit

A grounded, file-referenced audit of the platform against the "premium agency
quality" bar. Ranked by impact. Honest status — strengths and weaknesses both.

> Method: three parallel code audits (component catalog, AI editor, perf/SEO/
> export/confidence), each cross-checked against the source. Counts and bugs
> below are verified in code, not assumed.

---

## What is already strong (keep it)

- **Brand-token discipline.** Components render from CSS vars (`--brand*`); the
  scheme is derived from one brand colour for both light + dark. (`themeVars`/
  `themeCss`, `index.tsx`.)
- **Automatic dark mode** — source-derived default + `prefers-color-scheme`
  auto-flip, no FOUC.
- **WCAG AA contrast guaranteed** in the colour system (body ink ≥4.5, accent
  label ink). (`color.ts`.)
- **Zero-fabrication guardrails** — testimonials/stats/FAQ/team/menu only render
  when real data exists; the AI editor *refuses* to invent testimonials.
- **Export with zero vendor lock-in** — portable static HTML + bundled images +
  `mailto:` forms, no runtime. (`export-site.ts`, `export-html.ts`.)
- **SEO basics present** — JSON-LD `LocalBusiness/Organization` on published
  sites, per-page metadata + OG, **and `sitemap.xml` + `robots.txt` route
  handlers exist** (`src/app/sitemap.xml/route.ts`, `src/app/robots.txt/route.ts`).
- **Extraction breadth** — content, images, logo, colour, contact, integrations,
  + (recent) testimonials, FAQ, social, fonts, menu/pricing, team. All gated.
- **Catalog is broad** — 44 variants; most spec targets are MET (see below).

## Component-target reality check (most targets already met)

| Category | Have | Target | Status |
|---|---|---|---|
| Heroes | **11** | ≥10 | ✅ |
| Testimonials | **5** | ≥5 | ✅ |
| CTA | **5** | ≥5 | ✅ |
| Gallery/Portfolio | **5** | ≥5 | ✅ |
| Contact | **3** | ≥3 | ✅ |
| Footer | **3** | ≥3 | ✅ |
| **Features** | **5** | ≥8 | ❌ **−3** |
| Stats / Team / FAQ | **1 each** | — | ⚠️ single-variant (templating risk) |

---

## CRITICAL (fix first — they undercut the core promises)

**C1 — Hero LCP: 5 image-led heroes paint via CSS `background-image`, not `<img>`.**
`HeroImageFull` (`index.tsx:1813`), `HeroMonumental` (`:2075`), `HeroPremium2`
(`:366`), `AboutSplit` (`:1382`), `StatementEditorial` (`:1559`) use
`bg-cover` divs. Background images are invisible to the preload scanner → late
LCP → fails the **Lighthouse 90+ / CWV-green** target on exactly the most
important (hero) image. `CoverImage` (real `<img>`, eager + `fetchpriority=high`)
already exists and is used by `HeroPremium1`, `TeamGrid`, `GalleryFeature`.
*Fix:* route the hero/feature image through `CoverImage` with `priority` on the
hero. High impact on the headline metric.

**C2 — AI editor lies about SEO.** The `seo|search|google|ranking` branch returns
`changed:false` but a message claiming "Optimized metadata, heading hierarchy and
semantic structure" (`engine.ts:~2599`). It performs **nothing** while telling the
owner it did. That's a trust violation. *Fix:* either perform a real SEO pass
(title/description/headings) or say plainly it's automatic and needs no action.

**C3 — Hardcoded colours break on some brands / dark mode.** Verified:
`text-neutral-500` (HeroPremium2 `:337`, HeroSpotlight `:974`), `bg-white` button
(CTASection1 `:739`), `text-red-600` error (ContactFormPremium1 `:856`),
`bg-white text-black` badge (ProductGrid `:2151`). On a dark brand or a pale
surface these go invisible/clash. *Fix:* map to brand tokens (add `--brand-error`).
Small change, real correctness/trust bug.

---

## HIGH IMPACT

**H1 — Per-asset extraction confidence (the spec explicitly asks for it).** Today
only a coarse `confidence: full|partial|fallback` + 5 audit scores exist
(`types.ts`, `engine.ts:512`). No confidence for **logo / images / colours / text
/ structure** individually. *Fix:* attach a 0–1 confidence per asset, surface it
internally, and drive an **intelligent recovery workflow** that asks the owner
only for the low-confidence pieces (never fabricates).

**H2 — "Action AI" coverage is thin without an LLM key.** The deterministic editor
handles ~10 intents (hero title, add/remove FAQ/contact/CTA, dark/light, accent,
mood, animations) but NOT "improve hero", "modernize", "improve conversion",
"add services/about/stats", "change layout". These only work via the LLM fallback
(needs `ANTHROPIC_API_KEY`). *Fix:* broaden the deterministic actions and make the
LLM path the default for open-ended asks, always *performing* the change.

**H3 — Features below target (5 vs 8) + single-variant Stats/Team/FAQ.** Repetition
across generated sites is the #1 "template feel" risk. *Fix:* +3 premium Features
variants; +1 alternate each for FAQ (appears on most sites), Stats, Team.

**H4 — Image delivery isn't optimised.** The proxy streams original bytes (no
resize, no WebP/AVIF) and `next.config` allows all remote hosts with no device
sizing (`api/img/route.ts:70`, `next.config.mjs`). Oversized mobile images hurt
CWV. *Fix:* add width/format params to the proxy (or route published images
through `next/image`).

---

## QUICK WINS (high ratio, low risk)

**Q1 — Catalog parity:** `ProductGrid` is in the REGISTRY but has **no catalog
entry** (orphan, confirmed). Add the entry (so the selector can pick it) or remove
the component.

**Q2 — Fix the 4 hardcoded colours (C3)** — mechanical, ~30 min, removes a class
of dark/brand bugs.

**Q3 — Static-export JSON-LD is minimal** (Organization only; `export-html.ts:135`)
while published sites emit full `LocalBusiness`. Reuse `buildJsonLd()` in the
export so downloaded sites keep the richer structured data.

**Q4 — Heading-hierarchy guard:** some heroes emit `<h2>` not `<h1>`
(`StatementEditorial`), risking a page with no/duplicate h1. Add a render-time
assert (one h1 per page).

---

## LONG TERM

**L1 — Automated quality scorecard + "improve-until-premium" loop** (the `/100`
audit in the product vision; P1-2). Score Typography/Spacing/Hierarchy/Images/
A11y/Responsive/Conversion/Consistency post-generation and auto-fix the lowest.

**L2 — Image optimisation pipeline** (resize + AVIF/WebP) behind the proxy, with a
CDN cache — pairs with C1/H4 to actually hit Lighthouse 90+.

**L3 — Dynamic-site extraction reliability** (React/Next/Shopify/Webflow): the
headless render exists (Browserless/Playwright) but isn't measured; add per-engine
success metrics + the recovery workflow from H1.

**L4 — Lighthouse CI gate** so the 90+ target is enforced, not aspirational.

---

## Suggested execution order

1. **Q1 + Q2 + C2** (one small commit each): parity, hardcoded colours, SEO honesty
   — fast trust/correctness wins.
2. **C1**: heroes → `CoverImage` (the biggest single CWV lever).
3. **H1**: per-asset confidence + recovery workflow.
4. **H3**: +3 Features, FAQ/Stats/Team alternates.
5. **L1**: the quality scorecard (already the next P1 item).

Goal restated: a business owner should prefer the ReFrame version ≥80% of the
time, and each site should feel like a several-thousand-dollar custom redesign.
The gaps above are what stand between "very good" and that bar.
