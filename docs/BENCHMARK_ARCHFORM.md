# Archform Extraction Benchmark

**Site:** https://archform.framer.website
**Platform:** Framer (detected correctly)
**HTML Size:** 667,980 bytes
**Date:** 2026-06-28

---

## Ground Truth (from raw HTML analysis)

### Real page structure (what a human sees):
1. **Hero** — "Built Different, Built to Last" + full-bleed architecture image
2. **About** — "Design You Can Feel" + two intro paragraphs + 4 images
3. **Our Story** — "Crafting Form with Purpose" + founding story paragraph + image
4. **Selected Projects** — 4 portfolio cards (Elysian Spire, Solara Pavilion, Nebura Heights, Etoile Grand)
5. **Services** — 5 service headings (Architectural Design, Interior Spaces, Urban Planning, Sustainable Solutions, Project Delivery) with images
6. **Process** — "From Vision to Reality" + 4 numbered steps (Discovery & Vision, Concept & Design, Collaboration & Build, Delivery & Impact) with descriptions + images
7. **Collection/Gallery** — "The Arcform Collection" + 5 portfolio images in grid
8. **Journals** — "Beyond the Blueprint" + 3 blog posts (Designing for Timelessness, Spaces that Breathe, The Silence of Form)
9. **CTA** — "Let's Build Together" + contact form/link
10. **Footer** — Brand, address, social links, contact

### Real content inventory:
- **Brand:** Archform
- **Industry:** Architecture studio
- **5 services:** Architectural Design, Interior Spaces, Urban Planning, Sustainable Solutions, Project Delivery
- **4 projects:** Elysian Spire, Solara Pavilion, Nebura Heights, Etoile Grand
- **4 process steps** with descriptions
- **3 journal entries** with images
- **Contact:** +923132518909, creativebasitkhan@gmail.com, 123 Design Avenue, Downtown Dubai, UAE
- **Social:** Instagram, X, LinkedIn
- **Fonts:** Inter (body), Inter Display (headings), Switzer (accent)
- **Colors:** Black (#000) surface, White (#fff) text, Blue (#0099ff) accent
- **Theme:** Dark, premium editorial architecture

### Framer-specific characteristics:
- **3× responsive variants** (Desktop ×86, Tablet ×15, Phone ×16) — every heading, paragraph, and image appears 3 times in the HTML
- **505 `data-framer-name` elements** including named sections: "Section - About", "Section - Our Story", "Section - Projects", "Section - Process", "Section - Journals"
- **319 `RichTextContainer` components**
- **3 Framer design tokens:** `--token-...,#000` / `--token-...,#fff` / `--token-...,#000`
- **Fonts embedded via @font-face:** Inter, Inter Display, Switzer

---

## Dimension-by-Dimension Evaluation

### 1. Navigation Extraction

| Metric | Status | Detail |
|--------|--------|--------|
| Framer text dedup | ✅ PASS | "STUDIOSTUDIO" → "STUDIO" works correctly |
| Nav items | ⚠️ PARTIAL | 7 extracted, 8 real (HOME missing) |
| Spurious items | ❌ FAIL | "Scroll down" included as nav item — it's a scroll indicator, not navigation |
| Path resolution | ✅ PASS | All hrefs correctly resolved |

**Missing:** HOME (same href as ARCHFORM, likely deduped by path — acceptable). "Scroll down" should be filtered.

**Severity: Minor** — Nav is 85% correct; the scroll indicator is cosmetic.

---

### 2. Section Detection and Ordering

| Metric | Status | Detail |
|--------|--------|--------|
| Section count | ❌ FAIL | 10 detected vs 10 real, but they're WRONG sections |
| Section types | ❌ FAIL | "pricing" assigned to services; "features" to everything else |
| Responsive triplication | ❌ CRITICAL | Sections repeated 3× from Desktop/Tablet/Phone variants |
| Section collapse | ⚠️ PARTIAL | Consecutive same-type collapse works, but alternating types survive |
| Named sections | ❌ FAIL | `data-framer-name="Section - Projects"` etc. completely ignored |

**Real sections not detected:**
- Our Story (about/story section)
- Process (4-step workflow)
- Journals (blog section)
- Collection/Gallery
- CTA/Contact ("Let's Build Together")

**Why:** (1) Framer emits each section 3× (Desktop/Tablet/Phone variants), and the pipeline has no Framer-specific variant collapsing. (2) Section type classification uses keyword regex on headings, but "Urban Planning" matches "pricing" heuristic while it's actually a service. (3) `data-framer-name` on `<section>` elements provides the EXACT section identity but is never read.

**Severity: Critical** — The section ordering is the skeleton of the rebuilt site. With wrong sections, layout reconstruction fails.

---

### 3. Hero Extraction

| Metric | Status | Detail |
|--------|--------|--------|
| Hero image | ✅ PASS | Correctly extracted from og:image |
| Headline | ✅ PASS | "Built Different, Built to Last" |
| Sub-headline | ❌ FAIL | Not extracted — the real hero has intro text below the headline |
| CTA button | ❌ FAIL | No CTA detection at all |
| Hero type | ⚠️ PARTIAL | Detected as "hero" section but no sub-components |

**Why sub-headline missed:** pass-content only extracts meta description, not the visual hero sub-text. The real hero has a secondary text block visible on the page that isn't in any meta tag.

**Severity: Major** — Hero is 60% correct. Missing the sub-headline and CTA weakens the premium first impression.

---

### 4. Headlines

| Metric | Status | Detail |
|--------|--------|--------|
| H1 | ✅ PASS | "Built Different, Built to Last" |
| H2 unique headings | ❌ FAIL | Only 4 of 11 unique H2 headings captured |
| Section headings preserved | ❌ FAIL | Tripled headings from responsive variants |

**Real unique H2 headings (11):**
1. "Design You Can Feel" ← ✅ captured
2. "Selected Projects" ← ❌ missed
3. "Crafting Form with Purpose" ← ❌ missed
4. "From Vision to Reality" ← ❌ missed
5. "01 /" through "04 /" ← ❌ missed (process numbering)
6. "The Arcform Collection" ← ❌ missed
7. "Beyond the Blueprint" ← ❌ missed
8. "Let's Build Together" ← ❌ missed

**Why:** The section classifier reads headings for classification but doesn't preserve all of them. Headings attached to unrecognized section types are lost.

**Severity: Major** — Section headings carry the narrative arc of the site.

---

### 5. Description

| Metric | Status | Detail |
|--------|--------|--------|
| Meta description | ✅ PASS | Correctly extracted |
| About body | ❌ FAIL | Not extracted despite real prose on page |
| Story content | ❌ FAIL | Founding story paragraph not captured |

**Real about text:** "Founded in 1998, Archform has grown to become one of Dubai's largest and most distinguished architectural studios..."

**Why:** `extractProse()` looks for about sections with specific heading patterns, but Framer's section naming ("Section - Our Story") uses `data-framer-name` rather than heading text matching the pattern.

**Severity: Major** — About/story content is critical for brand authenticity.

---

### 6. Services

| Metric | Status | Detail |
|--------|--------|--------|
| Service extraction | ❌ CRITICAL | Zero services extracted from page |
| Fallback | ❌ WRONG | Fell back to "Brand identity, Web design, Campaigns, Content" (agency defaults) |
| Real services | ❌ MISSED | Architectural Design, Interior Spaces, Urban Planning, Sustainable Solutions, Project Delivery |

**Why (root cause):** The real services are h3 headings without adjacent `<p>` sibling elements. Framer separates the heading and description into different container divs, so `h.nextElementSibling` never finds a `<p>`. The pass-content code requires `h3 inside a services-headed section with paragraph descriptions`, but Framer's component structure doesn't match this assumption.

Additionally, the h3 services appear 3× (Desktop/Tablet/Phone), and there is no explicit "Services" h2 heading — the section heading is "Crafting Form with Purpose" which doesn't match the `/services|what we do|our services/i` pattern.

**Severity: Critical** — Wrong services = wrong industry positioning = the site looks nothing like the original.

---

### 7. Gallery / Collection

| Metric | Status | Detail |
|--------|--------|--------|
| Image count | ✅ PASS | 25 unique gallery images extracted |
| Image quality | ✅ PASS | All from framerusercontent.com CDN |
| Image dedup | ⚠️ PARTIAL | Some duplicates remain (same image in gallery and project cards) |
| Gallery section | ❌ FAIL | "The Arcform Collection" gallery section not identified |

**Severity: Minor** — Images are captured; the gallery section identification is a section-detection issue.

---

### 8. Images

| Metric | Status | Detail |
|--------|--------|--------|
| Hero image | ✅ PASS | Correct og:image |
| Logo | ✅ PASS | Extracted from img[alt*=logo] pattern |
| Gallery | ✅ PASS | 25 images |
| Image alt text | ⚠️ NOT USED | Alt text present in HTML but not stored in ExtractionResult |
| Background images | ❌ FAIL | Not extracted (Framer uses CSS bg-image in inline styles) |

**Severity: Minor** — Core images are captured. Alt text and bg images would improve reconstruction.

---

### 9. Typography

| Metric | Status | Detail |
|--------|--------|--------|
| Body font (Inter) | ✅ PASS | Detected correctly |
| Heading font (Inter Display) | ❌ FAIL | Detected as "Inter" not "Inter Display" |
| Accent font (Switzer) | ❌ FAIL | Not detected at all |
| Font weights | ✅ PASS | 400, 500, 600, 700, 900 |
| Font stack | ❌ FAIL | Only `"Inter"` reported, should be `"Inter Display", "Switzer"` |

**Why:** `detectHeadingFont()` uses regex `h[1-3][^{]*{[^}]*font-family` to find font-family in CSS rules. But Framer uses `@font-face` declarations + CSS variables (`var(--framer-font-family)`), not direct heading selectors. The `extractFontFaceFonts()` function does find "Inter", "Inter Display", "Switzer" but the resolution logic picks `googleFonts[0] || fontFaceFonts[0]` → "Inter" (first @font-face match), never reaching "Inter Display".

**Severity: Major** — Typography is 50% of premium feel. Getting the heading font wrong makes the rebuild look generic.

---

### 10. Color Palette

| Metric | Status | Detail |
|--------|--------|--------|
| Accent (#0099ff) | ✅ PASS | Correctly detected via `findAccent()` |
| Surface (black) | ❌ FAIL | Not detected |
| Ink (white) | ❌ FAIL | Not detected |
| Framer tokens | ❌ FAIL | `--token-UUID,#000` format not parsed |
| Dark mode | ✅ PASS | Correctly detected |

**Why:** (1) `surfaceColor` detection only checks `body` and `html` inline styles, but Archform has no body style — the black background comes from section-level inline styles. (2) Framer's design token format `var(--token-UUID, fallback)` uses a different pattern than standard `--var-name: value`. The `extractCustomProperties()` regex `/--([\w-]+)\s*:\s*([^;}\n]+)/g` matches standard CSS vars but the Framer token fallback values need a different extraction strategy.

**Severity: Critical** — Without surface/ink colors, `deriveScheme()` can't produce the correct dark theme. The rebuild may default to a light theme or wrong tint.

---

### 11. Design Tokens

| Metric | Status | Detail |
|--------|--------|--------|
| Breakpoints | ✅ PASS | 809, 810, 1200 detected |
| Spacing | ❌ FAIL | Empty |
| Radii | ❌ FAIL | Empty |
| Shadows | ❌ FAIL | Empty |
| Container width | ❌ FAIL | Not detected |

**Why:** Framer puts spacing/radius/shadow values in inline styles, not CSS custom properties. The extractor only looks at CSS vars.

**Severity: Minor** — The generation engine has sensible defaults for these. Nice to have, not blocking.

---

### 12. Motion DNA

| Metric | Status | Detail |
|--------|--------|--------|
| Motion level | ✅ PASS | Level 3 (highest) — correct for this premium site |
| Parallax | ✅ PASS | Detected |
| Hover effects | ✅ PASS | color, background, transform |
| Framer reveals | ⚠️ PARTIAL | Only 3 `data-framer-appear-id` found |
| Stagger | ❌ FAIL | Not detected |
| Scroll-linked | ❌ FAIL | Site has scroll animations but not extracted |

**Severity: Minor** — Motion level is correct; specific animation details are enhancement.

---

### 13. Layout Hierarchy

| Metric | Status | Detail |
|--------|--------|--------|
| Visual flow | ❌ CRITICAL | Section order doesn't match real page |
| Section weights | ❌ FAIL | No concept of section size/visual weight |
| Grid/column detection | ❌ FAIL | Not implemented |
| Full-bleed vs contained | ❌ FAIL | Not distinguished |

**Severity: Critical** — Without correct layout hierarchy, the rebuilt site can't replicate the visual rhythm.

---

### 14. Visual Rhythm

| Metric | Status | Detail |
|--------|--------|--------|
| Spacing patterns | ❌ FAIL | Not extracted |
| Section breathing | ❌ FAIL | Not measured |
| Density variation | ❌ FAIL | Not detected |

**Severity: Minor** — Generation engine applies its own rhythm. Real site rhythm is aspirational.

---

### 15. White Space

| Metric | Status | Detail |
|--------|--------|--------|
| Section padding | ❌ FAIL | Not extracted |
| Content margins | ❌ FAIL | Not extracted |

**Severity: Minor** — Handled by generation engine defaults.

---

### 16. CTA Hierarchy

| Metric | Status | Detail |
|--------|--------|--------|
| Primary CTA | ❌ FAIL | Not detected |
| Secondary CTA | ❌ FAIL | Not detected |
| CTA text | ❌ FAIL | Not extracted |

**Why:** No CTA/button extraction exists in any pass. Archform has "Let's Build Together" as a major CTA section, plus individual project links.

**Severity: Major** — CTAs drive conversion. Missing them means the rebuild has no call-to-action strategy.

---

### 17. Brand Personality

| Metric | Status | Detail |
|--------|--------|--------|
| Brand name | ✅ PASS | "Archform" correct |
| Industry | ⚠️ PARTIAL | "agency" detected, should be "architecture" |
| Logo | ✅ PASS | Found |
| Tagline | ❌ FAIL | Not extracted |
| Brand mood | ❌ FAIL | Not captured (premium, dark, editorial, minimal) |

**Why:** `detectIndustry()` matched "agency" from general keywords. "Architecture" is a sub-industry not in the default profiles, so it falls to "agency" as the closest match.

**Severity: Major** — Wrong industry → wrong service defaults → wrong personality.

---

### 18. Component Mapping

Not applicable at extraction stage — handled by the generation engine. However, the extraction provides the *inputs* for component mapping, and with wrong section types and missing services, the mapping will produce wrong components.

---

### 19. Asset Confidence

| Metric | Status | Detail |
|--------|--------|--------|
| Logo: 0.9 | ✅ CORRECT | Logo was found |
| Images: 0.9 | ✅ CORRECT | 25 images found |
| Colors: 0.2 | ❌ BUG | Should be 0.8 (accent was found) |
| Text: 0.3 | ❌ BUG | Should be 0.9 (headline + description + name all present) |
| Structure: 1.0 | ⚠️ MISLEADING | Structure score is 1.0 but sections are wrong |

**Root cause bug:** `scoreAssetConfidence()` reads from the validation pass's partial `updates` object, NOT from the accumulated `ctx.result`. The validation pass only outputs deduplication changes. Since no services/content were modified during validation, the `updates.content` is undefined → scorer sees no headline/description/name → scores text at 0.3.

**Severity: Critical** — This bug makes the quality score unreliable. The overall score of 64 is wrong; actual extraction quality is probably 45-50 with the bugs, but the confidence reporting is broken.

---

### 20. Framer-Specific Blocks

| Metric | Status | Detail |
|--------|--------|--------|
| Platform detection | ✅ PASS | Correctly identified as Framer |
| Text deduplication | ✅ PASS | "STUDIOSTUDIO" → "STUDIO" |
| Responsive variant collapse | ❌ CRITICAL | 3× triplication not handled for sections/headings/content |
| data-framer-name usage | ❌ CRITICAL | 505 named elements completely ignored |
| Framer token extraction | ❌ FAIL | `--token-UUID,fallback` not parsed |
| Component type awareness | ❌ FAIL | 319 RichTextContainers not leveraged |

**Severity: Critical** — Framer is the #1 source platform. Every Framer site will have these issues.

---

### 21. Duplicate Text Removal

| Metric | Status | Detail |
|--------|--------|--------|
| Nav text dedup | ✅ PASS | Works perfectly |
| Heading dedup | ❌ FAIL | H3s appear 3× (Architectural Design ×3) |
| Paragraph dedup | ❌ FAIL | Paragraphs appear 3× (story text ×3) |
| Service dedup | N/A | Services not extracted |
| Image dedup | ⚠️ PARTIAL | Gallery has unique URLs but same images in different sections |

**Why:** Nav dedup uses `cleanFramerNavItems()` which handles the text-level doubling. But the 3× responsive variant triplication is a *DOM-level* duplication (three separate section trees for Desktop/Tablet/Phone), not text-level. The pipeline has no mechanism to identify and collapse Framer responsive variants.

**Severity: Critical** — This is the single biggest Framer-specific issue. It pollutes every pass.

---

## Issue Classification Summary

### Critical (blocks faithful reproduction)
1. **Framer 3× responsive variant triplication** — sections, headings, images all tripled
2. **Services extraction fails on Framer** — h3 headings without `<p>` siblings
3. **Surface/ink color not extracted** — dark theme can't be reproduced
4. **Section type misidentification** — "pricing" for services, wrong order
5. **Quality scoring bug** — scores partial updates, not accumulated result
6. **`data-framer-name` ignored** — provides exact section identity for free

### Major (degrades quality significantly)
7. **Inter Display heading font missed** — detected as generic "Inter"
8. **Switzer accent font missed** — not detected at all
9. **About/story body text not extracted** — despite being on the page
10. **Industry: "agency" instead of "architecture"** — wrong defaults
11. **No CTA extraction** — missing conversion elements
12. **Section headings lost** — 7 of 11 unique H2s not preserved
13. **Projects mixed with journals** — extractProducts() can't distinguish

### Minor (polish, not blocking)
14. **"Scroll down" in nav** — should be filtered
15. **Spacing/radii/shadows empty** — generation engine has defaults
16. **Visual rhythm not measured** — aspirational
17. **Image alt text not stored** — useful for accessibility
18. **Framer reveal animations incomplete** — motion level is correct

---

## Prioritized Roadmap to 95% Extraction Fidelity

### Phase 1: Framer Variant Collapsing (fixes #1, #21) — **Impact: +25%**

**Problem:** Framer emits Desktop/Tablet/Phone variants as separate DOM trees. Everything triples.

**Deterministic solution:** Add a Framer-specific pre-processing pass that runs *before* all other passes:

```
1. Find all elements with data-framer-name="Desktop" | "Tablet" | "Phone"
2. For each group that shares a parent <section>, keep only "Desktop", remove "Tablet" and "Phone"
3. This collapses the DOM from 668KB to ~250KB and eliminates all triplication
```

Implementation: New `pass-framer.ts` (Pass 0) that mutates `ctx.root` before other passes run.

### Phase 2: Framer Section Identity (fixes #4, #6, #12) — **Impact: +15%**

**Problem:** Section classification uses keyword regex on headings, which misidentifies architecture headings.

**Deterministic solution:** For Framer sites, read `data-framer-name` on `<section>` elements:
- `"Section - About"` → type: "about"
- `"Section - Our Story"` → type: "story"
- `"Section - Projects"` → type: "portfolio"
- `"Section - Process"` → type: "process"
- `"Section - Journals"` → type: "blog"

Fallback to heading-based classification only when `data-framer-name` is absent.

### Phase 3: Quality Scoring Fix (fixes #5) — **Impact: +5%**

**Bug:** `scoreQuality()` and `scoreAssetConfidence()` read from the validation pass's partial updates instead of `ctx.result`.

**Fix:** Change `scoreQuality(validated)` → `scoreQuality(ctx.result)` and same for `scoreAssetConfidence`. One-line fix.

### Phase 4: Service Extraction for Framer (fixes #2) — **Impact: +15%**

**Problem:** Framer separates h3 and description into different container divs, breaking `nextElementSibling` traversal.

**Deterministic solution:** For Framer sites, use `data-framer-name` to find service-like containers:
1. Look for containers with `data-framer-name="accordians"` or siblings that repeat a heading + text pattern
2. Walk the Framer component tree (parent containers with repeated child structures)
3. Extract title from the heading element and description from the next text container in the same parent

Additionally: look at `data-framer-name` on the section. If section name contains "service" or the section heading matches service patterns, extract all h3 children as services even without adjacent `<p>` tags.

### Phase 5: Color Extraction for Framer (fixes #3) — **Impact: +10%**

**Problem:** Framer's design tokens use `var(--token-UUID, fallback)` format and surface colors are in section-level inline styles.

**Deterministic solutions:**
1. Parse Framer token format: regex `var\(--token-[\w-]+,\s*([^)]+)\)` → extract fallback values
2. Map token UUIDs to semantic roles by examining which CSS properties use them (text-color → ink, background → surface)
3. For surface color: scan section-level `background: rgb(0,0,0)` inline styles, weighted by first/largest section
4. For ink: check `--framer-text-color` variable declarations

### Phase 6: Typography Fix (fixes #7, #8) — **Impact: +5%**

**Problem:** Font resolution picks first @font-face ("Inter") instead of distinguishing display/body/accent.

**Deterministic solutions:**
1. Parse Framer font-family declarations that reference specific font names:
   - `"Inter Display", sans-serif` in heading contexts → headingFont = "Inter Display"
   - `"Switzer", sans-serif` in accent contexts → accentFont = "Switzer"
2. In `extractFontFaceFonts()`, when multiple fonts found, use heuristics:
   - "Display" in name → heading font
   - Different from base font → accent/secondary font
3. Return the full font stack, not just the first match

### Phase 7: About/Story Extraction (fixes #9) — **Impact: +5%**

**Deterministic solution:** After Phase 2 provides correct section types:
1. If section type is "story" or "about", extract all `<p>` content with length > 40 chars
2. Concatenate into `aboutBody`, deduplicating paragraphs that appear in multiple responsive variants

### Phase 8: CTA Extraction (fixes #11) — **Impact: +3%**

**Deterministic solution:** New extraction in pass-content:
1. Find `<a>` elements with button-like characteristics: short text (< 30 chars), classes containing "btn"/"button"/"cta", or visual styling (background-color + padding)
2. Find sections with CTA-like headings ("Let's Build", "Get Started", "Contact")
3. Store as `content.ctas: { text: string; href: string; primary: boolean }[]`

### Phase 9: Industry Refinement (fixes #10) — **Impact: +2%**

**Deterministic solution:** Add "architecture" as a distinct industry in `industries.ts` with keywords: `architect, architecture, building, construction, design studio, urban planning, interior design, landscape`. This would match Archform correctly.

### Phase 10: Project/Journal Separation (fixes #13) — **Impact: +3%**

**Deterministic solution:** When `extractProducts()` finds items, classify by URL path:
- `/projects/*` → projects
- `/journals/*` or `/blog/*` → journal entries (store separately)
- Product items with price → products

---

## Fidelity Scores

| Dimension | Current Score | After Phase 1-3 | After Full Roadmap |
|-----------|-------------|-----------------|-------------------|
| **Content Fidelity** | **38%** | 55% | 90% |
| **Design Fidelity** | **25%** | 35% | 85% |
| **Layout Fidelity** | **20%** | 55% | 88% |
| **Brand Fidelity** | **52%** | 60% | 92% |
| **Framer Compatibility** | **28%** | 70% | 95% |
| **Production Readiness** | **30%** | 55% | 90% |

### Current weighted average: **32%**
### After Phase 1-3 (quick wins): **55%**
### After full roadmap: **90%**

The remaining 5% to reach 95% would require:
- Scroll-linked animation detection
- Grid/column layout inference
- Visual weight/density analysis
- These likely need a rendering pass (headless browser) rather than static HTML parsing

---

## Critical Path (do these first)

1. **Phase 1** (Framer variant collapsing) — single biggest impact, unblocks everything
2. **Phase 3** (quality scoring bug fix) — one-line fix, immediate correctness improvement
3. **Phase 2** (Framer section identity) — unlocks correct section ordering
4. **Phase 4** (service extraction) — stops wrong industry defaults from appearing
5. **Phase 5** (color extraction) — enables correct dark theme reproduction
