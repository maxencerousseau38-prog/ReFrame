# ReFrame

Turn any website into a modern, premium, AI-editable experience. Paste a URL →
the engine analyzes the site → it rebuilds it from a library of premium UI blocks
→ you refine everything with a built-in AI editor → publish instantly.

> A Silicon-Valley-grade SaaS scaffold (Framer / Linear / Stripe aesthetic).

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** with a Shadcn-style design system
- **Framer Motion** for animations & micro-interactions
- **React Three Fiber / Three.js** for the subtle 3D hero
- **Node.js** API routes (drop-in points for Supabase / Postgres + Auth)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Architecture

```
src/
├── app/
│   ├── page.tsx                 # Landing page (hero, how-it-works, before/after,
│   │                            #   features, pricing, testimonials, CTA, footer)
│   ├── dashboard/page.tsx       # URL input → analysis → premium loader → audit
│   ├── result/page.tsx          # Before/after preview, publish, edit-with-AI
│   ├── editor/page.tsx          # AI chatbot editor + live preview
│   ├── globals.css              # Design tokens & premium utilities
│   └── api/
│       ├── analyze-url/         # POST  analyze an existing site
│       ├── generate-site/       # POST  build a SiteSchema from analysis
│       ├── ai-edit/             # POST  apply a natural-language edit
│       └── publish-site/        # POST  simulate edge deployment
├── components/
│   ├── ui/                      # Button, Card, Input, Badge, Accordion, Reveal
│   ├── landing/                 # All landing-page sections
│   ├── dashboard/               # Shell (sidebar) + premium analyze loader
│   ├── three/hero-scene.tsx     # Subtle R3F hero object
│   └── blocks/                  # Template library + <SiteRenderer/>
└── lib/
    ├── generation/
    │   ├── types.ts             # SiteSchema, Block, Theme, SiteAnalysis
    │   ├── industries.ts        # Sector detection + per-sector theming
    │   └── engine.ts            # analyzeUrl · generateSite · applyAiEdit
    ├── store.ts                 # Client persistence for the demo flow
    └── utils.ts
```

## How generation works

Generation is **never random**. The engine:

1. **Analyzes** the URL — fetches the page (best-effort), detects the industry
   from keyword signals, extracts headline/description/services, and produces a
   design/performance/SEO/mobile/accessibility audit. Falls back to a
   deterministic profile when a site can't be fetched.
2. **Selects** premium blocks (`HeroPremium1/2`, `FeaturesGrid1`,
   `TestimonialsSlider1`, `FAQAccordion1`, `CTASection1`, `ContactFormPremium1`,
   `Footer1`) using the detected sector's preferred variants and theme.
3. **Assembles** a coherent `SiteSchema` (typed, ordered blocks + theme) that
   `<SiteRenderer/>` renders into a real, themed site.

## The AI editor

`applyAiEdit()` is a deterministic intent router — the slot where a real LLM call
lives in production. It already handles:

- "Change hero title to …"
- "Add an FAQ / testimonials / contact / CTA section"
- "Remove the … section"
- "Change the accent color to teal/violet/…"
- "Make it more premium / bold / elegant"
- "Improve SEO / conversion"

## Production next steps

- Swap `applyAiEdit` / `analyzeUrl` internals for real LLM + crawler calls.
- Add Auth (NextAuth or Supabase Auth) and persist projects in Supabase/Postgres
  instead of `sessionStorage`.
- Wire `publish-site` to a real edge deploy + custom domains.
- Upgrade to Next.js 16 / React 19 when migrating R3F to v9 to clear remaining
  framework CVEs flagged by `npm audit`.
