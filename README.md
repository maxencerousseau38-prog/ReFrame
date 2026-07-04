# ReFrame

Paste a link. ReFrame analyzes your existing website, rebuilds it into a fast,
modern version of itself, and lets you refine everything by chatting. Live in
minutes.

> An editorial, AI-tech product surface inspired by Framer / Linear / Apple.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** with a dark, single-accent (cyan) design system
- **Geist** + Geist Mono (`geist`), **Phosphor** icons (one family)
- **Framer Motion** for scroll reveals, parallax and physical transitions
- **node-html-parser** for the real website crawl
- **Node.js** API routes (drop-in points for an LLM, Auth and a DB)

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
│   ├── page.tsx                 # Landing: hero, before/after slider, AI engine,
│   │                            #   templates, results, CTA, footer
│   ├── dashboard/page.tsx       # URL -> live crawl + audit -> generate
│   ├── result/page.tsx          # Before/after preview, publish, edit-with-AI
│   ├── editor/page.tsx          # AI chat editor + live preview
│   ├── globals.css              # Design tokens (OLED base, cyan accent)
│   └── api/
│       ├── analyze-url/         # POST  real crawl + audit of the source site
│       ├── generate-site/       # POST  build a SiteSchema from the analysis
│       ├── ai-edit/             # POST  apply a natural-language edit
│       └── publish-site/        # POST  simulate edge deployment
├── components/
│   ├── ui/                      # Bezel, IslandButton, BlurReveal, Button, ...
│   ├── landing/                 # navbar, hero, compare, engine-viz, templates,
│   │                            #   results, cta, footer
│   ├── dashboard/               # shell (sidebar) + analyze loader
│   └── blocks/                  # generated-site template library + SiteRenderer
└── lib/
    ├── generation/
    │   ├── types.ts             # SiteSchema, Block, Theme, SiteAnalysis
    │   ├── industries.ts        # sector detection + per-sector theming
    │   └── engine.ts            # analyzeUrl (real crawl) · generateSite · applyAiEdit
    ├── store.ts                 # client persistence for the demo flow
    └── utils.ts
```

## How it works

1. **Analyze** (`/api/analyze-url`) — fetches the live page and parses real HTML:
   brand, logo, accent color, hero/content images, nav labels, headline and
   description. Audit scores come from real signals (viewport tag, meta
   description, h1, canonical, OG, alt-text ratio, lang, asset counts, legacy
   markup). Thin JS shells and unreachable sites fall back to a deterministic
   profile (shown as "Estimated").
2. **Generate** (`/api/generate-site`) — assembles a coherent `SiteSchema` from
   a vetted block library using the detected sector's preferred variants, and
   keeps the source brand recognisable (extracted accent + hero image).
3. **Edit** (`/api/ai-edit`) — a deterministic intent router (the slot where a
   real LLM call lives in production) interprets plain-English instructions.
4. **Publish** (`/api/publish-site`) — simulates an edge deploy.

## Production next steps

- Swap `applyAiEdit` for a real LLM call (Claude) behind an API key.
- Add Auth + persist projects in a database instead of `sessionStorage`.
- Make `publish-site` a real export / edge deploy with custom domains.

## Graphify (knowledge graph)

The repo maintains a code knowledge graph in `graphify-out/` (gitignored,
auto-rebuilt by a post-commit hook — see `graphify hook status`).

- **Rebuild from scratch**: `graphify src` (code-only; docs/images need an
  LLM key — see `.env.example`, no code change required)
- **Incremental update**: `graphify update .` (AST-only, no API cost)
- **Query the architecture**: `graphify query "how is the DNA resolved?"`,
  `graphify explain "resolveTree"`, `graphify path "captureSite" "runPipeline"`
- **Diagrams**: `graphify export callflow-html` (Mermaid architecture/call-flow)

Agents: the rules in `CLAUDE.md` make Claude Code query the graph before
reading raw sources, and refresh it after code changes.
