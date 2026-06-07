import { config } from "@/lib/config";
import type { RawCompany, RawFinancialYear, RawManager } from "@/lib/pipeline/raw";

// ─────────────────────────────────────────────────────────────────────────────
// Pappers — private French companies (aggregates INSEE Sirene + INPI + BODACC).
// Docs: https://www.pappers.fr/api/documentation
// Returns null when unconfigured or not found, so callers can fall back.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = "https://api.pappers.fr/v2";

export async function fetchPappersBySiren(siren: string): Promise<RawCompany | null> {
  if (!config.providers.pappersToken) return null;
  const clean = siren.replace(/\s/g, "");

  const url = `${BASE}/entreprise?api_token=${config.providers.pappersToken}&siren=${clean}`;
  let data: any;
  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) return null;
    data = await res.json();
  } catch {
    return null;
  }
  if (!data || !data.nom_entreprise) return null;

  // Map Pappers "finances" (most recent first) → our raw years.
  const finances: any[] = Array.isArray(data.finances) ? data.finances : [];
  const financials: RawFinancialYear[] = finances
    .map((y) => ({
      year: String(y.annee ?? y.date_de_cloture_exercice?.slice(0, 4) ?? ""),
      revenue: num(y.chiffre_affaires),
      // Pappers exposes EBE (excédent brut d'exploitation) ≈ EBITDA on some plans
      ebitda: num(y.EBE ?? y.excedent_brut_exploitation),
      netIncome: num(y.resultat),
    }))
    .filter((y) => y.year)
    .reverse(); // oldest → newest

  const reps: any[] = Array.isArray(data.representants) ? data.representants : [];
  const management: RawManager[] = reps.slice(0, 4).map((r) => ({
    name: [r.prenom, r.nom].filter(Boolean).join(" ") || r.nom_complet || "Dirigeant",
    role: r.qualite ?? "Dirigeant",
  }));

  const siege = data.siege ?? {};
  return {
    source: ["pappers"],
    name: data.nom_entreprise,
    siren: clean,
    website: data.site_web ?? undefined,
    sector: data.libelle_code_naf ?? data.domaine_activite ?? undefined,
    location: [siege.ville, "France"].filter(Boolean).join(", ") || undefined,
    stage: "Private",
    founded: data.date_creation ? Number(String(data.date_creation).slice(0, 4)) : undefined,
    headcount: num(data.effectif_max ?? data.effectif),
    financials,
    cash: num(data.tresorerie),
    debt: num(data.dettes_financieres),
    management,
    sources: [
      { label: "Pappers", url: `https://www.pappers.fr/entreprise/${clean}` },
    ],
  };
}

function num(v: unknown): number | undefined {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? (n as number) : undefined;
}
