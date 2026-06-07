// ─────────────────────────────────────────────────────────────────────────────
// Central configuration & capability flags.
//
// Every external integration is OPTIONAL. When a key is missing the pipeline
// falls back to the deterministic fixtures (lib/data.ts) so the app keeps
// working end-to-end in any environment. Fill the keys in `.env.local` to make
// the analysis real. See `.env.example`.
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  },
  providers: {
    // Private French companies
    pappersToken: process.env.PAPPERS_API_KEY ?? "",
    inseeToken: process.env.INSEE_SIRENE_TOKEN ?? "",
    // Public / listed companies
    marketDataKey: process.env.MARKET_DATA_API_KEY ?? "",
    // Funding rounds (optional enrichment)
    crunchbaseKey: process.env.CRUNCHBASE_API_KEY ?? "",
  },
  ai: {
    anthropicKey: process.env.ANTHROPIC_API_KEY ?? "",
    model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
  },
} as const;

export const capabilities = {
  /** Supabase persistence + auth available. */
  get supabase() {
    return Boolean(config.supabase.url && config.supabase.serviceKey);
  },
  /** Can fetch real private French company data. */
  get privateFr() {
    return Boolean(config.providers.pappersToken || config.providers.inseeToken);
  },
  /** Can fetch real listed-company data. */
  get publicMarket() {
    return Boolean(config.providers.marketDataKey);
  },
  /** LLM qualitative layer available (phase 2). */
  get ai() {
    return Boolean(config.ai.anthropicKey);
  },
};
